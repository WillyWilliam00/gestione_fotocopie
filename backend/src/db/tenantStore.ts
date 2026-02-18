import { and, asc, desc, eq, ilike, ne, type AnyColumn } from "drizzle-orm";
import { createUtenteSchema, docentiQuerySchema, insertDocenteSchema, insertRegistrazioneSchema, modifyDocenteSchema, modifyUtenteSchema, registrazioniCopieQuerySchema, utentiQuerySchema, type CreateUtente, type DocentiQuery, type InsertDocente, type InsertRegistrazione, type ModifyDocente, type ModifyUtente, type RegistrazioniCopieQuery, type UtentiQuery } from "../../../shared/validation.js"
import { docenti, registrazioniCopie, utenti } from "./schema.js";
import type { DocentiPaginatedResponse, DocentiSort, SortOrder, UtentiPaginatedResponse, UtentiSort, Utente, RegistrazioniCopieSort, RegistrazioniCopiePaginatedResponse } from "../../../shared/types.js";
import { SQL, sql } from "drizzle-orm";
import type { ErrorWithStatus } from "../middleware/auth.js";
import bcrypt from 'bcrypt';
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import { buildPagination } from "./utils/pagination.js";
import { wouldExceedLimit } from "./utils/limiti.js";
import { stripUndefined } from "./utils/object.js";
import { getSort } from "./utils/sort.js";
import { isEmailIdentifier } from "./utils/auth.js";

// Tipo helper per estrarre il tipo della transazione dal database
type DbInstance = NodePgDatabase<typeof schema>;
type Transaction = Parameters<Parameters<DbInstance['transaction']>[0]>[0];
export const createTenantStore = (istitutoId: number, db: DbInstance | Transaction) => {

    const docentiStore = {
    
            getPaginated: async (query: DocentiQuery) => {

                const { page, pageSize, nome, cognome, sortField, sortOrder } = docentiQuerySchema.parse(query);
                const offset = (page - 1) * pageSize;



                const conditions = [eq(docenti.istitutoId, istitutoId)];
                if (nome) conditions.push(ilike(docenti.nome, `%${nome}%`));
                if (cognome) conditions.push(ilike(docenti.cognome, `%${cognome}%`));

                const copieSubquery = db
                    .select({
                        docenteId: registrazioniCopie.docenteId,
                        totaleCopie: sql<number>`SUM(${registrazioniCopie.copieEffettuate})::int`.as('totale_copie')
                    })
                    .from(registrazioniCopie)
                    .where(eq(registrazioniCopie.istitutoId, istitutoId))
                    .groupBy(registrazioniCopie.docenteId)
                    .as('copie_totali');

                const sortMap: Record<DocentiSort['field'], AnyColumn | SQL> = {
                    nome: docenti.nome,
                    cognome: docenti.cognome,
                    limiteCopie: docenti.limiteCopie,
                    // Aliased fields (totaleCopie) non sono visti da TS come SQL,
                    // quindi li castiamo esplicitamente a SQL per soddisfare il tipo.
                    copieEffettuate: copieSubquery.totaleCopie as unknown as SQL,
                    copieRimanenti: sql<number>`GREATEST(0, ${docenti.limiteCopie} - COALESCE(${copieSubquery.totaleCopie}, 0))::int` as unknown as SQL,
                }
                const sortKey = (sortField || 'nome') as DocentiSort['field'];
                const orderByColumn = sortMap[sortKey];
                const result = await db.select({
                    id: docenti.id,
                    nome: docenti.nome,
                    cognome: docenti.cognome,
                    limiteCopie: docenti.limiteCopie,
                    istitutoId: docenti.istitutoId,
                    createdAt: docenti.createdAt,
                    updatedAt: docenti.updatedAt,
                    copieEffettuate: sql<number>`COALESCE(${copieSubquery.totaleCopie}, 0)::int`.as('copie_effettuate'),
                    copieRimanenti: sql<number>`GREATEST(0, ${docenti.limiteCopie} - COALESCE(${copieSubquery.totaleCopie}, 0))::int`.as('copie_rimanenti')
                })
                    .from(docenti)
                    .leftJoin(copieSubquery, eq(docenti.id, copieSubquery.docenteId))
                    .where(and(...conditions))
                    .limit(pageSize)
                    .offset(offset)
                    .orderBy(getSort(orderByColumn, sortOrder))
                
                const [totalCount] = await db.select({valore:sql`count(*)::int`}).from(docenti).where(and(...conditions));

                const totalItems = Number(totalCount?.valore ?? 0);
                const response: DocentiPaginatedResponse = {
                    data: result,
                    pagination: buildPagination(page, pageSize, totalItems),
                }

                return response;
            },
            create: async (data: Omit<InsertDocente, 'istitutoId'>) => {
                const { nome, cognome, limiteCopie } = insertDocenteSchema.parse({...data, istitutoId});
                const [nuovoDocente] = await db
                .insert(docenti)
                .values({nome, cognome, limiteCopie, istitutoId})
                .returning()

                if (!nuovoDocente) {
                    const error = new Error('Errore nella creazione del docente') as ErrorWithStatus;
                    error.status = 500;
                    throw error;
                }
                return nuovoDocente
            },
            update: async(id: number, data: Omit<ModifyDocente, 'istitutoId'>) => {
                const validateData = modifyDocenteSchema.parse({...data});
                const updateValues: Partial<typeof docenti.$inferInsert> = {
                    updatedAt: new Date(),
                };
                Object.assign(updateValues, validateData);
                const cleanUpdateValues = stripUndefined(updateValues);
                const [docenteAggiornato] = await db
                .update(docenti)
                .set(cleanUpdateValues)
                .where(and(eq(docenti.id, id), eq(docenti.istitutoId, istitutoId)))
                .returning()
                if (!docenteAggiornato) {
                    const error = new Error('Docente non trovato') as ErrorWithStatus;
                    error.status = 404;
                    throw error;
                }
                return docenteAggiornato
                
            },
            delete: async(id: number) => {
                const [docenteEliminato] = await db.delete(docenti)
                .where(and(eq(docenti.id, id), eq(docenti.istitutoId, istitutoId)))
                .returning({id: docenti.id})
                if (!docenteEliminato) {
                    const error = new Error('Docente non trovato') as ErrorWithStatus;
                    error.status = 404;
                    throw error;
                }
                return docenteEliminato.id
            },
            checkLimiteCopie: async(docenteId: number, nuoveCopie: number, tx?: typeof db) => {
                const dbInstance = tx || db;
                const [stats] = await dbInstance
                .select({
                    limite: docenti.limiteCopie,
                    copieEffettuate: sql<number>`COALESCE(SUM(${registrazioniCopie.copieEffettuate}), 0)::int`
                })
                .from(docenti)
                .leftJoin(registrazioniCopie, and(eq(docenti.id, registrazioniCopie.docenteId), eq(registrazioniCopie.istitutoId, istitutoId)))
                .where(
                    and(
                        eq(docenti.id, docenteId),
                        eq(docenti.istitutoId, istitutoId),
                    )
                ).groupBy(docenti.id)
                if(!stats) {
                    const error = new Error('Docente non trovato') as ErrorWithStatus;
                    error.status = 404;
                    throw error;
                }
                if (wouldExceedLimit(stats.copieEffettuate, nuoveCopie, stats.limite)) {
                    const error = new Error('Limite di copie superato') as ErrorWithStatus;
                    error.status = 400;
                    throw error;
                }
                return true;
            }
        
    }

    return {
        docenti: docentiStore,
        utenti: {
            getPaginated: async(query: UtentiQuery) => {
                const { page, pageSize, identifier, ruolo, sortField, sortOrder } = utentiQuerySchema.parse(query);
                const offset = (page - 1 ) * pageSize;
                const isEmail = identifier ? isEmailIdentifier(identifier) : false;

                const condition = [eq(utenti.istitutoId, istitutoId)];
                if (identifier) {
                    if (isEmail) condition.push(ilike(utenti.email, `%${identifier}%`));
                    else condition.push(ilike(utenti.username, `%${identifier}%`));
                }
                if (ruolo) condition.push(eq(utenti.ruolo, ruolo));

                const sortMap: Record<UtentiSort['field'], AnyColumn | SQL> = {
                    username: utenti.username,
                    email: utenti.email,
                    ruolo: utenti.ruolo,
                }
                const sortKey = (sortField || 'ruolo') as UtentiSort['field'];
                const orderByColumn = sortMap[sortKey];
                const result = await db.select({
                    id: utenti.id,
                    username: utenti.username, 
                    email: utenti.email,
                    ruolo: utenti.ruolo,
                    createdAt: utenti.createdAt,
                    updatedAt: utenti.updatedAt,
                    istitutoId: utenti.istitutoId,
                })
                .from(utenti)
                .where(and(...condition))
                .limit(pageSize)
                .offset(offset)
                .orderBy(getSort(orderByColumn, sortOrder))

                const [totalCount] = await db.select({valore: sql`count(*)::int`}).from(utenti).where(and(...condition));

                const totalItems = Number(totalCount?.valore ?? 0);
                const response: UtentiPaginatedResponse = {
                    // Type assertion sicuro: il constraint del database garantisce che
                    // admin ha email non-null e collaboratore ha username non-null
                    data: result as Utente[],
                    pagination: buildPagination(page, pageSize, totalItems),
                }
                return response;
            },
            create: async(data: Omit<CreateUtente, 'istitutoId'>) => {
                const validateData = createUtenteSchema.parse(data);
                const isAdmin = validateData.ruolo === 'admin';
                const utenteEsistente = await db.select().from(utenti)
                .where(
                    isAdmin ?
                        eq(utenti.email, validateData.email) :
                        eq(utenti.username, validateData.username)
                )
                if(utenteEsistente.length > 0) {
                    const error = new Error('Utente già esistente') as ErrorWithStatus;
                    error.status = 400;
                    throw error;
                }
                const saltRounds = 10;
                const passwordHash = await bcrypt.hash(validateData.password, saltRounds);
                const [nuovoUtente] = await db.insert(utenti)
                .values({
                    email: isAdmin ? validateData.email : null,
                    username: isAdmin ? null : validateData.username,
                    passwordHash,
                    ruolo: validateData.ruolo,
                    istitutoId,
                })
                .returning({
                    id: utenti.id,
                    email: utenti.email,
                    username: utenti.username,
                    ruolo: utenti.ruolo,
                    istitutoId: utenti.istitutoId,
                    createdAt: utenti.createdAt,
                    updatedAt: utenti.updatedAt,
                })
                if(!nuovoUtente) {
                    const error = new Error('Errore nella creazione dell\'utente') as ErrorWithStatus;
                    error.status = 500;
                    throw error;
                }
                return nuovoUtente;
            },
            update: async(id: string, data: Omit<ModifyUtente, 'istitutoId'>) => {
                const validateData = modifyUtenteSchema.parse(data);
                const updateValues: Partial<typeof utenti.$inferSelect> = {
                    updatedAt: new Date(),
                    ruolo: validateData.ruolo,
                }
                
                if(validateData.ruolo === 'admin') {
                    if(!validateData.email) {
                        const error = new Error('Email è obbligatoria per admin') as ErrorWithStatus;
                        error.status = 400;
                        throw error;
                    }
                    updateValues.username = null;
                    const [utenteEsistente] = await db.select().from(utenti).where(and(eq(utenti.email, validateData.email), ne(utenti.id, id)));
                    if(utenteEsistente) {
                        const error = new Error('Email già in uso') as ErrorWithStatus;
                        error.status = 400;
                        throw error;
                    }
                    updateValues.email = validateData.email;
                
                } else {
                    if(!validateData.username) {
                        const error = new Error('Username è obbligatorio per collaboratore') as ErrorWithStatus;
                        error.status = 400;
                        throw error;
                    }
                    updateValues.email = null;
                    const [utenteEsistente] = await db.select().from(utenti).where(and(eq(utenti.username, validateData.username), ne(utenti.id, id)));
                    if(utenteEsistente) {
                        const error = new Error('Username già in uso') as ErrorWithStatus;
                        error.status = 400;
                        throw error;
                    }
                    updateValues.username = validateData.username;
                }
                if(validateData.password) {
                    const saltRounds = 10;
                    const passwordHash = await bcrypt.hash(validateData.password, saltRounds);
                    updateValues.passwordHash = passwordHash;
                }
                const {password, ruolo, ...rest} = validateData;
                Object.assign(updateValues, rest);
                const cleanUpdateValues = stripUndefined(updateValues);
                
                const [utenteAggiornato] = await db.update(utenti).set(
                    cleanUpdateValues
                )
                .where(and(eq(utenti.id, id), eq(utenti.istitutoId, istitutoId)))
                .returning()
                if(!utenteAggiornato) {
                    const error = new Error('Utente non trovato') as ErrorWithStatus;
                    error.status = 404;
                    throw error;
                }
                return utenteAggiornato;
            },
            delete: async(id: string) => {
                const [utenteEliminato] = await db.delete(utenti)
                .where(and(eq(utenti.id, id), eq(utenti.istitutoId, istitutoId)))
                .returning({id: utenti.id})
                if(!utenteEliminato) {
                    const error = new Error('Utente non trovato') as ErrorWithStatus;
                    error.status = 404;
                    throw error;
                }
                return utenteEliminato.id;
            }
        },
        registrazioniCopie: {
            getPaginated: async(query: RegistrazioniCopieQuery) => {
                const { page, pageSize, docenteId, utenteId, sortField, sortOrder } = registrazioniCopieQuerySchema.parse(query);
                const offset = (page - 1) * pageSize;
                const condition = [eq(registrazioniCopie.istitutoId, istitutoId)];
                if(docenteId) condition.push(eq(registrazioniCopie.docenteId, docenteId));
                if(utenteId) condition.push(eq(registrazioniCopie.utenteId, utenteId));
                const sortMap: Record<RegistrazioniCopieSort['field'], AnyColumn | SQL> = {
                    docenteId: registrazioniCopie.docenteId,
                    utenteId: registrazioniCopie.utenteId,
                    createdAt: registrazioniCopie.createdAt,
                    updatedAt: registrazioniCopie.updatedAt,
                }
                const sortKey = (sortField || 'createdAt') as RegistrazioniCopieSort['field'];
                const orderByColumn = sortMap[sortKey]; 
                
                const registrazioniPaginated = await db.select()
                .from(registrazioniCopie)
                .where(and(...condition))
                .limit(pageSize)
                .offset(offset)
                .orderBy(getSort(orderByColumn, sortOrder))
             

                const [totalCount] = await db.select({valore: sql`count(*)::int`}).from(registrazioniCopie).where(and(...condition));

                const totalItems = Number(totalCount?.valore ?? 0);
                const response: RegistrazioniCopiePaginatedResponse = {
                    data: registrazioniPaginated,
                    pagination: buildPagination(page, pageSize, totalItems),
                }
                return response;

            },
            create: async(data: Omit<InsertRegistrazione, 'istitutoId'>) => {
                const validateData = insertRegistrazioneSchema.parse(data);
                const result = await db.transaction(async (tx: any) => {
                    const [docente] = await tx.select().from(docenti).where(and(eq(docenti.id, validateData.docenteId), eq(docenti.istitutoId, istitutoId)));
                    const [utente] = await tx.select().from(utenti).where(and(eq(utenti.id, validateData.utenteId), eq(utenti.istitutoId, istitutoId)));
                    if(!docente) {
                        const error = new Error('Docente non trovato') as ErrorWithStatus;
                        error.status = 404;
                        throw error;
                    }
                    if(!utente) {
                        const error = new Error('Utente non trovato') as ErrorWithStatus;
                        error.status = 404;
                        throw error;
                    }
                    await docentiStore.checkLimiteCopie(validateData.docenteId, validateData.copieEffettuate, tx);
                    const [registrazione] = await tx.insert(registrazioniCopie).values({
                        docenteId: validateData.docenteId,
                        copieEffettuate: validateData.copieEffettuate,
                        utenteId: validateData.utenteId,
                        note: validateData.note,
                        istitutoId,
                    })
                    .returning();
                    return registrazione;
                });
                return result;
            }, 
            delete: async(id: number) => {
                const [registrazioneEliminata] = await db.delete(registrazioniCopie)
                .where(and(eq(registrazioniCopie.id, id), eq(registrazioniCopie.istitutoId, istitutoId)))
                .returning({id: registrazioniCopie.id})
                if(!registrazioneEliminata) {
                    const error = new Error('Registrazione non trovata') as ErrorWithStatus;
                    error.status = 404;
                    throw error;
                }
                return registrazioneEliminata;
            }
        }
    }
}

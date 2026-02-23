import express from 'express';
import { asyncHandler, type ErrorWithStatus } from '../middleware/auth.js';
import type { Request, Response } from 'express';
import { utentiQuerySchema, createUtenteSchema, modifyUtenteSchema, uuidParamSchema, type UtentiQuery, type CreateUtente, type ModifyUtente } from '../../../shared/validation.js';
import { utenti } from '../db/schema.js';
import { db } from '../db/index.js';
import { and, eq, sql } from 'drizzle-orm';

const router = express.Router();

/**
 * GET /api/utenti
 * Ottiene la lista paginata degli utenti con filtri e ordinamento
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantStore) {
        return res.status(500).json({ error: 'Store non inizializzato' });
    }

    const query = utentiQuerySchema.parse(req.query);
    const myUserId = req.user.userId;
    const result = await req.tenantStore.utenti.getPaginated({
        ...query
    }, myUserId);
    
    res.status(200).json(result);
}));

/**
 * POST /api/utenti
 * Crea un nuovo utente (solo admin)
 */
router.post('/new-utente', asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantStore) {
        return res.status(500).json({ error: 'Store non inizializzato' });
    }

    const data = createUtenteSchema.parse(req.body);
    const nuovoUtente = await req.tenantStore.utenti.create(data);
    
    res.status(201).json({
        message: 'Utente creato con successo',
        data: nuovoUtente,
    });
}));

/**
 * PUT /api/utenti/:id
 * Aggiorna un utente esistente (solo admin)
 */
router.put('/update-utente/:id', asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantStore) {
        return res.status(500).json({ error: 'Store non inizializzato' });
    }

    // Valida l'ID come UUID (stringa)
    const { id } = uuidParamSchema.parse(req.params);

    const data = modifyUtenteSchema.parse(req.body);
    console.log({ data });
    const utenteAggiornato = await req.tenantStore.utenti.update(id, data as ModifyUtente);
    
    res.status(200).json({
        message: 'Utente aggiornato con successo',
        data: utenteAggiornato,
    });
}));

/**
 * DELETE /api/utenti/:id
 * Elimina un utente (solo admin)
 * Non permette di eliminare l'unico admin dell'istituto
 */
router.delete('/delete-utente/:id', asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantStore) {
        return res.status(500).json({ error: 'Store non inizializzato' });
    }

    // Valida l'ID come UUID (stringa)
    const { id } = uuidParamSchema.parse(req.params);
    const istitutoId = req.user.istitutoId;

    // Recupera l'utente per verificare se è admin
    const [utenteDaEliminare] = await db.select().from(utenti)
        .where(and(eq(utenti.id, id), eq(utenti.istitutoId, istitutoId)));
    
    if (!utenteDaEliminare) {
        const error = new Error('Utente non trovato') as ErrorWithStatus;
        error.status = 404;
        throw error;
    }

    // Se l'utente è admin, verifica che non sia l'unico admin dell'istituto
    if (utenteDaEliminare.ruolo === 'admin') {
        const [adminCount] = await db.select({ valore: sql<number>`count(*)::int` })
            .from(utenti)
            .where(and(
                eq(utenti.istitutoId, istitutoId),
                eq(utenti.ruolo, 'admin')
            ));
        
        const numeroAdmin = Number(adminCount?.valore ?? 0);
        
        if (numeroAdmin === 1) {
            const error = new Error('Non è possibile eliminare l\'unico admin dell\'istituto') as ErrorWithStatus;
            error.status = 400;
            throw error;
        }
    }

    const idEliminato = await req.tenantStore.utenti.delete(id);
    
    res.status(200).json({
        message: 'Utente eliminato con successo',
        id: idEliminato,
    });
}));

export default router;

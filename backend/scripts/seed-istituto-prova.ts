/**
 * Script di seed: crea un istituto di prova con 200 docenti, 150 utenti e 300 registrazioni.
 * Usa il database reale (DATABASE_URL). Eseguire da ambiente di sviluppo.
 *
 * Uso: npm run seed
 *      npm run seed -- --force   (elimina eventuale istituto PROVA12345 e ricrea)
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../src/db/index.js';
import { istituti, docenti, utenti, registrazioniCopie } from '../src/db/schema.js';

const CODICE_ISTITUTO = 'PROVA12345';
const NOME_ISTITUTO = 'Istituto di prova';
const PASSWORD_PIANA = 'password123';
const NUM_DOCENTI = 200;
const NUM_UTENTI = 150;
const NUM_REGISTRAZIONI = 300;

async function main() {
  const force = process.argv.includes('--force');

  if (!process.env.DATABASE_URL) {
    console.error('Errore: DATABASE_URL non impostata. Configura il file .env nella cartella backend.');
    process.exit(1);
  }

  await db.transaction(async (tx) => {
    const [esistente] = await tx.select().from(istituti).where(eq(istituti.codiceIstituto, CODICE_ISTITUTO));

    if (esistente) {
      if (!force) {
        throw new Error(`Esiste già un istituto con codice ${CODICE_ISTITUTO}. Usa --force per eliminarlo e ricreare i dati.`);
      }
      await tx.delete(istituti).where(eq(istituti.codiceIstituto, CODICE_ISTITUTO));
      console.log(`Rimosso istituto esistente con codice ${CODICE_ISTITUTO}.`);
    }

    const [istituto] = await tx
      .insert(istituti)
      .values({ nome: NOME_ISTITUTO, codiceIstituto: CODICE_ISTITUTO })
      .returning();

    if (!istituto) {
      throw new Error('Errore nella creazione dell\'istituto');
    }

    const istitutoId = istituto.id;
    console.log(`Creato istituto: ${istituto.nome} (id ${istitutoId}).`);

    const docentiValues = Array.from({ length: NUM_DOCENTI }, (_, i) => ({
      nome: `Docente ${i + 1}`,
      cognome: 'Prova',
      limiteCopie: 100 + (i % 401),
      istitutoId,
    }));

    const docentiInseriti = await tx.insert(docenti).values(docentiValues).returning();
    console.log(`Inseriti ${docentiInseriti.length} docenti.`);

    const passwordHash = await bcrypt.hash(PASSWORD_PIANA, 10);

    const utentiValues: Array<{
      email: string | null;
      username: string | null;
      passwordHash: string;
      ruolo: 'admin' | 'collaboratore';
      istitutoId: number;
    }> = [
      {
        email: 'admin@istituto-prova.local',
        username: null,
        passwordHash,
        ruolo: 'admin',
        istitutoId,
      },
      ...Array.from({ length: NUM_UTENTI - 1 }, (_, i) => ({
        email: null as string | null,
        username: `utente_prova_${i + 1}`,
        passwordHash,
        ruolo: 'collaboratore' as const,
        istitutoId,
      })),
    ];

    const utentiInseriti = await tx.insert(utenti).values(utentiValues).returning();
    console.log(`Inseriti ${utentiInseriti.length} utenti.`);

    const docenteIds = docentiInseriti.map((d) => d.id);
    const utenteIds = utentiInseriti.map((u) => u.id);

    const registrazioniValues = Array.from({ length: NUM_REGISTRAZIONI }, () => {
      const docenteId = docenteIds[Math.floor(Math.random() * docenteIds.length)];
      const utenteId = Math.random() < 0.9 ? utenteIds[Math.floor(Math.random() * utenteIds.length)] : null;
      return {
        docenteId,
        copieEffettuate: 1 + Math.floor(Math.random() * 50),
        istitutoId,
        utenteId,
        note: '',
      };
    });

    await tx.insert(registrazioniCopie).values(registrazioniValues);
    console.log(`Inserite ${NUM_REGISTRAZIONI} registrazioni.`);
  });

  console.log('Seed completato con successo.');
  console.log(`Accesso admin: email admin@istituto-prova.local, password ${PASSWORD_PIANA}`);
  console.log(`Collaboratori: username utente_prova_1 ... utente_prova_149, password ${PASSWORD_PIANA}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle', // 📁 Cartella dove verranno salvate le migrazioni
  schema: './src/db/schema.ts', // 📍 Il percorso del file che abbiamo scritto insieme
  dialect: 'postgresql', // 🐘 Usiamo PostgreSQL
  dbCredentials: {
    url: process.env.DATABASE_URL!, // 🔑 La stringa di connessione che hai nel file .env
  },
});
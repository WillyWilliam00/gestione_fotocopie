import express, { type NextFunction, type Request, type Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { authMiddleware, requireRole, errorHandler } from './middleware/auth.js';
import { tenantStoreMiddleware } from './middleware/tenantStore.js';
import authenticationRoutes from './route/authentication.js';
import docentiRoutes from './route/docenti.js';
import utentiRoutes from './route/utenti.js';
import registrazioniCopieRoutes from './route/registrazioniCopie.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotte pubbliche (autenticazione)
app.use('/api/auth', authenticationRoutes);

// Rotte protette - richiedono autenticazione e tenantStore
// Docenti: accessibili a admin e collaboratori
app.use('/api/docenti', authMiddleware, tenantStoreMiddleware, docentiRoutes);

// Utenti: accessibili solo agli admin
app.use('/api/utenti', authMiddleware, tenantStoreMiddleware, requireRole('admin'), utentiRoutes);

// Registrazioni Copie: accessibili a admin e collaboratori
app.use('/api/registrazioni-copie', authMiddleware, tenantStoreMiddleware, requireRole('admin'), registrazioniCopieRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

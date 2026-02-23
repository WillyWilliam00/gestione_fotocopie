import express from 'express';
import { asyncHandler } from '../middleware/auth.js';
import type { Request, Response } from 'express';

const router = express.Router();

// Elimina l'istituto dell'utente autenticato (istitutoId dal token, via tenantStore)
router.delete('/delete-istituto', asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantStore) {
        return res.status(500).json({ error: 'Store non inizializzato' })
    }
    const result = await req.tenantStore.istituti.delete();
    res.status(200).json(result)
}))

export default router;
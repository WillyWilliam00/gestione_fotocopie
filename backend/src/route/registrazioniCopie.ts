import express from 'express';
import { asyncHandler, requireRole } from '../middleware/auth.js';
import type { Request, Response } from 'express';
import { idParamSchema, insertRegistrazioneSchema, modifyRegistrazioneSchema, registrazioniCopieQuerySchema, type InsertRegistrazione, type ModifyRegistrazione } from '../../../shared/validation.js';
import type { RegistrazioniCopiePaginatedResponse } from '../../../shared/types.js';
const router = express.Router();


router.get('/', requireRole('admin'), asyncHandler(async (req: Request, res: Response) => {
    if(!req.tenantStore) {
        return res.status(500).json({ error: 'Store non inizializzato' });
    }
    const query = registrazioniCopieQuerySchema.parse(req.query);
    const result: RegistrazioniCopiePaginatedResponse = await req.tenantStore.registrazioniCopie.getPaginated(query);
    res.status(200).json(result);
}))

router.post('/new-registrazione', asyncHandler(async (req: Request, res: Response) => {
    if(!req.tenantStore) {
        return res.status(500).json({ error: 'Store non inizializzato' });
    }
    const data = insertRegistrazioneSchema.parse(req.body);
    const result: InsertRegistrazione = await req.tenantStore.registrazioniCopie.create(data);
    res.status(201).json(result);
}))

router.put('/update-registrazione/:id', requireRole('admin'), asyncHandler(async (req: Request, res: Response) => {
    if(!req.tenantStore) {
        return res.status(500).json({ error: 'Store non inizializzato' });
    }
    const { id } = idParamSchema.parse(req.params);
    const data = modifyRegistrazioneSchema.parse(req.body);
    const result = await req.tenantStore.registrazioniCopie.update(id, data);
    res.status(200).json({
        message: 'Registrazione aggiornata con successo',
        data: result,
    });
}))

router.delete('/delete-registrazione/:id', requireRole('admin'), asyncHandler(async (req: Request, res: Response) => {
    if(!req.tenantStore) {
        return res.status(500).json({ error: 'Store non inizializzato' });
    }
    const { id } = idParamSchema.parse(req.params);
    const result = await req.tenantStore.registrazioniCopie.delete(id);
    res.status(200).json(result);
}))

router.delete('/delete-all', requireRole('admin'), asyncHandler(async (req: Request, res: Response) => {
    if(!req.tenantStore) {
        return res.status(500).json({ error: 'Store non inizializzato' });
    }
    await req.tenantStore.registrazioniCopie.deleteAll();
    res.status(200).json({ message: 'Tutte le registrazioni copie dell\'istituto sono state eliminate.' });
}))

export default router;
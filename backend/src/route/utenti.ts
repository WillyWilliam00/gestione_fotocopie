import express from 'express';
import { asyncHandler } from '../middleware/auth.js';
import type { Request, Response } from 'express';
import { utentiQuerySchema, createUtenteSchema, uuidParamSchema, type UtentiQuery, type CreateUtente } from '../../../shared/validation.js';

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
    const result = await req.tenantStore.utenti.getPaginated(query);
    
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

    const data = createUtenteSchema.parse(req.body);
    const utenteAggiornato = await req.tenantStore.utenti.update(id, data);
    
    res.status(200).json({
        message: 'Utente aggiornato con successo',
        data: utenteAggiornato,
    });
}));

/**
 * DELETE /api/utenti/:id
 * Elimina un utente (solo admin)
 */
router.delete('/delete-utente/:id', asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantStore) {
        return res.status(500).json({ error: 'Store non inizializzato' });
    }

    // Valida l'ID come UUID (stringa)
    const { id } = uuidParamSchema.parse(req.params);

    const idEliminato = await req.tenantStore.utenti.delete(id);
    
    res.status(200).json({
        message: 'Utente eliminato con successo',
        id: idEliminato,
    });
}));

export default router;

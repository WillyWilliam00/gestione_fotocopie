import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import type { UtentiPaginatedResponse, Utente } from '../../../shared/types.js';
import type { UtentiQuery, CreateUtente, ModifyUtente } from '../../../shared/validation.js';

/**
 * Hook per gestire gli utenti con TanStack Query
 *
 * Stati di loading (da usare nell'UI):
 * - isLoading: primo caricamento → skeleton/placeholder pieno
 * - isFetching: una richiesta in corso (anche refetch) → se !isLoading puoi mostrare indicatore leggero
 * - isPlaceholderData: true = stai vedendo la pagina precedente mentre carica la nuova (keepPreviousData)
 *
 * Endpoint backend:
 * - GET /api/utenti?page=1&pageSize=20&...
 * - POST /api/utenti/new-utente
 * - PUT /api/utenti/update-utente/:id (id è UUID)
 * - DELETE /api/utenti/delete-utente/:id (id è UUID)
 */

/**
 * Hook per ottenere la lista paginata degli utenti
 *
 * @param query - Parametri di query per paginazione, filtri e ordinamento
 * @returns Query result con data, pagination, isLoading, isFetching, error, refetch, ecc.
 */
export function useUtenti(query: UtentiQuery = { page: 1, pageSize: 20, sortField: 'ruolo', sortOrder: 'asc' }) {
  return useSuspenseQuery<UtentiPaginatedResponse>({
    queryKey: ['utenti', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(query.page ?? 1));
      params.append('pageSize', String(query.pageSize ?? 20));
      if (query.identifier) params.append('identifier', query.identifier);
      if (query.ruolo) params.append('ruolo', query.ruolo);
      if (query.sortField) params.append('sortField', query.sortField);
      if (query.sortOrder) params.append('sortOrder', query.sortOrder ?? 'asc');
      const response = await api.get<UtentiPaginatedResponse>(`/utenti?${params.toString()}`);
      return response.data;
    },
      staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook per creare un nuovo utente
 * Stati: isPending (o isLoading) = true durante la creazione → disabilita pulsante / mostra spinner
 *
 * @returns Mutation con mutate, mutateAsync, isPending, error, ecc.
 */
export function useCreateUtente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUtente) => {
      const response = await api.post<{ message: string; data: Utente }>(
        '/utenti/new-utente',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalida la cache degli utenti per forzare il refetch
      queryClient.invalidateQueries({ queryKey: ['utenti'] });
    },
  });
}

/**
 * Hook per aggiornare un utente esistente
 * Stati: isPending = true durante l'update → disabilita form / mostra saving
 *
 * @returns Mutation con mutate, mutateAsync, isPending, error, ecc.
 */
export function useUpdateUtente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ModifyUtente }) => {
      const response = await api.put<{ message: string; data: Utente }>(
        `/utenti/update-utente/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalida la cache degli utenti per forzare il refetch
      queryClient.invalidateQueries({ queryKey: ['utenti'] });
    },
  });
}

/**
 * Hook per eliminare un utente
 * Stati: isPending = true durante la delete → disabilita pulsante / conferma
 *
 * @returns Mutation con mutate, mutateAsync, isPending, error, ecc.
 */
export function useDeleteUtente(onShowDialog?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Nota: id è UUID (stringa), non numero
      const response = await api.delete<{ message: string; id: string }>(
        `/utenti/delete-utente/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalida la cache degli utenti per forzare il refetch
      queryClient.invalidateQueries({ queryKey: ['utenti'] });
      onShowDialog?.();
    },
  });
}

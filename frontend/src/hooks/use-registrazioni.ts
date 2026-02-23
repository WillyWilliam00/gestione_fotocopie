import { useQuery, useSuspenseQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import type { RegistrazioniCopiePaginatedResponse } from '../../../shared/types.js';
import type { RegistrazioniCopieQuery, InsertRegistrazione, ModifyRegistrazione } from '../../../shared/validation.js';

/**
 * Hook per gestire le registrazioni copie con TanStack Query
 *
 * Stati di loading (da usare nell'UI):
 * - isLoading: primo caricamento → skeleton/placeholder pieno
 * - isFetching: una richiesta in corso (anche refetch) → se !isLoading indicatore leggero
 * - isPlaceholderData: true = dati della pagina precedente visibili mentre carica la nuova
 *
 * Endpoint backend:
 * - GET /api/registrazioni-copie?page=1&pageSize=20&...
 * - POST /api/registrazioni-copie/new-registrazione
 * - DELETE /api/registrazioni-copie/delete-registrazione/:id
 * - DELETE /api/registrazioni-copie/delete-all
 */

/**
 * Hook per ottenere la lista paginata delle registrazioni
 *
 * @param query - Parametri di query per paginazione, filtri e ordinamento
 * @returns Query result con data, pagination, isLoading, isFetching, error, refetch, ecc.
 */
export function useRegistrazioni(query: RegistrazioniCopieQuery = { page: 1, pageSize: 20, sortOrder: 'asc' }) {
  return useQuery<RegistrazioniCopiePaginatedResponse>({
    queryKey: ['registrazioni', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(query.page ?? 1));
      params.append('pageSize', String(query.pageSize ?? 20));
      if (query.docenteId) params.append('docenteId', String(query.docenteId));
      if (query.utenteId) params.append('utenteId', query.utenteId);
      if (query.sortField) params.append('sortField', query.sortField);
      if (query.sortOrder) params.append('sortOrder', query.sortOrder ?? 'asc');
      const response = await api.get<RegistrazioniCopiePaginatedResponse>(
        `/registrazioni-copie?${params.toString()}`
      );
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Hook per ottenere la lista paginata delle registrazioni sospendendo fino al primo caricamento.
 * Usa useSuspenseQuery: il componente che lo chiama deve essere wrappato in <Suspense fallback={...}>.
 *
 * Stati dopo il primo load:
 * - isFetching: true quando è in corso un refetch (cambio pagina/filtri/sort o invalidazione).
 *   Puoi mostrare un indicatore discreto (es. barra o icona) senza nascondere la tabella.
 *   restano visibili i dati precedenti finché non arrivano i nuovi.
 *
 * @param query - Parametri di query per paginazione, filtri e ordinamento (stesso di useRegistrazioni)
 * @returns Query result con data, pagination, isFetching, refetch, ecc. (niente isLoading: il loading è gestito da Suspense)
 */
export function useRegistrazioniSuspense(query: RegistrazioniCopieQuery = { page: 1, pageSize: 20, sortOrder: 'asc' }) {
  return useSuspenseQuery<RegistrazioniCopiePaginatedResponse>({
    queryKey: ['registrazioni', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(query.page ?? 1));
      params.append('pageSize', String(query.pageSize ?? 20));
      if (query.docenteId) params.append('docenteId', String(query.docenteId));
      if (query.utenteId) params.append('utenteId', query.utenteId);
      if (query.sortField) params.append('sortField', query.sortField);
      if (query.sortOrder) params.append('sortOrder', query.sortOrder ?? 'asc');
      const response = await api.get<RegistrazioniCopiePaginatedResponse>(
        `/registrazioni-copie?${params.toString()}`
      );
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
   
  });
}

/**
 * Hook per creare una nuova registrazione
 * Stati: isPending = true durante la creazione → disabilita pulsante / mostra spinner
 *
 * @returns Mutation con mutate, mutateAsync, isPending, error, ecc.
 */
export function useCreateRegistrazione() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertRegistrazione) => {
      const response = await api.post<InsertRegistrazione>(
        '/registrazioni-copie/new-registrazione',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalida la cache delle registrazioni per forzare il refetch
      queryClient.invalidateQueries({ queryKey: ['registrazioni'] });
      // Invalida anche la cache dei docenti perché le copie effettuate cambiano
      queryClient.invalidateQueries({ queryKey: ['docenti'] });
    },
  });
}

/**
 * Hook per aggiornare una registrazione esistente
 * Stati: isPending = true durante l'update → disabilita pulsante / mostra spinner
 *
 * @returns Mutation con mutate, mutateAsync, isPending, error, ecc.
 */
export function useUpdateRegistrazione() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ModifyRegistrazione }) => {
      const response = await api.put<{ message: string; data: any }>(
        `/registrazioni-copie/update-registrazione/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalida la cache delle registrazioni per forzare il refetch
      queryClient.invalidateQueries({ queryKey: ['registrazioni'] });
      // Invalida anche la cache dei docenti perché le copie effettuate cambiano
      queryClient.invalidateQueries({ queryKey: ['docenti'] });
    },
  });
}

/**
 * Hook per eliminare una registrazione
 * Stati: isPending = true durante la delete → disabilita pulsante / conferma
 *
 * @returns Mutation con mutate, mutateAsync, isPending, error, ecc.
 */
export function useDeleteRegistrazione() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete<{ message?: string; id?: number }>(
        `/registrazioni-copie/delete-registrazione/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalida la cache delle registrazioni per forzare il refetch
      queryClient.invalidateQueries({ queryKey: ['registrazioni'] });
      // Invalida anche la cache dei docenti perché le copie effettuate cambiano
      queryClient.invalidateQueries({ queryKey: ['docenti'] });
    },
  });
}

/**
 * Hook per eliminare tutte le registrazioni copie dell'istituto (reset conteggio).
 * Stati: isPending = true durante la delete → disabilita pulsante / conferma
 *
 * @returns Mutation con mutate, mutateAsync, isPending, error, ecc.
 */
export function useDeleteAllRegistrazioni() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete<{ message: string }>(
        '/registrazioni-copie/delete-all'
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrazioni'] });
      queryClient.invalidateQueries({ queryKey: ['docenti'] });
    },
  });
}

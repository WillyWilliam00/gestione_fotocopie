
import { useAuthStore } from '../store/auth-store.js';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { AlertDialog, AlertDialogCancel, AlertDialogFooter } from '@/components/ui/alert-dialog.js';
import { AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from './ui/alert-dialog.js';
import { HugeiconsIcon } from '@hugeicons/react';
import { DeleteIcon } from '@hugeicons/core-free-icons';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog.js';
import { Dialog } from './ui/dialog.js';
import { useDeleteIstituto } from '@/hooks/use-istituto.js';
import { formatError } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { logout } from '@/lib/auth-api';
import { useNavigate } from 'react-router-dom';

export default function ProfiloUtente() {
  const { utente, istituto } = useAuthStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const firtsTowLetters = utente?.email?.slice(0, 2).toUpperCase() ?? utente?.username?.slice(0, 2).toUpperCase();
  const isAdmin = utente?.ruolo === 'admin';
  const [timeToLogout, setTimeToLogout] = useState(15);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const openDialogLogout = () => {
    setTimeToLogout(5);
    setIsLogoutDialogOpen(true);
  };
  const { mutate: deleteIstituto, isPending: isDeleteIstitutoPending, isError: isDeleteIstitutoError, error: deleteIstitutoError, reset: resetDeleteIstituto } = useDeleteIstituto(openDialogLogout);
  const openDialogDeleteIstituto = () => {
    resetDeleteIstituto();
    setIsDeleteDialogOpen(true);
  }
 



  const handleDeleteIstituto = () => {
    deleteIstituto(undefined, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      },
    });
  }

  useEffect(() => {
    if (!isLogoutDialogOpen) return;
  
    const timer = setInterval(() => {
      setTimeToLogout((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  
    return () => clearInterval(timer);
  }, [isLogoutDialogOpen]);

  useEffect(() => {
    if (timeToLogout === 0) {
      logout(queryClient)
      navigate('/login')
    }
  }, [timeToLogout]);

  const displayIdentifier = isAdmin ? utente?.email : utente?.username;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col items-center mb-6 ">
            <p className="text-lg font-bold ">
              Il mio profilo
            </p>
            <p className="text-lg text-primary font-bold px-4 py-2 bg-primary/10 rounded-full w-fit">
              {firtsTowLetters}
            </p>
          </CardTitle>
          <CardDescription>Visualizza e gestisci le informazioni del tuo profilo</CardDescription>


        </CardHeader>

        <CardContent className="space-y-6">
          {/* Istituto */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Istituto</h3>
            <div className="space-y-1">
              <p className="text-base font-medium">{istituto?.nome}</p>
              <p className="text-sm text-muted-foreground">Codice: {istituto?.codiceIstituto}</p>
            </div>
          </div>

          <Separator />

          {/* Identificativo */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {isAdmin ? 'Email' : 'Username'}
            </h3>
            <p className="text-base">{displayIdentifier}</p>
          </div>

          <Separator />

          {/* Ruolo */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Ruolo</h3>
            <Badge variant={isAdmin ? 'default' : 'secondary'}>
              {isAdmin ? 'Amministratore' : 'Collaboratore'}
            </Badge>
          </div>
        </CardContent>

      </Card>

      {isAdmin && (
        <div className="container mx-auto p-6 max-w-2xl bg-red-500/10 mt-6 rounded-lg">
          <div className=''>
            <p className='text-sm text-red-500 font-medium'>
              Elimina Istituto
            </p>
            <p className='text-sm text-muted-foreground mt-2'>
              Attenzione: questa azione eliminerà l'istituto e tutti i suoi dati, compresi i docenti e gli utenti.
            </p>
          </div>
          <div className='mt-4'>
            <Button className="w-full bg-red-500 text-white hover:bg-red-500/80" onClick={openDialogDeleteIstituto}>
              Elimina Istituto
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} />
            </AlertDialogMedia>
            <AlertDialogTitle>
              Eliminare l'istituto {istituto?.nome}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione eliminerà l'istituto e tutti i suoi dati, compresi i docenti e gli utenti. Non può essere annullata.
            </AlertDialogDescription>
            {isDeleteIstitutoError && deleteIstitutoError && (
              <p className="text-sm text-destructive px-6" role="alert">
                {formatError(deleteIstitutoError, "Errore durante l'eliminazione dell'istituto")}
              </p>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteIstitutoPending} variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Annulla</AlertDialogCancel>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDeleteIstituto}
              disabled={isDeleteIstitutoPending}
            >
              {isDeleteIstitutoPending ? 'Eliminazione in corso...' : 'Elimina'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Istituto eliminato con successo</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <p>L'istituto è stato eliminato con successo, verrai disconnesso tra:</p>
            <p className="text-sm text-muted-foreground">
              {timeToLogout} secondi
            </p>
          </DialogDescription>
        </DialogContent>
      </Dialog>

    </div>
  );
}

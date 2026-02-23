import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { DeleteIcon } from "@hugeicons/core-free-icons";
import { formatError } from "@/lib/utils";
import { useDeleteUtente } from "@/hooks/use-utenti";
import type { Utente } from "@shared/types";

function utenteDisplayName(u: Utente): string {
  return u.ruolo === "admin" ? (u as { email: string }).email : (u as { username: string }).username;
}

type Props = {
  open: boolean;
  utente: Utente | null;
  onClose: () => void;
};

export function EliminaUtenteDialog({ open, utente, onClose }: Props) {
  const { mutate: deleteUtente, isPending, isError, error, reset } = useDeleteUtente();

  const handleOpenChange = (next: boolean) => {
    if (next) reset();
    else onClose();
  };

  const handleConfirm = () => {
    if (!utente) return;
    deleteUtente(utente.id, {
      onSuccess: onClose,
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} />
          </AlertDialogMedia>
          <AlertDialogTitle>
            Eliminare l'utenza {utente ? utenteDisplayName(utente) : ""}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Questa azione eliminerà l'utenza dal sistema. Non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {isError && error && (
          <p className="text-sm text-destructive" role="alert">
            {formatError(error, "Errore durante l'eliminazione.")}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isPending}>
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            {isPending ? "Eliminazione…" : "Elimina"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

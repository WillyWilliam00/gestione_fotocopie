import { AlertDialog, AlertDialogHeader, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogMedia } from "@/components/ui/alert-dialog";
import { DeleteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Utente } from "@shared/types";
import { utenteDisplayName } from "@/lib/utils";
import { useDeleteUtente } from "@/hooks/use-utenti";
import { formatError } from "@/lib/utils";

interface DeleteUtenteAlertDialogProps {
    selectedUtente: Utente | null;
    typeForm: "delete" | "edit" | "view" | "add" | null;
    onClose: () => void;
}
export function DeleteUtenteAlertDialog({ selectedUtente, typeForm, onClose }: DeleteUtenteAlertDialogProps) {

    const handleDelete = () => {
        if(selectedUtente === null) return;
        deleteUtente.mutate(selectedUtente.id, {
            onSuccess: () => {
                onClose();
            }
        })
    }

    const deleteUtente = useDeleteUtente();
    return (
        <AlertDialog open={typeForm === "delete" && selectedUtente !== null} onOpenChange={(open) => !open && onClose()}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} />
            </AlertDialogMedia>
            <AlertDialogTitle>
              Eliminare l’utenza {selectedUtente && utenteDisplayName(selectedUtente)}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione eliminerà l’utenza dal sistema. Non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteUtente.isError && deleteUtente.error && (
            <p className="text-sm text-destructive" role="alert">
              {formatError(deleteUtente.error, "Errore durante l'eliminazione.")}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" disabled={deleteUtente.isPending}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteUtente.isPending}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> 
    )
}
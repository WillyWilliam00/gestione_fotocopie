import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { DeleteIcon } from "@hugeicons/core-free-icons";
import { formatError } from "@/lib/utils";
import { useDeleteAllDocenti } from "@/hooks/use-docenti";

export function EliminaTuttiDocentiDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: deleteAllDocenti, isPending, isError, error, reset } = useDeleteAllDocenti();

  const handleOpenChange = (next: boolean) => {
    if (next) reset();
    setOpen(next);
  };

  const handleConfirm = () => {
    // La mutation "delete all" non richiede parametri (nessun id/body); il primo argomento di mutate sono le variabili → undefined
    deleteAllDocenti(undefined, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} />
          <span>Elimina tutti i docenti</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} />
          </AlertDialogMedia>
          <AlertDialogTitle>Eliminare tutti i docenti?</AlertDialogTitle>
          <AlertDialogDescription>
            Questa azione eliminerà tutti i docenti dal sistema. Questa operazione non può essere annullata.
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
            {isPending ? "Eliminazione…" : "Elimina tutti"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

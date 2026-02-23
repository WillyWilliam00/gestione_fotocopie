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
import { type Docenti } from "@/components/table/columns";
import { formatError } from "@/lib/utils";
import { useDeleteDocente } from "@/hooks/use-docenti";

type Props = {
  selectedDocente: Docenti | null;
  typeForm: "delete" | "edit" | "view" | "add" | null;
  onClose: () => void;
};

export function EliminaDocenteDialog({ selectedDocente, typeForm, onClose }: Props) {
  const { mutate: deleteDocente, isPending, isError, error } = useDeleteDocente();

  const handleConfirm = () => {
    if (!selectedDocente) return;
    deleteDocente(selectedDocente.id, {
      onSuccess: onClose,
    });
  };

  return (
    <AlertDialog
      open={typeForm === "delete" && selectedDocente !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} />
          </AlertDialogMedia>
          <AlertDialogTitle>
            Eliminare il docente {selectedDocente?.nome} {selectedDocente?.cognome}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Questa azione eliminerà il docente {selectedDocente?.nome} {selectedDocente?.cognome}{" "}
            dal sistema. Questa operazione non può essere annullata.
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

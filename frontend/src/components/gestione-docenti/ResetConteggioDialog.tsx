import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import { formatError } from "@/lib/utils";
import { useDeleteAllRegistrazioni } from "@/hooks/use-registrazioni.js";

export function ResetConteggioDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: deleteAllRegistrazioni, isPending, isError, error, reset } = useDeleteAllRegistrazioni();

  const handleOpenChange = (next: boolean) => {
    if (next) reset();
    setOpen(next);
  };

  const handleConfirm = () => {
    // La mutation "delete all registrazioni" non richiede parametri → undefined come variabili per mutate()
    deleteAllRegistrazioni(undefined, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} />
          <span>Reset conteggio</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} />
          </AlertDialogMedia>
          <AlertDialogTitle>Eliminare tutte le copie effettuate?</AlertDialogTitle>
          <AlertDialogDescription>
            Verranno eliminate tutte le copie effettuate di tutti i docenti dell&apos;istituto. L&apos;azione è irreversibile. Sì per confermare.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {isError && error && (
          <p className="text-sm text-destructive" role="alert">
            {formatError(error, "Errore durante il reset.")}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isPending}>
            Annulla
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            {isPending ? "Attendere…" : "Sì"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

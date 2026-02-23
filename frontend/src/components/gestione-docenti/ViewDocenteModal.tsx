import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type Docenti } from "@/components/table/columns";

interface ViewDocenteModalProps {
  selectedDocente: Docenti | null;
  typeForm: "view" | "edit" | "delete" | "add" | null;
  onClose: () => void;
}

export function ViewDocenteModal({ selectedDocente, typeForm, onClose }: ViewDocenteModalProps) {
  return (
    <Dialog
      open={typeForm === "view" && selectedDocente !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Visualizza docente</DialogTitle>
          <DialogDescription>Dettagli del docente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Field>
            <FieldLabel htmlFor="nome-docente">Nome</FieldLabel>
            <FieldContent>
              <Input id="nome-docente" value={selectedDocente?.nome ?? ""} disabled />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="cognome-docente">Cognome</FieldLabel>
            <FieldContent>
              <Input id="cognome-docente" value={selectedDocente?.cognome ?? ""} disabled />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="numero-copie">Numero di copie</FieldLabel>
            <FieldContent>
              <Input
                id="numero-copie"
                type="number"
                value={selectedDocente?.limite ?? 0}
                disabled
              />
            </FieldContent>
          </Field>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Chiudi</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

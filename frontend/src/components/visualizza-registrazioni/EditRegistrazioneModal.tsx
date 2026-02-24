
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
import { Textarea } from "@/components/ui/textarea";
import type { Registrazioni } from "@/components/table/columns";
import { formatError } from "@/lib/utils";
import { useUpdateRegistrazione } from "@/hooks/use-registrazioni";
import { useForm } from "@tanstack/react-form";
import { modifyRegistrazioneFormSchema } from "@shared/validation";

interface EditRegistrazioneModalProps {
  selectedRegistrazione: Registrazioni | null;
  typeForm: "view" | "edit" | "delete" | null;
  onClose: () => void;
}

const docenteNomeCompleto = (r: Registrazioni | null) =>
  r ? `${r.docenteNome ?? ""} ${r.docenteCognome ?? ""}`.trim() || "-" : "-";

export default function EditRegistrazioneModal({
  selectedRegistrazione,
  typeForm,
  onClose,
}: EditRegistrazioneModalProps) {
  const updateRegistrazione = useUpdateRegistrazione();

 

  const defaultValues = {
    copieEffettuate: String(selectedRegistrazione?.copieEffettuate ?? 0),
    note: selectedRegistrazione?.note ?? "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: modifyRegistrazioneFormSchema,
      onMount: modifyRegistrazioneFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!selectedRegistrazione) return;
      updateRegistrazione.mutate(
        {
          id: selectedRegistrazione.id,
          data: {
            copieEffettuate: Number(value.copieEffettuate),
            note: value.note?.trim() || undefined,
          },
        },
        {
          onSuccess: () => {
            onClose();
            updateRegistrazione.reset();
            form.reset();
          },
        }
      );
    },
  });

  const isOpen = typeForm === "edit" && selectedRegistrazione !== null;


  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          updateRegistrazione.reset();
          form.reset();
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica registrazione</DialogTitle>
          <DialogDescription>
            Modifica il numero di copie e le note della registrazione.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4 py-4">
            <Field>
              <FieldLabel htmlFor="docente-edit">Docente</FieldLabel>
              <FieldContent>
                <Input
                  id="docente-edit"
                  value={docenteNomeCompleto(selectedRegistrazione)}
                  disabled
                />
              </FieldContent>
            </Field>
            <form.Field
              name="copieEffettuate"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor="copie-edit">Copie Effettuate</FieldLabel>
                  <FieldContent>
                    <Input
                      id="copie-edit"
                      type="number"
                      placeholder="Inserisci il numero di copie"
                      min={1}
                      required
                      disabled={updateRegistrazione.isPending}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors.length > 0 && field.state.meta.isTouched && (
                      <p className="text-sm text-destructive mt-1">
                        {typeof field.state.meta.errors[0] === "string"
                          ? field.state.meta.errors[0]
                          : (field.state.meta.errors[0] as { message?: string })?.message ??
                            "Errore di validazione"}
                      </p>
                    )}
                  </FieldContent>
                </Field>
              )}
            />
            <form.Field
              name="note"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor="note-edit">Note</FieldLabel>
                  <FieldContent>
                    <Textarea
                      id="note-edit"
                      placeholder="Inserisci note opzionali"
                      disabled={updateRegistrazione.isPending}
                      value={field.state.value ?? ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      rows={3}
                    />
                  </FieldContent>
                </Field>
              )}
            />
          </div>
          {updateRegistrazione.isError && updateRegistrazione.error && (
            <div className="my-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                {formatError(updateRegistrazione.error, "Errore durante il salvataggio")}
              </p>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={onClose} type="button">
                Annulla
              </Button>
            </DialogClose>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty]}
            >
              {([canSubmit, isSubmitting, isDirty]) => (
                <Button
                  variant="default"
                  type="submit"
                  disabled={
                    !canSubmit ||
                    isSubmitting ||
                    !isDirty ||
                    updateRegistrazione.isPending
                  }
                >
                  {updateRegistrazione.isPending ? "Salvataggio in corso…" : "Salva"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { formatError } from "@/lib/utils";
import { useUpdateDocente } from "@/hooks/use-docenti";
import { useForm } from "@tanstack/react-form";
import { insertDocenteFormSchema } from "@shared/validation";

interface EditDocenteModalProps {
  selectedDocente: Docenti | null;
  typeForm: "edit" | "view" | "delete" | "add" | null;
  onClose: () => void;
}

export default function EditDocenteModal({ selectedDocente, typeForm, onClose }: EditDocenteModalProps) {
  const updateDocente = useUpdateDocente();

  const getDefaultValue = (docente: Docenti) => ({
    nome: docente.nome,
    cognome: docente.cognome,
    limiteCopie: String(docente.limite),
  });

  const defaultValue = selectedDocente
    ? getDefaultValue(selectedDocente)
    : { nome: "", cognome: "", limiteCopie: "" };

  const form = useForm({
    defaultValues: defaultValue,
    validators: {
      onChange: insertDocenteFormSchema,
      onMount: insertDocenteFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!selectedDocente || !value) return;
      updateDocente.mutate(
        {
          id: selectedDocente.id,
          data: {
            nome: value.nome,
            cognome: value.cognome,
            limiteCopie: Number(value.limiteCopie),
          },
        },
        {
          onSuccess: () => {
            onClose();
            updateDocente.reset();
            form.reset();
          },
        }
      );
    },
  });

  return (
    <Dialog
      open={typeForm === "edit" && selectedDocente !== null}
      onOpenChange={(open) => {
        if (!open) {
          updateDocente.reset();
          form.reset();
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica docente</DialogTitle>
          <DialogDescription>
            Modifica il nome, il cognome e il limite di fotocopie del docente{" "}
            {selectedDocente ? `${selectedDocente.nome} ${selectedDocente.cognome}` : "…"}.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="nome"
            children={(field) => (
              <Field className="">
                <FieldLabel htmlFor="nome-docente">Nome</FieldLabel>
                <FieldContent>
                  <Input
                    id="nome-docente"
                    placeholder="Inserisci il nome del docente"
                    required
                    disabled={form.state.isSubmitting}
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
            name="cognome"
            children={(field) => (
              <Field className="mt-4">
                <FieldLabel htmlFor="cognome-docente">Cognome</FieldLabel>
                <FieldContent>
                  <Input
                    id="cognome-docente"
                    placeholder="Inserisci il cognome del docente"
                    required
                    disabled={form.state.isSubmitting}
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
            name="limiteCopie"
            children={(field) => (
              <Field className="mt-4">
                <FieldLabel htmlFor="numero-copie">Numero di copie</FieldLabel>
                <FieldContent>
                  <Input
                    id="numero-copie"
                    type="number"
                    placeholder="Inserisci il limite di fotocopie"
                    min={0}
                    required
                    disabled={form.state.isSubmitting}
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
        </form>
        {updateDocente.isError && updateDocente.error && (
          <span className="text-red-500 text-xs">
            {formatError(updateDocente.error, "Errore durante la modifica del docente.")}
          </span>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Chiudi
            </Button>
          </DialogClose>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty]}>
            {([canSubmit, isSubmitting, isDirty]) => (
              <Button
                variant="default"
                type="submit"
                onClick={() => form.handleSubmit()}
                disabled={!canSubmit || isSubmitting || !isDirty || updateDocente.isPending}
              >
                {isSubmitting ? "Salvataggio in corso…" : "Salva"}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

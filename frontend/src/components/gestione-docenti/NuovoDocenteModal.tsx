import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { insertDocenteFormSchema } from "@shared/validation";
import { useCreateDocente } from "@/hooks/use-docenti";
import { formatError } from "@/lib/utils.js";
import { HugeiconsIcon } from "@hugeicons/react";
import { Plus } from "@hugeicons/core-free-icons";

interface NuovoDocenteModalProps {
  typeForm: "view" | "add" | "edit" | "delete" | null;
  onClose: () => void;
  onOpenAddForm: () => void;
}

export default function NuovoDocenteModal({ typeForm, onClose, onOpenAddForm }: NuovoDocenteModalProps) {
  const createDocente = useCreateDocente();
  const defaultValue = { nome: "", cognome: "", limiteCopie: "" };

  const form = useForm({
    defaultValues: defaultValue,
    validators: {
      onChange: insertDocenteFormSchema,
      onMount: insertDocenteFormSchema,
    },
    onSubmit: async ({ value }) => {
      createDocente.mutate(
        { nome: value.nome, cognome: value.cognome, limiteCopie: Number(value.limiteCopie) },
        {
          onSuccess: () => {
            onClose();
            createDocente.reset();
            form.reset();
          },
        }
      );
    },
  });

  return (
    <Dialog
      open={typeForm === "add"}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          createDocente.reset();
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" onClick={onOpenAddForm}>
          Aggiungi docente
          <HugeiconsIcon icon={Plus} strokeWidth={2} className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aggiungi docente</DialogTitle>
          <DialogDescription>
            Inserisci il nome, il cognome e il limite di fotocopie del docente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
                <Field>
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
          {createDocente.isError && createDocente.error && (
            <span className="text-red-500 text-xs">
              {formatError(createDocente.error, "Errore durante l'aggiunta del docente.")}
            </span>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Chiudi</Button>
          </DialogClose>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty]}>
            {([canSubmit, isSubmitting, isDirty]) => (
              <Button
                variant="default"
                type="submit"
                onClick={() => form.handleSubmit()}
                disabled={!canSubmit || isSubmitting || !isDirty || createDocente.isPending}
              >
                {isSubmitting ? "Aggiunta in corso…" : "Aggiungi"}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

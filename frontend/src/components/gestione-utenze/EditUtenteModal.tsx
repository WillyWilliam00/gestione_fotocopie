import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import type { Utente } from "@shared/types";
import { formatError, utenteDisplayName } from "@/lib/utils";
import { useUpdateUtente } from "@/hooks/use-utenti";
import type { ModifyUtente } from "@shared/validation";
import { useForm } from "@tanstack/react-form";
import { modifyUtenteSchema } from "@shared/validation";

interface EditUtenteModalProps {
    selectedUtente: Utente | null;
    typeForm: "edit" | "view" | "delete" | "add" | null;
    onClose: () => void;
}
export default function EditUtenteModal({ selectedUtente, typeForm, onClose }: EditUtenteModalProps) {
    const isAdmin = selectedUtente ? selectedUtente.ruolo === "admin" : false;


    const updateUtente = useUpdateUtente();

    const getDefaultValue = (utente: Utente) => {
        if (utente.ruolo === "admin") {
            return {
                ruolo: utente.ruolo,
                email: utente.email,
                username: '',
                password: '',
            } as ModifyUtente;
        }
        return {
            ruolo: utente.ruolo,
            username: utente.username,
            email: '',
            password: '',
        } as ModifyUtente;
    }

    const defaultValue: ModifyUtente = selectedUtente
        ? getDefaultValue(selectedUtente)
        : { ruolo: "collaboratore", username: "", password: "" };

    const form = useForm({
        defaultValues: defaultValue,
        validators: {
            onChange: modifyUtenteSchema,
            onMount: modifyUtenteSchema,
        },
        onSubmit: async ({ value }) => {
            if(!selectedUtente || !value) return;
            updateUtente.mutate({ id: selectedUtente.id, data: value }, {
                onSuccess: () => {
                    onClose();
                    updateUtente.reset();
                    form.reset();
                }
            })
        }
    })

    return (
        <Dialog
            open={typeForm === "edit" && selectedUtente !== null}
            onOpenChange={(open) => {
                if (!open) {
                    updateUtente.reset();
                    form.reset();
                    onClose();
                } 
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Modifica utenza
                    </DialogTitle>
                    <DialogDescription>
                        Modifica i dati dell’utenza di {selectedUtente ? utenteDisplayName(selectedUtente) : '...'}. La password è opzionale.
                    </DialogDescription>
                </DialogHeader>
               <form onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
               }}>
                    <form.Field name="ruolo" children={(field) => (
                        <Field>
                            <FieldLabel>Ruolo</FieldLabel>
                            <Select
                                disabled={isAdmin}
                                value={field.state.value}
                                onValueChange={(value) => {
                                    const nuovoRuolo = value as ModifyUtente['ruolo'];
                                    field.handleChange(nuovoRuolo);
                                    if(nuovoRuolo === 'admin') {
                                        form.setFieldValue('username', '', );
                                    } else {
                                        form.setFieldValue('email', '');
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Ruolo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="collaboratore">Collaboratore</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                    )} />
                        <form.Subscribe selector={(state) => [state.values?.ruolo]}>
                            {([ruolo]) => (
                                <>
                                    {ruolo === "admin" && <form.Field name="email" children={(field) => (
                                        <>
                                            <Field className="mt-4">
                                                <FieldLabel htmlFor="email-utente">Email</FieldLabel>
                                                <FieldContent>
                                                    <Input
                                                        id="email-utente"
                                                        type="email"
                                                        placeholder="email@esempio.it"
                                                        required
                                                        value={field.state.value}
                                                        onChange={(e) =>
                                                            field.handleChange(e.target.value)}
                                                            

                                                    />
                                                </FieldContent>
                                            </Field>
                                            {
                                                field.state.meta.errors.length > 0 && field.state.meta.isTouched && (
                                                    field.state.meta.errors.map((error, index) => (
                                                        <span key={index} className="text-red-500 text-xs">
                                                            {error?.message}
                                                        </span>
                                                    ))
                                                )
                                            }
                                        </>
                                    )} />}
                                    {ruolo === "collaboratore" && <form.Field name="username" children={(field) => (
                                        <>
                                            <Field className="mt-4">
                                                <FieldLabel htmlFor="username-utente">Username</FieldLabel>
                                                <FieldContent>
                                                    <Input
                                                        id="username-utente"
                                                        placeholder="username (senza @)"
                                                        required
                                                        value={field.state.value}
                                                        onChange={(e) =>
                                                            field.handleChange(e.target.value)}
                                                    />
                                                </FieldContent>
                                            </Field>
                                            {
                                                field.state.meta.errors.length > 0 && field.state.meta.isTouched && (
                                                    field.state.meta.errors.map((error, index) => (
                                                        <span key={index} className="text-red-500 text-xs">
                                                            {error?.message}
                                                        </span>
                                                    ))
                                                )
                                            }
                                        </>
                                    )} />}

                                </>
                            )}
                        </form.Subscribe>
                        <form.Field name="password" children={(field) => (
                            <>
                                <Field className="mt-4">
                                    <FieldLabel htmlFor="password-utente">
                                        Password (lascia vuoto per non modificare)
                                    </FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="password-utente"
                                            type="password"
                                            placeholder="Minimo 8 caratteri"
                                            value={field.state.value}
                                            onChange={(e) =>
                                                field.handleChange(e.target.value)}
                                        />
                                    </FieldContent>
                                </Field>
                                {
                                    field.state.meta.errors.length > 0 && field.state.meta.isTouched && (
                                        field.state.meta.errors.map((error, index) => (
                                            <span key={index} className="text-red-500 text-xs">
                                                {error?.message}
                                            </span>
                                        ))
                                    )
                                }

                            </>
                        )} />



                </form>
                {
                    updateUtente.isError && updateUtente.error && (
                        <span className="text-red-500 text-xs">
                            {formatError(updateUtente.error, "Errore durante la modifica dell'utenza.")}
                        </span>
                    )
                }

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
                                disabled={!canSubmit || isSubmitting || !isDirty || updateUtente.isPending}
                            >
                                {isSubmitting ? "Salvataggio in corso..." : "Salva"}
                            </Button>
                        )}
                    </form.Subscribe>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    )
}
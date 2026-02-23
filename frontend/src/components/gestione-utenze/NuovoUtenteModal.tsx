import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { useForm } from "@tanstack/react-form";
import { createUtenteSchema, type CreateUtente } from "@shared/validation";
import { useCreateUtente } from "@/hooks/use-utenti";
import { formatError } from "@/lib/utils.js";
import { HugeiconsIcon } from "@hugeicons/react";
import { Plus } from "@hugeicons/core-free-icons";
interface NuovoUtenteModalProps {
    typeForm: "view" | "add" | "edit" | "delete" | null;
    onClose: () => void;
    onOpenAddForm: () => void;
}

export default function NuovoUtenteModal({ typeForm, onClose, onOpenAddForm }: NuovoUtenteModalProps) {
    const createUtente = useCreateUtente();
    const defaultValue = {
        ruolo: "collaboratore",
        username: "",
        password: "",
    } as CreateUtente;


    const form = useForm({
        defaultValues: defaultValue,
        validators: {
            onChange: createUtenteSchema,
            onMount: createUtenteSchema,
        },
        onSubmit: async ({ value }) => {
            createUtente.mutate(value, {
                onSuccess: () => {
                    onClose();	
                    createUtente.reset();
                    form.reset();
                }
            })

        }
    })



    return (
        <Dialog
            open={typeForm === "add"}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                    createUtente.reset();
                    form.reset();
                } 
            }}
        >
            <DialogTrigger asChild>
                <Button variant="default" onClick={onOpenAddForm}>
                    Aggiungi utenza
                    <HugeiconsIcon icon={Plus} strokeWidth={2} className="size-4" />    
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Aggiungi utenza
                    </DialogTitle>
                    <DialogDescription>
                        Inserisci ruolo, email o username e password.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}>
                        <form.Field name="ruolo" children={(field) => (
                            <Field>
                                <FieldLabel>Ruolo</FieldLabel>
                                <Select
                                    disabled={form.state.isSubmitting}
                                    value={field.state.value}
                                    required
                                    onValueChange={(value) => field.handleChange(value as "admin" | "collaboratore")}
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

                        <form.Subscribe selector={(state) => [state.values.ruolo]}>
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
                                            required
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
                        createUtente.isError && createUtente.error && (
                            <span className="text-red-500 text-xs">
                                {formatError(createUtente.error, "Errore durante l'aggiunta dell'utenza.")}
                            </span>
                        )
                    }
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
                                disabled={!canSubmit || isSubmitting || !isDirty || createUtente.isPending}
                            >
                                {isSubmitting ? "Aggiungi in corso..." : "Aggiungi"}
                            </Button>
                        )}
                    </form.Subscribe>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
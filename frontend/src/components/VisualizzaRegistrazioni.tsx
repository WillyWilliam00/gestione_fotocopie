import { FileIcon, DeleteIcon } from "@hugeicons/core-free-icons";
import HeaderSection from "./HeaderSection";
import { HugeiconsIcon } from "@hugeicons/react";
import { Dialog, DialogHeader, DialogContent, DialogDescription, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { VisualizzaRegistrazioniContent } from "./VisualizzaRegistrazioniContent";
import { type Registrazioni } from "./table/columns";
import { useState, Suspense } from "react";
import { useForm } from "@tanstack/react-form";
import { formatError } from "@/lib/utils";
import { useUpdateRegistrazione, useDeleteRegistrazione } from "@/hooks/use-registrazioni";
import { modifyRegistrazioneFormSchema } from "../../../shared/validation";

type DialogMode = 'view' | 'edit' | null;

export default function VisualizzaRegistrazioni() {
    const [dialogMode, setDialogMode] = useState<DialogMode>(null);
    const [selectedRegistrazione, setSelectedRegistrazione] = useState<Registrazioni | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { mutate: updateRegistrazione, isPending: isUpdating, isError: isUpdateError, error: updateError, reset: resetUpdateMutation } = useUpdateRegistrazione();
    const { mutate: deleteRegistrazione, isPending: isDeleting, isError: isDeleteError, error: deleteError, reset: resetDeleteMutation } = useDeleteRegistrazione();

    // TanStack Form con validazione Zod
    const form = useForm({
        defaultValues: {
            copieEffettuate: '',
            note: '',
        },
        validators: {
            onChange: modifyRegistrazioneFormSchema,
        },
        onSubmit: async ({ value }) => {
            if (dialogMode === 'edit' && selectedRegistrazione) {
                updateRegistrazione(
                    {
                        id: selectedRegistrazione.id,
                        data: {
                            copieEffettuate: Number(value.copieEffettuate),
                            note: value.note?.trim() || undefined,
                        },
                    },
                    {
                        onSuccess: () => {
                            handleCloseDialog();
                        },
                    }
                );
            }
        },
    });

    const handleOpenView = (registrazione: Registrazioni) => {
        setSelectedRegistrazione(registrazione);
        setDialogMode('view');
    };

    const handleOpenEdit = (registrazione: Registrazioni) => {
        setSelectedRegistrazione(registrazione);
        resetUpdateMutation(); // Reset dello stato della mutation quando si apre edit
        form.setFieldValue('copieEffettuate', String(registrazione.copieEffettuate));
        form.setFieldValue('note', registrazione.note || '');
        setDialogMode('edit');
    };

    const handleOpenDelete = (registrazione: Registrazioni) => {
        setSelectedRegistrazione(registrazione);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogMode(null);
        setSelectedRegistrazione(null);
        // Non serve form.reset() qui: viene chiamato quando riapriamo il dialog
        // Non serve resetMutation qui: TanStack Query resetta automaticamente lo stato alla prossima mutation
    };

    const docenteNomeCompleto = selectedRegistrazione 
        ? `${selectedRegistrazione.docenteNome || ''} ${selectedRegistrazione.docenteCognome || ''}`.trim() || '-'
        : '-';

    const utenteDisplay = selectedRegistrazione
        ? (selectedRegistrazione.utenteUsername || selectedRegistrazione.utenteEmail || '-')
        : '-';

    return (
        <div>
            <HeaderSection title="Visualizza Registrazioni Copie" icon={FileIcon} />

            <div className="px-4">
                {/* Tabella delle registrazioni: sospende fino al primo caricamento, poi mostra dati e isFetching per i refetch */}
                <Suspense fallback={<div className="w-full mt-4 p-8 text-center text-muted-foreground">Caricamento registrazioni…</div>}>
                    <VisualizzaRegistrazioniContent
                        onView={handleOpenView}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                    />
                </Suspense>
            </div>

            {/* Dialog unificato per View/Edit */}
            <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && handleCloseDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogMode === 'view' && 'Visualizza registrazione'}
                            {dialogMode === 'edit' && 'Modifica registrazione'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'view' && 'Visualizza i dettagli della registrazione copie.'}
                            {dialogMode === 'edit' && 'Modifica il numero di copie e le note della registrazione.'}
                        </DialogDescription>
                    </DialogHeader>
                    {dialogMode === 'view' ? (
                        <>
                            <div className="space-y-4 py-4">
                                <Field>
                                    <FieldLabel htmlFor="docente-view">Docente</FieldLabel>
                                    <FieldContent>
                                        <Input 
                                            id="docente-view" 
                                            value={docenteNomeCompleto}
                                            disabled
                                        />
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="copie-view">Copie Effettuate</FieldLabel>
                                    <FieldContent>
                                        <Input 
                                            id="copie-view" 
                                            type="number"
                                            value={selectedRegistrazione?.copieEffettuate ?? 0}
                                            disabled
                                        />
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="utente-view">Utente</FieldLabel>
                                    <FieldContent>
                                        <Input 
                                            id="utente-view" 
                                            value={utenteDisplay}
                                            disabled
                                        />
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="note-view">Note</FieldLabel>
                                    <FieldContent>
                                        <Textarea 
                                            id="note-view" 
                                            value={selectedRegistrazione?.note || ''}
                                            disabled
                                            rows={3}
                                        />
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="data-view">Data/Ora</FieldLabel>
                                    <FieldContent>
                                        <Input 
                                            id="data-view" 
                                            value={selectedRegistrazione?.createdAt 
                                                ? new Date(selectedRegistrazione.createdAt).toLocaleString('it-IT', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : ''}
                                            disabled
                                        />
                                    </FieldContent>
                                </Field>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" onClick={handleCloseDialog}>
                                        Chiudi
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </>
                    ) : (
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
                                            value={docenteNomeCompleto}
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
                                                    min="1"
                                                    required
                                                    disabled={isUpdating}
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    onBlur={field.handleBlur}
                                                />
                                                {field.state.meta.errors.length > 0 && (
                                                    <p className="text-sm text-destructive mt-1">
                                                        {typeof field.state.meta.errors[0] === 'string' 
                                                            ? field.state.meta.errors[0]
                                                            : field.state.meta.errors[0]?.message ?? 'Errore di validazione'}
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
                                                    disabled={isUpdating}
                                                    value={field.state.value || ''}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    onBlur={field.handleBlur}
                                                    rows={3}
                                                />
                                            </FieldContent>
                                        </Field>
                                    )}
                                />
                            </div>
                            {isUpdateError && updateError && (
                                <div className="my-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                    <p className="text-sm text-destructive">
                                        {formatError(updateError, "Errore durante il salvataggio")}
                                    </p>
                                </div>
                            )}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" onClick={handleCloseDialog} type="button">
                                        Annulla
                                    </Button>
                                </DialogClose>
                                <Button
                                    variant="default"
                                    type="submit"
                                    disabled={isUpdating || !form.state.isValid}
                                >
                                    {isUpdating ? 'Salvataggio in corso…' : 'Salva'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* AlertDialog per Delete */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => { 
                if (open) resetDeleteMutation(); 
                setIsDeleteDialogOpen(open);
                if (!open) setSelectedRegistrazione(null);
            }}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} />
                        </AlertDialogMedia>
                        <AlertDialogTitle>
                            Eliminare la registrazione di {docenteNomeCompleto}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Questa azione eliminerà la registrazione di {selectedRegistrazione?.copieEffettuate ?? 0} copie per {docenteNomeCompleto} dal sistema. Questa operazione non può essere annullata.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {isDeleteError && deleteError && (
                        <p className="text-sm text-destructive px-6" role="alert">
                            {formatError(deleteError, "Errore durante l'eliminazione.")}
                        </p>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel variant="outline" disabled={isDeleting}>Annulla</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => {
                                if (!selectedRegistrazione) return;
                                deleteRegistrazione(selectedRegistrazione.id, {
                                    onSuccess: () => {
                                        setIsDeleteDialogOpen(false);
                                        setSelectedRegistrazione(null);
                                    },
                                });
                            }}
                        >
                            {isDeleting ? 'Eliminazione…' : 'Elimina'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

import { FileIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import HeaderSection from "./HeaderSection";
import { HugeiconsIcon } from "@hugeicons/react";
import { DeleteIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogHeader, DialogContent, DialogDescription, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { DataTable } from "./table/DataTable";
import { createColumnsDocenti, type Docenti } from "./table/columns";
import { useState, Suspense } from "react";
import { useForm } from "@tanstack/react-form";
import { AxiosError } from "axios";
import { useCreateDocente, useDocentiSuspense, useDeleteAllDocenti } from "@/hooks/use-docenti";
import { useDeleteAllRegistrazioni } from "@/hooks/use-registrazioni.js";
import { insertDocenteFormSchema, type DocentiQuery } from "../../../shared/validation.js";
import { ImportDocentiDialog } from "./ImportDocentiDialog";

type DialogMode = 'add' | 'edit' | 'view' | null;

const defaultQuery: DocentiQuery = { page: 1, pageSize: 10, sortOrder: 'desc', sortField: 'createdAt' };

/** Contenuto che sospende fino al caricamento dei docenti; da usare dentro <Suspense>. */
function GestioneDocentiContent({
  query,
  onView,
  onEdit,
  onDelete,
  onAddClick,
  onImportClick,
  onPageChange,
}: {
  query: DocentiQuery;
  onView: (docente: Docenti) => void;
  onEdit: (docente: Docenti) => void;
  onDelete: (docente: Docenti) => void;
  onAddClick: () => void;
  onImportClick: () => void;
  onPageChange: (page: number) => void;
}) {
  const { data, isFetching } = useDocentiSuspense(query);
  const columns = createColumnsDocenti({ onView, onEdit, onDelete });
  const tableData: Docenti[] = data.data.map((d) => ({
    nome: d.nome,
    cognome: d.cognome,
    copieEffettuate: d.copieEffettuate,
    copieRimanenti: d.copieRimanenti,
    limite: d.limiteCopie,
  }));

  return (
    <div className="w-full mt-4">
      {isFetching && (
        <div className="text-muted-foreground text-sm py-1" aria-live="polite">
          Aggiornamento dati…
        </div>
      )}
      <DataTable
        columns={columns}
        data={tableData}
        showAddButton={true}
        showImportButton={true}
        onAddClick={onAddClick}
        onImportClick={onImportClick}
        pagination={data.pagination}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default function GestioneDocenti() {
    const [dialogMode, setDialogMode] = useState<DialogMode>(null);
    const [selectedDocente, setSelectedDocente] = useState<Docenti | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isResetConteggioOpen, setIsResetConteggioOpen] = useState(false);
    const { mutate: createDocente, isPending: isCreating, isError, error, reset: resetMutation } = useCreateDocente();
    const { mutate: deleteAllRegistrazioni, isPending: isResettingConteggio, isError: isResetError, error: resetError, reset: resetResetMutation } = useDeleteAllRegistrazioni();
    const { mutate: deleteAllDocenti, isPending: isDeletingAll, isError: isDeleteAllError, error: deleteAllError, reset: resetDeleteAllMutation } = useDeleteAllDocenti();
    const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
    const [docentiQuery, setDocentiQuery] = useState<DocentiQuery>(defaultQuery);

    const handlePageChange = (page: number) => {
        setDocentiQuery((prevQuery) => ({
            ...prevQuery,
            page,
        }));
    };

    // TanStack Form con validazione Zod
    const form = useForm({
        defaultValues: {
            nome: '',
            cognome: '',
            limiteCopie: '',
        },
        validators: {
            onChange: insertDocenteFormSchema,
        },
        onSubmit: async ({ value }) => {
            if (dialogMode === 'add') {
                createDocente(
                    {
                        nome: value.nome,
                        cognome: value.cognome,
                        limiteCopie: Number(value.limiteCopie),
                    },
                    {
                        onSuccess: () => {
                            handleCloseDialog();
                        },
                    }
                );
            } else if (dialogMode === 'edit' && selectedDocente) {
                // TODO: collega update docente
                console.log("Salva modifiche docente:", { ...selectedDocente, ...value });
                handleCloseDialog();
            }
        },
    });

    const handleOpenAddDialog = () => {
        form.reset();
        resetMutation(); // Reset dello stato della mutation per pulire eventuali errori residui
        setDialogMode('add');
    };

    const handleCloseDialog = () => {
        setDialogMode(null);
        setSelectedDocente(null);
        // Non serve form.reset() qui: viene chiamato quando riapriamo il dialog
        // Non serve resetMutation qui: TanStack Query resetta automaticamente lo stato alla prossima mutation
    };

    return (
        <div>
            <div className="flex justify-end pt-5 pr-5 w-full gap-2">
                <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={(open) => { if (open) resetDeleteAllMutation(); setIsDeleteAllDialogOpen(open); }}>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="">
                            <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} />
                            <span className="">
                                Elimina tutti i docenti
                            </span>
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
                        {isDeleteAllError && deleteAllError && (
                            <p className="text-sm text-destructive" role="alert">
                                {deleteAllError instanceof AxiosError
                                    ? (deleteAllError.response?.data?.error || deleteAllError.message || 'Errore durante l\'eliminazione.')
                                    : (deleteAllError instanceof Error ? deleteAllError.message : 'Errore durante l\'eliminazione.')}
                            </p>
                        )}
                        <AlertDialogFooter>
                            <AlertDialogCancel variant="outline" disabled={isDeletingAll}>Annulla</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                disabled={isDeletingAll}
                                onClick={() => deleteAllDocenti(undefined, {
                                    onSuccess: () => setIsDeleteAllDialogOpen(false),
                                })}
                            >
                                {isDeletingAll ? 'Eliminazione…' : 'Elimina tutti'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <AlertDialog open={isResetConteggioOpen} onOpenChange={(open) => { if (open) resetResetMutation(); setIsResetConteggioOpen(open); }}>
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
                            {isResetError && resetError && (
                                <p className="text-sm text-destructive" role="alert">
                                    {resetError instanceof AxiosError
                                        ? (resetError.response?.data?.error || resetError.message || 'Errore durante il reset.')
                                        : (resetError instanceof Error ? resetError.message : 'Errore durante il reset.')}
                                </p>
                            )}
                            <AlertDialogFooter>
                                <AlertDialogCancel variant="outline" disabled={isResettingConteggio}>Annulla</AlertDialogCancel>
                                <Button
                                    variant="destructive"
                                    disabled={isResettingConteggio}
                                    onClick={() => deleteAllRegistrazioni(undefined, {
                                        onSuccess: () => setIsResetConteggioOpen(false),
                                    })}
                                >
                                    {isResettingConteggio ? 'Attendere…' : 'Sì'}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
            </div>
            <HeaderSection title="Gestione Docenti" icon={FileIcon} />

            <div className=" px-4 ">
                

                {/* Tabella dei docenti: sospende fino al primo caricamento, poi mostra dati e isFetching per i refetch */}
                <Suspense fallback={<div className="w-full mt-4 p-8 text-center text-muted-foreground">Caricamento docenti…</div>}>
                    <GestioneDocentiContent
                        query={docentiQuery}
                        onView={(docente) => {
                            setSelectedDocente(docente);
                            setDialogMode('view');
                        }}
                        onEdit={(docente) => {
                            setSelectedDocente(docente);
                            resetMutation(); // Reset dello stato della mutation quando si apre edit
                            form.setFieldValue('nome', docente.nome);
                            form.setFieldValue('cognome', docente.cognome);
                            form.setFieldValue('limiteCopie', String(docente.limite));
                            setDialogMode('edit');
                        }}
                        onDelete={(docente) => {
                            setSelectedDocente(docente);
                            setIsDeleteDialogOpen(true);
                        }}
                        onAddClick={handleOpenAddDialog}
                        onImportClick={() => setIsImportDialogOpen(true)}
                        onPageChange={handlePageChange}
                    />
                </Suspense>
            </div>

            {/* Dialog unificato per Add/Edit/View */}
            <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && handleCloseDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogMode === 'add' && 'Aggiungi docente'}
                            {dialogMode === 'edit' && 'Modifica docente'}
                            {dialogMode === 'view' && 'Visualizza docente'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'add' && 'Inserisci il nome, il cognome e il limite di fotocopie del docente.'}
                            {dialogMode === 'edit' && 'Modifica il nome, il cognome e il limite di fotocopie del docente.'}
                            {dialogMode === 'view' && 'Visualizza i dettagli del docente.'}
                        </DialogDescription>
                    </DialogHeader>
                    {dialogMode === 'view' ? (
                        <>
                            <div className="space-y-4 py-4">
                                <Field>
                                    <FieldLabel htmlFor="nome-docente">Nome</FieldLabel>
                                    <FieldContent>
                                        <Input 
                                            id="nome-docente" 
                                            value={selectedDocente?.nome ?? ''}
                                            disabled
                                        />
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="cognome-docente">Cognome</FieldLabel>
                                    <FieldContent>
                                        <Input 
                                            id="cognome-docente" 
                                            value={selectedDocente?.cognome ?? ''}
                                            disabled
                                        />
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
                                                    disabled={isCreating}
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
                                    name="cognome"
                                    children={(field) => (
                                        <Field>
                                            <FieldLabel htmlFor="cognome-docente">Cognome</FieldLabel>
                                            <FieldContent>
                                                <Input 
                                                    id="cognome-docente" 
                                                    placeholder="Inserisci il cognome del docente"
                                                    required
                                                    disabled={isCreating}
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
                                    name="limiteCopie"
                                    children={(field) => (
                                        <Field>
                                            <FieldLabel htmlFor="numero-copie">Numero di copie</FieldLabel>
                                            <FieldContent>
                                                <Input 
                                                    id="numero-copie" 
                                                    type="number"
                                                    placeholder="Inserisci il limite di fotocopie"
                                                    min="0"
                                                    required
                                                    disabled={isCreating}
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
                            </div>
                            {isError && error && (
                                <div className="my-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                    <p className="text-sm text-destructive">
                                        {error instanceof AxiosError 
                                            ? (error.response?.data?.error || error.message || 'Errore durante il salvataggio')
                                            : (error instanceof Error 
                                                ? error.message 
                                                : 'Errore durante il salvataggio. Riprova più tardi.')}
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
                                    disabled={isCreating || !form.state.isValid}
                                >
                                    {dialogMode === 'add'
                                        ? isCreating
                                            ? 'Aggiunta in corso…'
                                            : 'Aggiungi'
                                        : 'Salva'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                   
                    <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                                <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} />
                            </AlertDialogMedia>
                            <AlertDialogTitle>Eliminare il docente {selectedDocente?.nome} {selectedDocente?.cognome}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Questa azione eliminerà il docente {selectedDocente?.nome} {selectedDocente?.cognome} dal sistema. Questa operazione non può essere annullata.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel variant="outline">Annulla</AlertDialogCancel>
                            <AlertDialogAction variant="destructive">Elimina</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            <ImportDocentiDialog
                open={isImportDialogOpen}
                onOpenChange={setIsImportDialogOpen}
            />
        </div>
    )
}
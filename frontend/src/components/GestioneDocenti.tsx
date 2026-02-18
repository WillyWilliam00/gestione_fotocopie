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
import { useDocentiSuspense } from "@/hooks/use-docenti";
import type { DocentiQuery } from "../../../shared/validation.js";

type DialogMode = 'add' | 'edit' | 'view' | null;

const defaultQuery: DocentiQuery = { page: 1, pageSize: 20, sortOrder: 'asc' };

/** Contenuto che sospende fino al caricamento dei docenti; da usare dentro <Suspense>. */
function GestioneDocentiContent({
  query,
  onView,
  onEdit,
  onDelete,
  onAddClick,
  onImportClick,
}: {
  query: DocentiQuery;
  onView: (docente: Docenti) => void;
  onEdit: (docente: Docenti) => void;
  onDelete: (docente: Docenti) => void;
  onAddClick: () => void;
  onImportClick: () => void;
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
      />
    </div>
  );
}

export default function GestioneDocenti() {
    const [dialogMode, setDialogMode] = useState<DialogMode>(null);
    const [selectedDocente, setSelectedDocente] = useState<Docenti | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    // Form state per Add/Edit
    const [formData, setFormData] = useState<Pick<Docenti, 'nome' | 'cognome' | 'limite'>>({
        nome: '',
        cognome: '',
        limite: 0,
    });
    const [docentiQuery, setDocentiQuery] = useState<DocentiQuery>(defaultQuery);

    const handleOpenAddDialog = () => {
        setFormData({ nome: '', cognome: '', limite: 0 });
        setDialogMode('add');
    };

    const handleCloseDialog = () => {
        setDialogMode(null);
        setSelectedDocente(null);
        setFormData({ nome: '', cognome: '', limite: 0 });
    };

    const handleSaveDocente = () => {
        if (dialogMode === 'add') {
            // TODO: Aggiungi nuovo docente
            console.log("Aggiungi docente:", formData);
        } else if (dialogMode === 'edit' && selectedDocente) {
            // TODO: Aggiorna docente esistente
            console.log("Salva modifiche docente:", { ...selectedDocente, ...formData });
        }
        handleCloseDialog();
    };

    return (
        <div>
            <div className="flex justify-end pt-5 pr-5 w-full gap-2">
                <AlertDialog>
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
                        <AlertDialogFooter>
                            <AlertDialogCancel variant="outline">Annulla</AlertDialogCancel>
                            <AlertDialogAction variant="destructive">Elimina tutti</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
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
                                <AlertDialogTitle>Resettare il conteggio totale dei docenti?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Questa azione resetterà il conteggio totale dei docenti.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel variant="outline">Annulla</AlertDialogCancel>
                                <AlertDialogAction variant="destructive">Resetta</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
            </div>
            <HeaderSection title="Gestione Docenti" icon={FileIcon} />

            <div className=" px-4">
                

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
                            setFormData({
                                nome: docente.nome,
                                cognome: docente.cognome,
                                limite: docente.limite,
                            });
                            setDialogMode('edit');
                        }}
                        onDelete={(docente) => {
                            setSelectedDocente(docente);
                            setIsDeleteDialogOpen(true);
                        }}
                        onAddClick={handleOpenAddDialog}
                        onImportClick={() => {
                            // TODO: Implementa la funzione per importare file
                            console.log("Importa file");
                        }}
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
                    <div className="space-y-4 py-4">
                        <Field>
                            <FieldLabel htmlFor="nome-docente">Nome</FieldLabel>
                            <FieldContent>
                                <Input 
                                    id="nome-docente" 
                                    placeholder="Inserisci il nome del docente"
                                    required={dialogMode !== 'view'}
                                    disabled={dialogMode === 'view'}
                                    value={dialogMode === 'view' ? selectedDocente?.nome ?? '' : formData.nome}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                />
                            </FieldContent>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="cognome-docente">Cognome</FieldLabel>
                            <FieldContent>
                                <Input 
                                    id="cognome-docente" 
                                    placeholder="Inserisci il cognome del docente"
                                    required={dialogMode !== 'view'}
                                    disabled={dialogMode === 'view'}
                                    value={dialogMode === 'view' ? selectedDocente?.cognome ?? '' : formData.cognome}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cognome: e.target.value }))}
                                />
                            </FieldContent>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="numero-copie">Numero di copie</FieldLabel>
                            <FieldContent>
                                <Input 
                                    id="numero-copie" 
                                    type="number"
                                    placeholder="Inserisci il limite di fotocopie"
                                    min="0"
                                    required={dialogMode !== 'view'}
                                    disabled={dialogMode === 'view'}
                                    value={dialogMode === 'view' ? selectedDocente?.limite ?? 0 : formData.limite}
                                    onChange={(e) => setFormData(prev => ({ ...prev, limite: Number(e.target.value) }))}
                                />
                            </FieldContent>
                        </Field>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleCloseDialog}>
                                {dialogMode === 'view' ? 'Chiudi' : 'Annulla'}
                            </Button>
                        </DialogClose>
                        {dialogMode !== 'view' && (
                            <Button variant="default" onClick={handleSaveDocente}>
                                {dialogMode === 'add' ? 'Aggiungi' : 'Salva'}
                            </Button>
                        )}
                    </DialogFooter>
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
        </div>
    )
}
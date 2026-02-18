import { Suspense, useState, useCallback, startTransition } from "react";
import HeaderSection from "./HeaderSection";
import { GestioneUtenzeContent } from "./GestioneUtenzeContent";
import { KeyIcon, Plus, SearchIcon, DeleteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { Utente } from "../../../shared/types.js";
import type { UtentiQuery, CreateUtente, ModifyUtente } from "../../../shared/validation.js";
import { useCreateUtente, useUpdateUtente, useDeleteUtente } from "../hooks/use-utenti";

type DialogMode = "add" | "edit" | "view" | "delete" | null;

function utenteDisplayName(u: Utente): string {
  return u.ruolo === "admin" ? (u as { email: string }).email : (u as { username: string }).username;
}

const defaultQuery: UtentiQuery = {
  page: 1,
  pageSize: 10,
  sortOrder: "asc",
};

export default function GestioneUtenze() {
  const [query, setQuery] = useState<UtentiQuery>(defaultQuery);
  const [searchInput, setSearchInput] = useState("");
  const [identifier, setIdentifier] = useState<string | undefined>(undefined);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedUtente, setSelectedUtente] = useState<Utente | null>(null);

  const [addForm, setAddForm] = useState<{
    ruolo: "admin" | "collaboratore";
    email: string;
    username: string;
    password: string;
  }>({ ruolo: "collaboratore", email: "", username: "", password: "" });

  const [editForm, setEditForm] = useState<{
    ruolo: "admin" | "collaboratore";
    email: string;
    username: string;
    password: string;
  }>({ ruolo: "collaboratore", email: "", username: "", password: "" });

  const createUtente = useCreateUtente();
  const updateUtente = useUpdateUtente();
  const deleteUtente = useDeleteUtente();

  const queryWithFilter: UtentiQuery = {
    ...query,
    identifier,
  };

  const handleAddClick = useCallback(() => {
    setAddForm({ ruolo: "collaboratore", email: "", username: "", password: "" });
    setDialogMode("add");
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogMode(null);
    setSelectedUtente(null);
  }, []);

  const handleOpenEdit = useCallback((utente: Utente) => {
    setSelectedUtente(utente);
    const email = utente.ruolo === "admin" ? (utente as { email: string }).email : "";
    const username = utente.ruolo === "collaboratore" ? (utente as { username: string }).username : "";
    setEditForm({
      ruolo: utente.ruolo,
      email,
      username,
      password: "",
    });
    setDialogMode("edit");
  }, []);

  const handleCreateSubmit = useCallback(async () => {
    const data: CreateUtente =
      addForm.ruolo === "admin"
        ? { ruolo: "admin", email: addForm.email, password: addForm.password }
        : { ruolo: "collaboratore", username: addForm.username, password: addForm.password };
    await createUtente.mutateAsync(data);
    handleCloseDialog();
  }, [addForm, createUtente, handleCloseDialog]);

  const handleUpdateSubmit = useCallback(async () => {
    if (!selectedUtente) return;
    const data: ModifyUtente =
      editForm.ruolo === "admin"
        ? {
            ruolo: "admin",
            email: editForm.email,
            ...(editForm.password && { password: editForm.password }),
          }
        : {
            ruolo: "collaboratore",
            username: editForm.username,
            ...(editForm.password && { password: editForm.password }),
          };
    await updateUtente.mutateAsync({ id: selectedUtente.id, data });
    handleCloseDialog();
  }, [editForm, selectedUtente, updateUtente, handleCloseDialog]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedUtente) return;
    await deleteUtente.mutateAsync(selectedUtente.id);
    setDialogMode(null);
    setSelectedUtente(null);
  }, [selectedUtente, deleteUtente]);

  const viewIdentifier = selectedUtente ? utenteDisplayName(selectedUtente) : "";

  return (
    <div>
      <HeaderSection title="Gestione Utenze" icon={KeyIcon} />

      <div className="w-full mt-10 p-4">
        <div className="flex flex-row gap-2 items-end justify-between flex-wrap">
          <Field className="flex-1 min-w-[200px] max-w-xl">
            <FieldLabel htmlFor="search-utenti">Cerca per email o username</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="search-utenti"
                value={searchInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchInput(value);
                  startTransition(() => setIdentifier(value.trim() || undefined));
                }}
                placeholder="email@esempio.it o username..."
              />
              <InputGroupAddon align="inline-start">
                <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-4" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Button className="mt-4" variant="default" onClick={handleAddClick}>
            Aggiungi utenza
            <HugeiconsIcon icon={Plus} strokeWidth={2} className="size-4" />
          </Button>
        </div>

        <Suspense
          fallback={
            <div className="overflow-hidden rounded-md border mt-6 p-8 text-center text-muted-foreground">
              Caricamento utenze…
            </div>
          }
        >
          <GestioneUtenzeContent
            query={queryWithFilter}
            onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
            onView={(utente) => {
              setSelectedUtente(utente);
              setDialogMode("view");
            }}
            onEdit={handleOpenEdit}
            onDelete={(utente) => {
              setSelectedUtente(utente);
              setDialogMode("delete");
            }}
          />
        </Suspense>
      </div>

      <Dialog
        open={dialogMode !== null && dialogMode !== "delete"}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add" && "Aggiungi utenza"}
              {dialogMode === "edit" && "Modifica utenza"}
              {dialogMode === "view" && "Visualizza utenza"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add" && "Inserisci ruolo, email o username e password."}
              {dialogMode === "edit" && "Modifica i dati dell’utenza. La password è opzionale."}
              {dialogMode === "view" && "Dettagli utenza."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Field>
              <FieldLabel>Ruolo</FieldLabel>
              <Select
                disabled={dialogMode === "view"}
                value={dialogMode === "edit" ? editForm.ruolo : addForm.ruolo}
                onValueChange={(value) => {
                  const v = value as "admin" | "collaboratore";
                  if (dialogMode === "edit") setEditForm((prev) => ({ ...prev, ruolo: v }));
                  else setAddForm((prev) => ({ ...prev, ruolo: v }));
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

            {dialogMode === "view" && (
              <>
                <Field>
                  <FieldLabel>Identificativo</FieldLabel>
                  <FieldContent>
                    <Input value={viewIdentifier} readOnly disabled />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>ID</FieldLabel>
                  <FieldContent>
                    <Input value={selectedUtente?.id ?? ""} readOnly disabled className="font-mono text-xs" />
                  </FieldContent>
                </Field>
              </>
            )}

            {(dialogMode === "add" || dialogMode === "edit") &&
              (dialogMode === "edit" ? editForm.ruolo : addForm.ruolo) === "admin" && (
                <Field>
                  <FieldLabel htmlFor="email-utente">Email</FieldLabel>
                  <FieldContent>
                    <Input
                      id="email-utente"
                      type="email"
                      placeholder="email@esempio.it"
                      required={dialogMode === "add"}
                      value={dialogMode === "edit" ? editForm.email : addForm.email}
                      onChange={(e) =>
                        dialogMode === "edit"
                          ? setEditForm((prev) => ({ ...prev, email: e.target.value }))
                          : setAddForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                  </FieldContent>
                </Field>
              )}

            {(dialogMode === "add" || dialogMode === "edit") &&
              (dialogMode === "edit" ? editForm.ruolo : addForm.ruolo) === "collaboratore" && (
                <Field>
                  <FieldLabel htmlFor="username-utente">Username</FieldLabel>
                  <FieldContent>
                    <Input
                      id="username-utente"
                      placeholder="username (senza @)"
                      required={dialogMode === "add"}
                      value={dialogMode === "edit" ? editForm.username : addForm.username}
                      onChange={(e) =>
                        dialogMode === "edit"
                          ? setEditForm((prev) => ({ ...prev, username: e.target.value }))
                          : setAddForm((prev) => ({ ...prev, username: e.target.value }))
                      }
                    />
                  </FieldContent>
                </Field>
              )}

            {(dialogMode === "add" || dialogMode === "edit") && (
              <Field>
                <FieldLabel htmlFor="password-utente">
                  Password {dialogMode === "edit" && "(lascia vuoto per non modificare)"}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="password-utente"
                    type="password"
                    placeholder="Minimo 8 caratteri"
                    required={dialogMode === "add"}
                    value={dialogMode === "edit" ? editForm.password : addForm.password}
                    onChange={(e) =>
                      dialogMode === "edit"
                        ? setEditForm((prev) => ({ ...prev, password: e.target.value }))
                        : setAddForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                </FieldContent>
              </Field>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={handleCloseDialog}>
                {dialogMode === "view" ? "Chiudi" : "Annulla"}
              </Button>
            </DialogClose>
            {dialogMode !== "view" && (
              <Button
                variant="default"
                onClick={dialogMode === "add" ? handleCreateSubmit : handleUpdateSubmit}
                disabled={
                  createUtente.isPending ||
                  updateUtente.isPending ||
                  (dialogMode === "add" &&
                    (addForm.ruolo === "admin"
                      ? !addForm.email || addForm.password.length < 8
                      : addForm.username.length < 3 || addForm.password.length < 8))
                }
              >
                {dialogMode === "add" ? "Aggiungi" : "Salva"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialogMode === "delete"} onOpenChange={(open) => !open && (setDialogMode(null), setSelectedUtente(null))}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} />
            </AlertDialogMedia>
            <AlertDialogTitle>
              Eliminare l’utenza {selectedUtente ? utenteDisplayName(selectedUtente) : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione eliminerà l’utenza dal sistema. Non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Annulla</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteUtente.isPending}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import type { Utente } from "@shared/types";
import { utenteDisplayName } from "@/lib/utils";

interface ViewUtenteModalProps {
    selectedUtente: Utente | null;
    typeForm: "view" | "edit" | "delete" | "add" | null;
    onClose: () => void;
}
export function ViewUtenteModal({ selectedUtente, typeForm, onClose }: ViewUtenteModalProps) {
    const viewIdentifier = selectedUtente &&  utenteDisplayName(selectedUtente) 
    return (
        <Dialog
        open={typeForm === "view" && selectedUtente !== null}
        onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Visualizza utenza
                    </DialogTitle>
                    <DialogDescription>
                        Dettagli utenza.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Field>
                        <FieldLabel>Ruolo</FieldLabel>
                        <Select
                            disabled={true}
                            value={selectedUtente?.ruolo ?? "collaboratore"}
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

                    <>
                        <Field>
                            <FieldLabel>Identificativo</FieldLabel>
                            <FieldContent>
                                <Input value={viewIdentifier ?? ""} readOnly disabled />
                            </FieldContent>
                        </Field>
                        <Field>
                            <FieldLabel>ID</FieldLabel>
                            <FieldContent>
                                <Input value={selectedUtente?.id ?? ""} readOnly disabled className="font-mono text-xs" />
                            </FieldContent>
                        </Field>
                    </>


                    {selectedUtente?.ruolo === "admin" && (
                        <Field>
                            <FieldLabel htmlFor="email-utente">Email</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="email-utente"
                                    type="email"
                                    placeholder="email@esempio.it"
                                    disabled={true}
                                    value={selectedUtente?.email ?? ""}
                                />
                            </FieldContent>
                        </Field>

                    )}

                    {selectedUtente?.ruolo === "collaboratore" && (
                        <Field>
                            <FieldLabel htmlFor="username-utente">Username</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="username-utente"
                                    placeholder="username (senza @)"
                                    disabled={true}
                                    value={selectedUtente?.username ?? ""}
                                />
                            </FieldContent>
                        </Field>
                    )}

                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">
                            Chiudi
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
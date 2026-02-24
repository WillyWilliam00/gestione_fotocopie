import type { ColumnDef } from "@tanstack/react-table";
import { Field, FieldLabel } from "../ui/field";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { ArrowUpDownIcon, EditIcon, DeleteIcon, EyeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { DocentiSort, RegistrazioniCopieSort, Utente, UtentiSort } from "@shared/types";

export type Docenti = {
    id: number;
    nome: string;
    cognome: string;
    copieEffettuate: number;
    copieRimanenti: number;
    limite: number;
}
// Callbacks per azioni CRUD sul singolo docente
export type DocenteActions = {
    onView?: (docente: Docenti) => void;
    onEdit?: (docente: Docenti) => void;
    onDelete?: (docente: Docenti) => void;
}

export type UtenzeActions = {
    onView?: (utenza: Utente) => void;
    onEdit?: (utenza: Utente) => void;
    onDelete?: (utenza: Utente) => void;
}

export type Registrazioni = {
    id: number;
    docenteId: number;
    copieEffettuate: number;
    istitutoId: number;
    utenteId: string | null;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
    docenteNome: string | null;
    docenteCognome: string | null;
    utenteUsername: string | null;
    utenteEmail: string | null;
}

export type RegistrazioniActions = {
    onView?: (registrazione: Registrazioni) => void;
    onEdit?: (registrazione: Registrazioni) => void;
    onDelete?: (registrazione: Registrazioni) => void;

}

// Factory per le colonne dei docenti, così possiamo iniettare le callback dal componente feature
export const createColumnsDocenti = (
    actions: DocenteActions = {},
    sortOptions?: {
        sortField?: DocentiSort['field'];
        sortOrder?: DocentiSort['order'];
        onSortChange?: (field: DocentiSort['field'], order: DocentiSort['order']) => void;
    }
): ColumnDef<Docenti>[] => [
    {
        header: () => {
            const isActive = sortOptions?.sortField === "nome";
            const currentOrder = sortOptions?.sortOrder ?? "asc";
            const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";
            return (
                <button
                    className="flex items-center gap-2 text-md cursor-pointer"
                    onClick={() => sortOptions?.onSortChange?.("nome", nextOrder)}
                >
                    Nome 
                    <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-4" />   

                </button>
            )
        },
        accessorKey: "nome",
    },
    {
        header: () => {
            const isActive = sortOptions?.sortField === "cognome";
            const currentOrder = sortOptions?.sortOrder ?? "asc";
            const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";
            return (
                <button
                    className="flex items-center gap-2 text-md cursor-pointer"
                    onClick={() => sortOptions?.onSortChange?.("cognome", nextOrder)}
                >
                    Cognome 
                    <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-4" />   

                </button>
            )
        },
        accessorKey: "cognome",
    },
    {
        header: () => {
            const isActive = sortOptions?.sortField === "copieEffettuate";
            const currentOrder = sortOptions?.sortOrder ?? "asc";
            const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";
            return (
                <button
                    className="flex items-center gap-2 text-md cursor-pointer"
                    onClick={() => sortOptions?.onSortChange?.("copieEffettuate", nextOrder)}
                >
                    Copie Effettuate 
                    <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-4" />   

                </button>
            )
        },
        accessorKey: "copieEffettuate",
    },
    {
        header: () => {
            const isActive = sortOptions?.sortField === "copieRimanenti";
            const currentOrder = sortOptions?.sortOrder ?? "asc";
            const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";
            return (
                <button
                    className="flex items-center gap-2 text-md cursor-pointer"
                    onClick={() => sortOptions?.onSortChange?.("copieRimanenti", nextOrder)}
                >
                    Copie Rimanenti 
                    <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-4" />   

                </button>
            )
        },
        accessorKey: "copieRimanenti",
    },
    {
        header: () => {
            const isActive = sortOptions?.sortField === "limiteCopie";
            const currentOrder = sortOptions?.sortOrder ?? "asc";
            const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";
            return (
                <button
                    className="flex items-center gap-2 text-md cursor-pointer"
                    onClick={() => sortOptions?.onSortChange?.("limiteCopie", nextOrder)}
                >
                    Limite 
                    <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-4" />   

                </button>
            )
        },
        accessorKey: "limite",
    },
    {
        header: "Progresso",
        cell: ({ row }) => {
            const progresso = Math.round((row.original.copieEffettuate / row.original.limite) * 100)
            const uniqueId = `progress-${row.id}`
            
            return (
                <Field className="w-full max-w-sm">
                    <FieldLabel htmlFor={uniqueId}>
                        <span className="ml-auto">{progresso}%</span>
                    </FieldLabel>
                    <Progress value={progresso} id={uniqueId} />
                </Field>
            )
        },
    },
    {
        id: "azioni",
        header: "Azioni",
        cell: ({ row }) => {
            const docente = row.original;
            const { onView, onEdit, onDelete } = actions;

            return (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (onView) {
                                onView(docente);
                            } else {
                                console.log("Visualizza docente:", docente);
                            }
                        }}
                    >
                        <HugeiconsIcon icon={EyeIcon} strokeWidth={2} className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (onEdit) {
                                onEdit(docente);
                            } else {
                                console.log("Modifica docente:", docente);
                            }
                        }}
                    >
                        <HugeiconsIcon icon={EditIcon} strokeWidth={2} className="size-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            if (onDelete) {
                                onDelete(docente);
                            } else {
                                console.log("Elimina docente:", docente);
                            }
                        }}
                    >
                        <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} className="size-4" />
                    </Button>
                </div>
            );
        },
    }
]
function utenteIdentifier(u: Utente): string {
    return u.ruolo === "admin" ? (u as { email: string }).email : (u as { username: string }).username;
}

export const createColumnsUtenze = (
    actions: UtenzeActions = {},
    sortOptions?: {
        sortField?: UtentiSort['field'];
        sortOrder?: UtentiSort['order'];
        onSortChange?: (field: UtentiSort['field'], order: UtentiSort['order']) => void;
    }
): ColumnDef<Utente>[] => [
    {
        id: "identificativo",
        header: () => {
            const isActive = sortOptions?.sortField === "identificativo";
            const currentOrder = sortOptions?.sortOrder ?? "asc";
            const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";
            return (
                <button
                    className="flex items-center gap-2 text-md cursor-pointer"
                    onClick={() => sortOptions?.onSortChange?.("identificativo", nextOrder)}
                >
                    Identificativo
                    <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-4" />
                </button>
            );
        },
        accessorFn: (row) => utenteIdentifier(row),
        cell: ({ row }) => utenteIdentifier(row.original),
    },
    {
        header: () => {
            const isActive = sortOptions?.sortField === "ruolo";
            const currentOrder = sortOptions?.sortOrder ?? "asc";
            const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";
            return (
                <button
                    className="flex items-center gap-2 text-md cursor-pointer"
                    onClick={() => sortOptions?.onSortChange?.("ruolo", nextOrder)}
                >
                    Ruolo
                    <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-4" />
                </button>
            );
        },
        accessorKey: "ruolo",
    },
    {
        id: "azioni",
        header: "Azioni",
        cell: ({ row }) => {
            const { onView, onEdit, onDelete } = actions;
            const utente = row.original;
            return (
                <div className="flex justify-end items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView?.(utente)}
                    >
                        <HugeiconsIcon icon={EyeIcon} strokeWidth={2} className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(utente)}
                    >
                        <HugeiconsIcon icon={EditIcon} strokeWidth={2} className="size-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete?.(utente)}
                    >
                        <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} className="size-4" />
                    </Button>
                </div>
            );
        },
    },
];

// Factory per le colonne delle registrazioni copie
export const createColumnsRegistrazioni = (actions: RegistrazioniActions = {},
    sortOptions?: {
        sortField: RegistrazioniCopieSort['field'];
        sortOrder: RegistrazioniCopieSort['order'];
        onSortChange: (
            sortfield: RegistrazioniCopieSort['field'],
            sortorder: RegistrazioniCopieSort['order']
        ) => void;
    }
): ColumnDef<Registrazioni>[] => [
    {
        header: () => {
            const isActive = sortOptions?.sortField === "createdAt" && sortOptions?.sortOrder === "asc";
            const currentOrder = sortOptions?.sortOrder ?? 'desc'
            const nextOrder =
            isActive && currentOrder === "asc" ? "desc" : "asc";
            return (
                <button className="flex items-center gap-2 text-md cursor-pointer" onClick={() => sortOptions?.onSortChange("createdAt", nextOrder)}>
                    Data/Ora 
                    <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-4" />   
                </button>
            )
        },
        accessorKey: "createdAt",
        cell: ({ row }) => {
            const date = new Date(row.original.createdAt);
            return date.toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
    },
    {
        header: () => {
            const isActive = sortOptions?.sortField === "docenteNome";
            const currentOrder = sortOptions?.sortOrder ?? "asc";
            const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";
            return (
                <button className="flex items-center gap-2 text-md cursor-pointer" onClick={() => sortOptions?.onSortChange("docenteNome", nextOrder)}>
                    Nome Docente
                    <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-4" />
                </button>
            );
        },
        accessorKey: "docenteNome",
        cell: ({ row }) => {
            const nome = row.original.docenteNome || '';
            return nome || '-';
        },
    },
    {
        header: () => {
            const isActive = sortOptions?.sortField === "docenteCognome";
            const currentOrder = sortOptions?.sortOrder ?? "asc";
            const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";
            return (
                <button className="flex items-center gap-2 text-md cursor-pointer" onClick={() => sortOptions?.onSortChange("docenteCognome", nextOrder)}>
                    Cognome Docente
                    <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-4" />
                </button>
            );
        },
        accessorKey: "docenteCognome",
        cell: ({ row }) => {
            const cognome = row.original.docenteCognome || '';
            return cognome || '-';
        },
    },
    {
        header: () => {
            const isActive = sortOptions?.sortField === "copieEffettuate";
            const currentOrder = sortOptions?.sortOrder ?? "asc";
            const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";
            return (
                <button className="flex items-center gap-2 text-md cursor-pointer" onClick={() => sortOptions?.onSortChange("copieEffettuate", nextOrder)}>
                    Copie Effettuate
                    <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-4" />
                </button>
            );
        },
        accessorKey: "copieEffettuate",
    },
    {
        header: () => {
            const isActive = sortOptions?.sortField === "utente";
            const currentOrder = sortOptions?.sortOrder ?? "asc";
            const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";
            return (
                <button className="flex items-center gap-2 text-md cursor-pointer" onClick={() => sortOptions?.onSortChange("utente", nextOrder)}>
                    Utente
                    <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-4" />
                </button>
            );
        },
        accessorKey: "utenteUsername",
        cell: ({ row }) => {
            const { utenteUsername, utenteEmail } = row.original;
            if (utenteUsername) return utenteUsername;
            if (utenteEmail) return utenteEmail;
            return '-';
        },
    },
    {
        header: ({column}) => {
            return (
                <button className="flex items-center gap-2 text-md cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Note 
                    <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-4" />   
                </button>
            )
        },
        accessorKey: "note",
        cell: ({ row }) => {
            return row.original.note || '-';
        },
    },
    {
        id: "azioni",
        header: "Azioni",
        cell: ({ row }) => {
            const registrazione = row.original;
            const { onView, onEdit, onDelete } = actions;

            return (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (onView) {
                                onView(registrazione);
                            } else {
                                console.log("Visualizza registrazione:", registrazione);
                            }
                        }}
                    >
                        <HugeiconsIcon icon={EyeIcon} strokeWidth={2} className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (onEdit) {
                                onEdit(registrazione);
                            } else {
                                console.log("Modifica registrazione:", registrazione);
                            }
                        }}
                    >
                        <HugeiconsIcon icon={EditIcon} strokeWidth={2} className="size-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            if (onDelete) {
                                onDelete(registrazione);
                            } else {
                                console.log("Elimina registrazione:", registrazione);
                            }
                        }}
                    >
                        <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} className="size-4" />
                    </Button>
                </div>
            );
        },
    }
];
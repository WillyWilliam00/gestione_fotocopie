import { createColumnsUtenze } from "./table/columns";
import { DataTable } from "./table/DataTable";
import { useUtenti } from "../hooks/use-utenti";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Utente } from "../../../shared/types.js";
import type { UtentiQuery } from "../../../shared/validation.js";

export interface GestioneUtenzeContentProps {
  query: UtentiQuery;
  onPageChange: (page: number) => void;
  onView: (utente: Utente) => void;
  onEdit: (utente: Utente) => void;
  onDelete: (utente: Utente) => void;
}

/** Contenuto che sospende fino al caricamento utenti; da usare dentro <Suspense>. */
export function GestioneUtenzeContent({
  query,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: GestioneUtenzeContentProps) {
  const { data, isFetching } = useUtenti(query);
  const columns = createColumnsUtenze({ onView, onEdit, onDelete });

  return (
    <div className="w-full mt-4 relative">
      {isFetching && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded bg-muted/80 px-2 py-1 text-xs text-muted-foreground">
          <HugeiconsIcon icon={RefreshIcon} className="size-3 animate-spin" />
          Aggiornamento...
        </div>
      )}
      <DataTable<Utente, unknown>
        columns={columns}
        data={data.data}
        tableType="utenze"
        pagination={data.pagination}
        onPageChange={onPageChange}
      />
    </div>
  );
}

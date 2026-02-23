import { createColumnsUtenze } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { useUtenti } from "@/hooks/use-utenti";
import type { Utente } from "@shared/types";
import type { UtentiQuery } from "@shared/validation";


export interface GestioneUtenzeContentProps {
  query: UtentiQuery;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: string) => void;
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
  onPageSizeChange,
}: GestioneUtenzeContentProps) {
  const { data } = useUtenti(query);
  const columns = createColumnsUtenze({ onView, onEdit, onDelete });

  return (
    <div className="w-full mt-4 relative">
     
      <DataTable<Utente, unknown>
        columns={columns}
        data={data.data}
        tableType="utenze"
        pagination={data.pagination}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}

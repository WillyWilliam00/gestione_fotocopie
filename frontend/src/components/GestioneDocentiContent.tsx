import { DataTable } from "./table/DataTable";
import { createColumnsDocenti, type Docenti } from "./table/columns";
import { useDocentiSuspense } from "@/hooks/use-docenti";
import type { DocentiQuery } from "../../../shared/validation.js";

/** Contenuto che sospende fino al caricamento dei docenti; da usare dentro <Suspense>. */
export function GestioneDocentiContent({
  query,
  onView,
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange,
}: {
  query: DocentiQuery;
  onView: (docente: Docenti) => void;
  onEdit: (docente: Docenti) => void;
  onDelete: (docente: Docenti) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: string) => void;
}) {
  const { data } = useDocentiSuspense(query);
  const columns = createColumnsDocenti({ onView, onEdit, onDelete });
  const tableData: Docenti[] = data.data.map((d) => ({
    id: d.id,
    nome: d.nome,
    cognome: d.cognome,
    copieEffettuate: d.copieEffettuate,
    copieRimanenti: d.copieRimanenti,
    limite: d.limiteCopie,
  }));

  return (
    

    

      <DataTable
        columns={columns}
        data={tableData}
        pagination={data.pagination}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

  );
}

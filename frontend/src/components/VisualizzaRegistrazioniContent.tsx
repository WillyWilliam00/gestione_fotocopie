import { useState } from "react";
import { createColumnsRegistrazioni, type Registrazioni } from "./table/columns";
import { DataTable } from "./table/DataTable";
import { useRegistrazioniSuspense } from "../hooks/use-registrazioni";
import type { RegistrazioniCopieQuery } from "../../../shared/validation";

export interface VisualizzaRegistrazioniContentProps {
  onView: (registrazione: Registrazioni) => void;
  onEdit: (registrazione: Registrazioni) => void;
  onDelete: (registrazione: Registrazioni) => void;
}

const defaultQuery: RegistrazioniCopieQuery = { page: 1, pageSize: 10, sortOrder: 'desc', sortField: 'createdAt' };

/** Contenuto che sospende fino al caricamento delle registrazioni; da usare dentro <Suspense>. */
export function VisualizzaRegistrazioniContent({
  onView,
  onEdit,
  onDelete,
}: VisualizzaRegistrazioniContentProps) {
  const [registrazioniQuery, setRegistrazioniQuery] = useState<RegistrazioniCopieQuery>(defaultQuery);

  const handlePageChange = (page: number) => {
    setRegistrazioniQuery((prevQuery) => ({
      ...prevQuery,
      page,
    }));
  };
  const handlePageSizeChange = (pageSize: string) => {
    setRegistrazioniQuery((prevQuery) => ({
      ...prevQuery,
      pageSize: Number(pageSize),
      page: 1,
    }))
  }
  const { data, isFetching } = useRegistrazioniSuspense(registrazioniQuery);
  const columns = createColumnsRegistrazioni({ onView, onEdit, onDelete });
  const tableData: Registrazioni[] = data.data.map((d) => ({
    id: d.id,
    docenteId: d.docenteId,
    copieEffettuate: d.copieEffettuate,
    istitutoId: d.istitutoId,
    utenteId: d.utenteId,
    note: d.note,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    docenteNome: d.docenteNome,
    docenteCognome: d.docenteCognome,
    utenteUsername: d.utenteUsername,
    utenteEmail: d.utenteEmail,
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
        tableType="registrazioni"
        pagination={data.pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

import { FileIcon } from "@hugeicons/core-free-icons";
import HeaderSection from "./HeaderSection";
import { GestioneDocentiContent } from "./GestioneDocentiContent";
import { useState, Suspense, useCallback, useMemo } from "react";
import { type DocentiQuery } from "../../../shared/validation.js";
import { ImportDocentiDialog } from "./ImportDocentiDialog";
import { ServerFiltersBar } from "./ServerFiltersBar";
import { EliminaTuttiDocentiDialog } from "./EliminaTuttiDocentiDialog";
import { ResetConteggioDialog } from "./ResetConteggioDialog";
import NuovoDocenteModal from "./NuovoDocenteModal";
import EditDocenteModal from "./EditDocenteModal";
import { ViewDocenteModal } from "./ViewDocenteModal";
import { EliminaDocenteDialog } from "./EliminaDocenteDialog";
import { type Docenti } from "./table/columns";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";

type TypeForm = "add" | "edit" | "view" | "delete" | null;

const defaultQuery: DocentiQuery = { page: 1, pageSize: 10, sortOrder: "desc", sortField: "createdAt" };

export default function GestioneDocenti() {
  const [typeForm, setTypeForm] = useState<TypeForm>(null);
  const [selectedDocente, setSelectedDocente] = useState<Docenti | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [docentiQuery, setDocentiQuery] = useState<DocentiQuery>(defaultQuery);

  const handlePageChange = useCallback((page: number) => {
    setDocentiQuery((prev) => ({ ...prev, page }));
  }, []);

  const handleFilterChange = useCallback((filters: Record<string, string | undefined>) => {
    setDocentiQuery((prev) => ({
      ...prev,
      nome: filters.nome,
      cognome: filters.cognome,
      page: 1,
    }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: string) => {
    setDocentiQuery((prev) => ({
      ...prev,
      pageSize: Number(pageSize),
      page: 1,
    }));
  }, []);

  const handleCloseForm = useCallback(() => {
    setSelectedDocente(null);
    setTypeForm(null);
  }, []);

  const handleOpenForm = useCallback((type: "view" | "edit" | "delete", docente: Docenti) => {
    setSelectedDocente(docente);
    setTypeForm(type);
  }, []);

  const handleOpenAddForm = useCallback(() => {
    setTypeForm("add");
    setSelectedDocente(null);
  }, []);

  const handleImportClick = useCallback(() => setIsImportDialogOpen(true), []);

  const filterValues = useMemo(
    () => ({ nome: docentiQuery.nome, cognome: docentiQuery.cognome }),
    [docentiQuery.nome, docentiQuery.cognome]
  );

  return (
    <div>
      <div className="flex justify-end pt-5 pr-5 w-full gap-2">
        <EliminaTuttiDocentiDialog />
        <ResetConteggioDialog />
      </div>
      <HeaderSection title="Gestione Docenti" icon={FileIcon} />

      <div className="px-4">
        <div className="flex flex-row gap-2 w-full justify-between items-end">
          <ServerFiltersBar
            type="docenti"
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
          />

          <div className="flex flex-row gap-2">
            <NuovoDocenteModal
              typeForm={typeForm}
              onClose={handleCloseForm}
              onOpenAddForm={handleOpenAddForm}
            />

            <Button className="" variant="outline" onClick={handleImportClick}>
              Importa file
              <HugeiconsIcon icon={FileIcon} strokeWidth={2} className="size-4" />
            </Button>

            <Button className="" variant="default">
              Esporta in Excel
              <HugeiconsIcon icon={FileIcon} strokeWidth={2} className="size-4" />
            </Button>
          </div>
        </div>
        <Suspense fallback={<div className="w-full mt-4 p-8 text-center text-muted-foreground">Caricamento docenti…</div>}>
          <GestioneDocentiContent
            query={docentiQuery}
            onView={(docente) => handleOpenForm("view", docente)}
            onEdit={(docente) => handleOpenForm("edit", docente)}
            onDelete={(docente) => handleOpenForm("delete", docente)}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Suspense>
      </div>

      <ViewDocenteModal selectedDocente={selectedDocente} typeForm={typeForm} onClose={handleCloseForm} />
      <EditDocenteModal selectedDocente={selectedDocente} typeForm={typeForm} onClose={handleCloseForm} />
      <EliminaDocenteDialog selectedDocente={selectedDocente} typeForm={typeForm} onClose={handleCloseForm} />
      <ImportDocentiDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} />
    </div>
  );
}

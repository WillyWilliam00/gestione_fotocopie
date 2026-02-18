import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import type { Utente } from "../../../../shared/types.js";
import type { UtentiQuery } from "../../../../shared/validation.js";
import { useUtenti } from "../../hooks/use-utenti";
import { UtenzeTableRow } from "./UtenzeTableRow";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface UtenzeTableProps {
  query: UtentiQuery;
  columns: ColumnDef<Utente>[];
  onPageChange?: (page: number) => void;
}

export function UtenzeTable({ query, columns, onPageChange }: UtenzeTableProps) {
  const { data, isFetching } = useUtenti(query);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: data.data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="relative">
      {isFetching && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded bg-muted/80 px-2 py-1 text-xs text-muted-foreground">
          <HugeiconsIcon icon={RefreshIcon} className="size-3 animate-spin" />
          Aggiornamento...
        </div>
      )}
      <div className="overflow-hidden rounded-md border mt-6">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isLastHeader = header.index === headerGroup.headers.length - 1;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.column.columnDef.header === "Azioni" && "text-right",
                        !isLastHeader && "border-r",
                        "text-gray-500 font-bold"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => <UtenzeTableRow key={row.id} row={row} />)
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nessun risultato.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {data.pagination && onPageChange && (
        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
          <span>
            Pagina {data.pagination.page} di {data.pagination.totalPages} ({data.pagination.totalItems} utenti)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.pagination.hasPreviousPage}
              onClick={() => onPageChange(data.pagination.page - 1)}
            >
              Precedente
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data.pagination.hasNextPage}
              onClick={() => onPageChange(data.pagination.page + 1)}
            >
              Successiva
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

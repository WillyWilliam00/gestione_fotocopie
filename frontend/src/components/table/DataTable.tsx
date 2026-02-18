import {
    type ColumnDef,
    flexRender,
    type ColumnFiltersState,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel,
    type SortingState,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { File, Plus, SearchIcon, FileIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Button } from "../ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "../ui/pagination";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    tableType?: 'docenti' | 'utenze';
    onAddClick?: () => void;
    onImportClick?: () => void;
    showAddButton?: boolean;
    showImportButton?: boolean;
    onPageChange?: (page: number) => void;
    pagination?: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export function DataTable<TData, TValue>({
    columns,
    data,
    tableType = 'docenti',
    onAddClick,
    onImportClick,
    showAddButton = false,
    showImportButton = false,
    onPageChange,
    pagination,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        getCoreRowModel: getCoreRowModel(),
    })
    return (
        <div className="p-4 ">
          
                <div className="flex flex-row gap-2 items-end justify-between">
                {tableType === "docenti" && (
                    <FieldGroup className="flex flex-row gap-2 max-w-xl">
                        <Field className="flex-1">
                            <FieldLabel htmlFor="nome-input">Cerca docente per nome...</FieldLabel>
                            <InputGroup>
                                <InputGroupInput id="nome-input" value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""} onChange={(event) =>
                                    table.getColumn("nome")?.setFilterValue(event.target.value)
                                } placeholder="Marco..." />
                                <InputGroupAddon align="inline-start">
                                    <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-4" />
                                </InputGroupAddon>
                            </InputGroup>
                        </Field>
                        <Field className="flex-1">
                            <FieldLabel htmlFor="cognome-input">Cerca docente per cognome...</FieldLabel>
                            <InputGroup>
                                <InputGroupInput id="cognome-input" value={(table.getColumn("cognome")?.getFilterValue() as string) ?? ""} onChange={(event) =>
                                    table.getColumn("cognome")?.setFilterValue(event.target.value)
                                } placeholder="Rossi..." />
                                <InputGroupAddon align="inline-start">
                                    <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-4" />
                                </InputGroupAddon>
                            </InputGroup>
                        </Field>
                    </FieldGroup>
                )}
                <div className={cn("flex flex-row gap-2", tableType === "utenze" && "ml-auto")}>
                    {showAddButton && onAddClick && tableType === 'docenti' && (
                        <Button className="mt-4" variant="default" onClick={onAddClick}>
                            Aggiungi docente
                            <HugeiconsIcon icon={Plus} strokeWidth={2} className="size-4" />
                        </Button>
                    )}
                    {showImportButton && onImportClick && tableType === 'docenti' && (
                        <Button className="mt-4" variant="outline" onClick={onImportClick}>
                            Importa file
                            <HugeiconsIcon icon={FileIcon} strokeWidth={2} className="size-4" />
                        </Button>
                    )}
                    <Button className="mt-4" variant={tableType === 'docenti' ? 'default' : 'outline'}>
                        Esporta in Excel
                        <HugeiconsIcon icon={File} strokeWidth={2} className="size-4" />
                    </Button>
                    {tableType === 'utenze' && onAddClick && showAddButton && (
                        <Button className="mt-4" variant="default" onClick={onAddClick}>
                            Aggiungi utenza
                            <HugeiconsIcon icon={Plus} strokeWidth={2} className="size-4" />
                        </Button>
                    )}
                </div>
                </div>


       
            <div className="overflow-hidden rounded-md border mt-6">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="">
                                {headerGroup.headers.map((header) => {
                                    const isLastHeader = header.index === headerGroup.headers.length - 1;
                                    return (
                                        <TableHead key={header.id} className={cn(header.column.columnDef.header === "Azioni" && "text-right", !isLastHeader && "border-r", "text-gray-500 font-bold")}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className=""
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell, index) => {
                                        const isLastCell = index === row.getVisibleCells().length - 1;
                                        return (
                                            <TableCell 
                                                key={cell.id} 
                                                className={cn(
                                                    "text-primary",
                                                    !isLastCell && "border-r"
                                                )}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 ">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {pagination && onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-sm text-muted-foreground">
          <span className="w-full">
            Pagina {pagination.page} di {pagination.totalPages} ({pagination.totalItems} {tableType === "docenti" ? "docenti" : "utenze"})
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => pagination.hasPreviousPage && onPageChange(pagination.page - 1)}
                  aria-disabled={!pagination.hasPreviousPage}
                  className={cn(!pagination.hasPreviousPage && "pointer-events-none opacity-50")}
                  text="Precedente"
                />
              </PaginationItem>
              {(() => {
                const { page, totalPages } = pagination;
                const pages: (number | "ellipsis")[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (page > 3) pages.push("ellipsis");
                  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                    if (!pages.includes(i)) pages.push(i);
                  }
                  if (page < totalPages - 2) pages.push("ellipsis");
                  if (totalPages > 1) pages.push(totalPages);
                }
                return pages.map((p, i) =>
                  p === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === page}
                        onClick={() => onPageChange(p)}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                );
              })()}
              <PaginationItem>
                <PaginationNext
                  onClick={() => pagination.hasNextPage && onPageChange(pagination.page + 1)}
                  aria-disabled={!pagination.hasNextPage}
                  className={cn(!pagination.hasNextPage && "pointer-events-none opacity-50")}
                  text="Successiva"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
        </div>
    )
}
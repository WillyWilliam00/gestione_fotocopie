import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { useState } from "react";
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
import { FieldLabel } from "../ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Field } from "../ui/field";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableType?: 'docenti' | 'utenze' | 'registrazioni';
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: string) => void;
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
  onPageChange,
  onPageSizeChange,
  pagination,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>

      <div className="rounded-md border mt-4   max-h-[calc(100vh-25rem)] lg:max-h-[calc(100vh-22rem)] xl:max-h-[calc(100vh-25rem)] w-full max-w-full min-w-0 overflow-x-auto overflow-y-auto">
        <Table noWrapper className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {headerGroup.headers.map((header) => {
                  const isLastHeader = header.index === headerGroup.headers.length - 1;
                  return (
                    <TableHead key={header.id} className={cn(header.column.columnDef.header === "Azioni" && "text-right", !isLastHeader && "border-r", "text-gray-500 bg-white after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:block after:h-px after:bg-gray-200 font-bold sticky top-0 ")}>
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
          <TableBody className="">
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
        <div className="flex flex-row items-center justify-between gap-4 mt-4  text-muted-foreground">
  
            <Field  className="flex flex-col lg:flex-row justify-start w-fit">
              <FieldLabel htmlFor="select-rows-per-page" className="text-xs whitespace-nowrap">Righe per pagina</FieldLabel>
              <Select defaultValue={pagination?.pageSize.toString() ?? "25"} onValueChange={onPageSizeChange}>
                <SelectTrigger className="w-20" id="select-rows-per-page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

 

          <div className="flex flex-col gap-1 xl:flex-row items-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => pagination.hasPreviousPage && onPageChange(pagination.page - 1)}
                    aria-disabled={!pagination.hasPreviousPage}
                    className={cn(!pagination.hasPreviousPage && "pointer-events-none opacity-50")}
                   
                  />
                </PaginationItem>
                {(() => {
                  const { page, totalPages } = pagination;
                  const pages: (number | "ellipsis")[] = [];
                  if (totalPages <= 3) {
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
                    
                  />
                </PaginationItem>
              </PaginationContent>

            </Pagination>
            <span className="whitespace-nowrap text-xs">
              Pagina {pagination.page} di {pagination.totalPages} ({pagination.totalItems} {tableType === "docenti" ? "docenti" : tableType === "utenze" ? "utenze" : "registrazioni"})
            </span>
          </div>
        </div>
      )}
    </>
  )
}
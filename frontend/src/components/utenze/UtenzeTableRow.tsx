import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { TableCell, TableRow } from "../ui/table";
import { cn } from "@/lib/utils";
import type { Utente } from "../../../../shared/types.js";

interface UtenzeTableRowProps {
  row: Row<Utente>;
}

export function UtenzeTableRow({ row }: UtenzeTableRowProps) {
  return (
    <TableRow
      key={row.id}
      data-state={row.getIsSelected() ? "selected" : undefined}
    >
      {row.getVisibleCells().map((cell, index) => {
        const isLastCell = index === row.getVisibleCells().length - 1;
        return (
          <TableCell
            key={cell.id}
            className={cn("text-primary", !isLastCell && "border-r")}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );
}

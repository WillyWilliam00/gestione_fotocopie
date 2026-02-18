import { useRef, useEffect, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import RegistraCopieItem from "./RegistraCopieItem.js";
import { useDocentiInfinite } from "@/hooks/use-docenti.js";
import type { DocenteConRegistrazioni } from "../../../../shared/types.js";

const ROW_HEIGHT_ESTIMATE = 90;
const OVERSCAN = 5;
const FETCH_NEXT_THRESHOLD = 5;

export interface RegistraCopieContentProps {
  queryNome: string;
  queryCognome: string;
}

export default function RegistraCopieContent({
  queryNome,
  queryCognome,
}: RegistraCopieContentProps) {
  const [selectedDocenteId, setSelectedDocenteId] = useState<number | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useDocentiInfinite({
    pageSize: 20,
    nome: queryNome.trim() || undefined,
    cognome: queryCognome.trim() || undefined,
    sortOrder: "desc",
    sortField: "createdAt",
  });

  const docenti: DocenteConRegistrazioni[] = data.pages.flatMap((p) => p.data);

  const virtualizer = useVirtualizer({
    count: docenti.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: OVERSCAN,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    if (docenti.length === 0) return;
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;
    if (lastItem.index >= docenti.length - FETCH_NEXT_THRESHOLD && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [virtualItems, docenti.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col max-w-xl md:max-w-2xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] w-full mt-4">
      <div
        ref={parentRef}
        className="w-full h-[calc(100vh-430px)] md:h-[calc(100vh-270px)] overflow-auto rounded-lg border p-6"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((virtualRow) => {
            const docente = docenti[virtualRow.index];
            if (!docente) return null;
              const isSelected = selectedDocenteId === docente.id;
            return (
              <div
                key={docente.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                  padding: "4px 1rem",
                  height: `${ROW_HEIGHT_ESTIMATE}px`,
                }}
              >
                <RegistraCopieItem
                  docente={docente}
                  isSelected={isSelected}
                  setSelectedDocenteId={setSelectedDocenteId}
                  onOpenChange={(open) => setSelectedDocenteId(open ? docente.id : null)}
                />
              </div>
            );
          })}
          {docenti.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Nessun docente trovato
            </p>
          )}
        </div>
      </div>
      {isFetchingNextPage && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Caricamento...
        </p>
      )}
    </div>
  );
}

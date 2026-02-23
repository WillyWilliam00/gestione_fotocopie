import { useState, useRef, useCallback, useEffect } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const DEFAULT_FILTER_DEBOUNCE_MS = 300;

export interface ServerFiltersBarProps {
  type: "docenti" | "utenze";
  filterValues: Record<string, string | undefined>;
  onFilterChange: (filters: Record<string, string | undefined>) => void;
  filterDebounceMs?: number;
}

export function ServerFiltersBar({
  type,
  filterValues,
  onFilterChange,
  filterDebounceMs = DEFAULT_FILTER_DEBOUNCE_MS,
}: ServerFiltersBarProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [localNome, setLocalNome] = useState(filterValues.nome ?? "");
  const [localCognome, setLocalCognome] = useState(filterValues.cognome ?? "");
  const [localIdentifier, setLocalIdentifier] = useState(filterValues.identifier ?? "");
  console.log('ServerFiltersBar render');
  useEffect(() => {
    setLocalNome(filterValues.nome ?? "");
  }, [filterValues.nome]);
  useEffect(() => {
    setLocalCognome(filterValues.cognome ?? "");
  }, [filterValues.cognome]);
  useEffect(() => {
    setLocalIdentifier(filterValues.identifier ?? "");
  }, [filterValues.identifier]);

  const emitFilterChange = useCallback(
    (filters: Record<string, string | undefined>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        onFilterChange(filters);
      }, filterDebounceMs);
    },
    [onFilterChange, filterDebounceMs]
  );

  const handleDocentiNomeChange = useCallback(
    (value: string) => {
      setLocalNome(value);
      emitFilterChange({ nome: value || undefined, cognome: localCognome || undefined });
    },
    [localCognome, emitFilterChange]
  );
  const handleDocentiCognomeChange = useCallback(
    (value: string) => {
      setLocalCognome(value);
      emitFilterChange({ nome: localNome || undefined, cognome: value || undefined });
    },
    [localNome, emitFilterChange]
  );
  const handleUtenzeIdentifierChange = useCallback(
    (value: string) => {
      setLocalIdentifier(value);
      emitFilterChange({ identifier: value.trim() || undefined });
    },
    [emitFilterChange]
  );

  return (
    <div className="flex-1">
      {type === "docenti" && (
        <FieldGroup className="flex flex-row gap-2 max-w-xl">
          <Field className="flex-1">
            <FieldLabel htmlFor="nome-input">Cerca docente per nome...</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="nome-input"
                value={localNome}
                onChange={(e) => handleDocentiNomeChange(e.target.value)}
                placeholder="Marco..."
              />
              <InputGroupAddon align="inline-start">
                <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-4" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field className="flex-1">
            <FieldLabel htmlFor="cognome-input">Cerca docente per cognome...</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="cognome-input"
                value={localCognome}
                onChange={(e) => handleDocentiCognomeChange(e.target.value)}
                placeholder="Rossi..."
              />
              <InputGroupAddon align="inline-start">
                <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-4" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>
      )}
      {type === "utenze" && (
        <Field className="flex-1 min-w-[200px] max-w-xl">
          <FieldLabel htmlFor="search-utenti">Cerca per email o username</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="search-utenti"
              value={localIdentifier}
              onChange={(e) => handleUtenzeIdentifierChange(e.target.value)}
              placeholder="email@esempio.it o username..."
            />
            <InputGroupAddon align="inline-start">
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-4" />
            </InputGroupAddon>
          </InputGroup>
        </Field>
      )}
    </div>
  );
}

import { useState, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, CameraIcon, SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import HeaderSection from "../HeaderSection";
import ErrorBoundary from "../ErrorBoundary";
import RegistraCopieContent from "./RegistraCopieContent";
import RegistraCopieSkeleton from "./RegistraCopieSkeleton";
import RegistraCopieErrorFallback from "./RegistraCopieErrorFallback";
import { useDebouncedValue } from "@/hooks/use-debounced-value.js";
import { Button } from "../ui/button.js";

const SEARCH_DEBOUNCE_MS = 300;

export default function RegistraCopie() {
  const [searchNome, setSearchNome] = useState("");
  const [searchCognome, setSearchCognome] = useState("");

  const queryNome = useDebouncedValue(searchNome, SEARCH_DEBOUNCE_MS);
  const queryCognome = useDebouncedValue(searchCognome, SEARCH_DEBOUNCE_MS);

  const queryClient = useQueryClient();
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);
  const handleRetry = () => {
    // Rimuove tutte le query "docenti" dalla cache per forzare un nuovo fetch
    queryClient.removeQueries({ queryKey: ["docenti"] });
    // Resetta l'ErrorBoundary cambiando la key (causa remount completo)
    setErrorBoundaryKey((k) => k + 1);
  };

  const handleReset = () => {
    setSearchNome("");
    setSearchCognome("");
  };

  return (
    <div>
      <HeaderSection title="Registra Fotocopie" icon={CameraIcon} />
      <div className="flex flex-col gap-2 items-center justify-center mt-9">
        <div className="flex flex-col max-w-xl w-full gap-2 px-4 sm:flex-row sm:gap-4">
          <InputGroup className="h-full">
            <InputGroupInput
              placeholder="Cerca per nome..."
              value={searchNome}
              className="md:text-base text-sm "
              onChange={(e) => setSearchNome(e.target.value)}
            />
            <InputGroupAddon>
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
            </InputGroupAddon>
          </InputGroup>
          <InputGroup className="h-full">
            <InputGroupInput
              placeholder="Cerca per cognome..."
              value={searchCognome}
              className="md:text-base text-sm"
              onChange={(e) => setSearchCognome(e.target.value)}
            />
            <InputGroupAddon>
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
            </InputGroupAddon>
          </InputGroup>
          <Button className=" text-base"  variant="outline" onClick={handleReset} disabled={searchNome === "" && searchCognome === ""}>
            <HugeiconsIcon icon={ArrowLeftIcon} strokeWidth={2} />
            Resetta 
          </Button>
        </div>

        <ErrorBoundary
          key={errorBoundaryKey}
          fallback={
            <RegistraCopieErrorFallback onRetry={handleRetry} />
          }
        >
          <Suspense fallback={<RegistraCopieSkeleton />}>
            <RegistraCopieContent
              queryNome={queryNome}
              queryCognome={queryCognome}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

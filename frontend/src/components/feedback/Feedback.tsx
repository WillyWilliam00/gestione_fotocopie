import HeaderSection from "@/components/layout/HeaderSection";
import { Textarea } from "@/components/ui/textarea";
import { FileIcon } from "@hugeicons/core-free-icons";

export default function Feedback() {
  return (
    <div>
      <HeaderSection title="Feedback" icon={FileIcon} />

      <div className="w-full mt-10 p-4">
        <p className="text-muted-foreground mb-4">
          Lasciaci il tuo feedback per migliorare l&apos;applicazione.
        </p>
        <Textarea
          placeholder="Scrivi qui il tuo feedback…"
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
}

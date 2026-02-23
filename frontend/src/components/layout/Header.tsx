import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function Header() {
    const { open, isMobile } = useSidebar()
    return (
        <header className={cn(
            "fixed top-0 w-full h-14 bg-white flex items-center justify-start gap-2 px-4 shadow-md transition-all duration-200 ease-linear z-50",
            // Su mobile la sidebar è un drawer overlay, non sposta il layout: header sempre a sinistra
            isMobile ? "left-0" : (open ? "left-64" : "left-0")
        )}>
                <SidebarTrigger className="" />
                <h1 className="text-xl font-semibold text-primary ">ScriptaScuola</h1>
                <HugeiconsIcon icon={UserIcon} strokeWidth={2}  className="text-primary"  />
            </header>
    )
}
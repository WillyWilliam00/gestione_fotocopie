import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
interface HeaderSectionProps {
    title: string;
    icon: IconSvgElement;
}

export default function HeaderSection({ title, icon, }: HeaderSectionProps) {
    return (
        <div className="flex  gap-4 items-center justify-center mt-5">
            <h2 className="text-2xl font-semibold text-primary">{title}</h2>
            <HugeiconsIcon icon={icon} strokeWidth={2} className="text-primary" />
        </div>
    )
}
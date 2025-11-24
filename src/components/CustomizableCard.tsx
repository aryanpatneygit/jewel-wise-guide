import { ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface CustomizableCardProps {
  id: string;
  children: ReactNode;
  isCustomizeMode: boolean;
  className?: string;
}

export const CustomizableCard = ({ id, children, isCustomizeMode, className }: CustomizableCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isCustomizeMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative", className)}
    >
      {isCustomizeMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-2 top-2 z-10 cursor-grab active:cursor-grabbing rounded bg-primary/10 p-1.5 hover:bg-primary/20 transition-colors"
        >
          <GripVertical className="h-4 w-4 text-primary" />
        </div>
      )}
      {children}
    </div>
  );
};


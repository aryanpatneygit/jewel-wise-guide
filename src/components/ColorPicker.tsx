import { useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker = ({ color, onChange, label }: ColorPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Palette className="h-4 w-4" />
          {label || "Color"}
          <div
            className="h-4 w-4 rounded border border-border"
            style={{ backgroundColor: color }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(false);
            }}
            className="h-10 w-full cursor-pointer rounded border border-border"
          />
          <div className="grid grid-cols-8 gap-2">
            {[
              "#3b82f6", // blue
              "#10b981", // green
              "#f59e0b", // amber
              "#ef4444", // red
              "#8b5cf6", // purple
              "#ec4899", // pink
              "#06b6d4", // cyan
              "#f97316", // orange
            ].map((presetColor) => (
              <button
                key={presetColor}
                className="h-8 w-8 rounded border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  onChange(presetColor);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};


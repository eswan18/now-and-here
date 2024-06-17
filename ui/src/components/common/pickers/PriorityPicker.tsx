import { useState } from "react";
import { Check } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { cn } from "@/lib/utils";
import { Priority } from "@/types/task";

export interface PriorityPickerProps {
  defaultPriority?: Priority;
  onChange: (priority: Priority) => void;
}

export default function PriorityPicker({
  defaultPriority,
  onChange,
}: PriorityPickerProps) {
  const [priority, setPriority] = useState<Priority>(defaultPriority || 0);
  const priorities: Priority[] = [0, 1, 2, 3];

  return (
    <Command className="font-normal">
      <CommandList>
        <CommandEmpty>No priority found.</CommandEmpty>
        <CommandGroup>
          {priorities.map((p) => (
            <CommandItem
              key={p}
              value={String(p)}
              onSelect={(currentValue) => {
                const valueAsPriority = parseInt(currentValue, 10) as Priority;
                setPriority(valueAsPriority);
                onChange(valueAsPriority);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  p === priority ? "opacity-100" : "opacity-0",
                )}
              />
              {p}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

import { useState } from "react";
import { Check } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { PopoverContent } from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { Priority } from "@/types/task";

export interface PriorityPickerProps {
  defaultPriority?: Priority;
  onChange: (priority: Priority) => void;
}

export default function PriorityPickerPopover({
  defaultPriority,
  onChange,
}: PriorityPickerProps) {
  const [priority, setPriority] = useState<Priority>(defaultPriority || 0);
  const priorities: Priority[] = [0, 1, 2, 3];

  return (
    <PopoverContent className="w-28 p-0">
      <Command>
        <CommandList>
          <CommandEmpty>No priority found.</CommandEmpty>
          <CommandGroup>
            {priorities.map((p) => (
              <CommandItem
                key={p}
                value={String(p)}
                onSelect={(currentValue) => {
                  const valueAsPriority = parseInt(
                    currentValue,
                    10,
                  ) as Priority;
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
    </PopoverContent>
  );
}

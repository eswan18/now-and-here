import { Matcher } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DuePickerPopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function DuePickerPopover({
  open,
  onOpenChange,
  children,
}: DuePickerPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {children}
    </Popover>
  );
}

export interface DuePickerPopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function DuePickerPopoverTrigger({
  asChild,
  children,
}: DuePickerPopoverTriggerProps) {
  return <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>;
}

export interface DuePickerPopoverContentProps {
  className?: string;
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: Matcher | Matcher[];
}

export function DuePickerPopoverContent({
  selected,
  onSelect,
  className,
  disabled,
}: DuePickerPopoverContentProps) {
  const handleDaySelect = (day: Date | undefined) => {
    onSelect(day);
  };
  const classes = cn("flex flex-col justify-start items-center", className);
  return (
    <PopoverContent className={classes}>
      <Calendar
        className="p-0"
        mode="single"
        selected={selected}
        onSelect={handleDaySelect}
        disabled={disabled}
        initialFocus
      />
      <Input
        type="time"
        className="mt-2 w-36 text-center"
        disabled={!selected}
        // take locale date time string in format that the input expects (24hr time)
        value={
          selected?.toLocaleTimeString([], {
            hourCycle: "h23",
            hour: "2-digit",
            minute: "2-digit",
          }) || ""
        }
        // take hours and minutes and update our Date object then change date object to our new value
        onChange={(selectedTime) => {
          if (!selected) {
            return;
          }
          const currentTime = selected;
          currentTime?.setHours(
            parseInt(selectedTime.target.value.split(":")[0]),
            parseInt(selectedTime.target.value.split(":")[1]),
            0,
          );
          onSelect(currentTime);
        }}
      />
    </PopoverContent>
  );
}

import { Matcher } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export interface DuePickerProps {
  className?: string;
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: Matcher | Matcher[];
  onCompleted: () => void;
}

export default function DuePicker({
  selected,
  onSelect,
  className,
  disabled,
  onCompleted,
}: DuePickerProps) {
  const handleDaySelect = (day: Date | undefined) => {
    onSelect(day);
  };
  const handleClearDueDate = () => {
    onSelect(undefined);
    onCompleted();
  };

  const classes = cn(
    "flex flex-col justify-start items-center gap-3",
    className,
  );
  return (
    <div className={classes}>
      <Calendar
        className="p-0"
        mode="single"
        selected={selected}
        onSelect={handleDaySelect}
        disabled={disabled}
        initialFocus
      />
      <div className="flex flex-row justify-center items-center gap-4 w-full">
        <Input
          type="time"
          className="w-36 text-center"
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
        <Button onClick={onCompleted}>Done</Button>
      </div>
      <Button variant="ghost" onClick={handleClearDueDate}>
        Clear due date
      </Button>
    </div>
  );
}

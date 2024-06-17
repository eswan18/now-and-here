import { Matcher } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ChangeEvent } from "react";

export interface DuePickerProps {
  className?: string;
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: Matcher | Matcher[];
  onCompleted: () => void;
}

// The time that's set when a new date is selected.
const defaultTime = {
  hours: 12,
  minutes: 0,
};

export default function DuePicker({
  selected,
  onSelect,
  className,
  disabled,
  onCompleted,
}: DuePickerProps) {
  const handleDaySelect = (day: Date | undefined) => {
    let hour = 12;
    let minute = 0;
    if (day && selected) {
      // If there was already a selected date/time, use the time from the selected date.
      hour = selected?.getHours() || defaultTime.hours;
      minute = selected?.getMinutes() || defaultTime.minutes;
    }
    day?.setHours(hour, minute, 0, 0);
    onSelect(day);
  };
  const handleClearDueDate = () => {
    onSelect(undefined);
    onCompleted();
  };
  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!selected) {
      return;
    }
    const currentTime = selected;
    currentTime?.setHours(
      parseInt(e.target.value.split(":")[0]),
      parseInt(e.target.value.split(":")[1]),
      0,
    );
    onSelect(currentTime);
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
          onChange={handleTimeChange}
        />
        <Button disabled={!selected} onClick={onCompleted}>
          Done
        </Button>
      </div>
      <Button variant="ghost" onClick={handleClearDueDate}>
        Clear due date
      </Button>
    </div>
  );
}

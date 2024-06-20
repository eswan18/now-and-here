import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import { WeeklyInterval, Weekday } from "@/types/repeatInterval";

import { defaultWeeklyValue } from "./defaultValues";

type WeeklyIntervalPickerProps = {
  value?: WeeklyInterval;
  onChange: (value: WeeklyInterval) => void;
};

export default function WeeklyIntervalPicker({
  value,
  onChange,
}: WeeklyIntervalPickerProps) {
  const weekdaySymbols = ["M", "T", "W", "T", "F", "S", "S"];
  // A default value to fall back to; used when the Weekly tab is first selected.
  const currentVal = value || defaultWeeklyValue;
  const handleCheckChange = (
    checked: boolean | "indeterminate",
    weekday: Weekday,
  ) => {
    if (checked === "indeterminate") {
      return;
    }
    if (checked) {
      onChange({ ...currentVal, weekdays: [...currentVal.weekdays, weekday] });
    } else {
      onChange({
        ...currentVal,
        weekdays: currentVal.weekdays.filter((wkd) => wkd !== weekday),
      });
    }
  };
  const handleWeeksChange = (weeks: number) => {
    if (weeks < 1) {
      return;
    }
    onChange({ ...currentVal, weeks });
  };
  return (
    <div className="flex flex-col items-center gap-4 my-5">
      <div className="flex flex-row items-center gap-2">
        <p>Every</p>
        <Input
          type="number"
          className="w-14 px-2 h-8"
          value={currentVal.weeks}
          onChange={(e) => handleWeeksChange(parseInt(e.target.value))}
        />
        <p>Weeks</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="grid grid-cols-7 divide-x w-fit">
          {weekdaySymbols.map((day) => (
            <div className="w-6 h-6 text-center text-gray-400 text-xs border-transparent">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 w-fit">
          {weekdaySymbols.map((_, idx) => (
            <Checkbox
              key={idx}
              checked={currentVal.weekdays.includes(idx as Weekday)}
              className="rounded-none border-r-0 w-6 h-6 first:rounded-l-sm last:rounded-r-sm last-of-type:border-r border-gray-400"
              onCheckedChange={(checked) =>
                handleCheckChange(checked, idx as Weekday)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

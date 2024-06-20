import { Input } from "@/components/ui/input";

import { MonthlyInterval } from "@/types/repeatInterval";

import { defaultMonthlyValue } from "./defaultValues";

type MonthlyIntervalPickerProps = {
  value?: MonthlyInterval;
  onChange: (value: MonthlyInterval) => void;
};

export default function MonthlyIntervalPicker({
  value,
  onChange,
}: MonthlyIntervalPickerProps) {
  // A default value to fall back to; used when the Monthly tab is first selected.
  const currentVal = value || defaultMonthlyValue;
  const handleMonthsChange = (months: number) => {
    if (months < 1) {
      return;
    }
    onChange({ ...currentVal, months });
  };
  const handleDayChange = (day: number) => {
    if (day < 1 || day > 31) {
      return;
    }
    onChange({ ...currentVal, day });
  };
  return (
    <div className="flex flex-col items-center gap-4 my-5">
      <div className="flex flex-row items-center gap-2">
        <p>Every</p>
        <Input
          type="number"
          className="w-14 px-2 h-8"
          value={currentVal.months}
          onChange={(e) => handleMonthsChange(parseInt(e.target.value))}
        />
        <p>months</p>
      </div>
      <div className="flex flex-row items-center gap-2">
        <p>on day</p>
        <Input
          type="number"
          className="w-14 px-2 h-8"
          value={currentVal.day}
          onChange={(e) => handleDayChange(parseInt(e.target.value))}
        />
      </div>
    </div>
  );
}

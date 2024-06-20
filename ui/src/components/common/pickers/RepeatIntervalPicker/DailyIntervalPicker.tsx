import { Input } from "@/components/ui/input";

import { DailyInterval } from "@/types/repeatInterval";

import { defaultDailyValue } from "./defaultValues";

type DailyIntervalPickerProps = {
  value?: DailyInterval;
  onChange: (value: DailyInterval) => void;
};

export default function DailyIntervalPicker({
  value,
  onChange,
}: DailyIntervalPickerProps) {
  // A default value to fall back to; used when the Daily tab is first selected.
  const currentVal = value || defaultDailyValue;
  const handleDaysChange = (days: number) => {
    if (days < 1) {
      return;
    }
    onChange({ ...currentVal, days });
  };
  return (
    <div className="flex flex-col items-center gap-4 my-5">
      <div className="flex flex-row items-center gap-2">
        <p>Every</p>
        <Input
          type="number"
          className="w-14 px-2 h-8"
          value={currentVal.days}
          onChange={(e) => handleDaysChange(parseInt(e.target.value))}
        />
        <p>days</p>
      </div>
    </div>
  );
}

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

import {
  RepeatInterval,
  WeeklyInterval,
  Weekday,
} from "@/types/repeatInterval";
import { repeatAsString } from "@/lib/repeat";
import { Button } from "@/components/ui/button";

export interface RepeatIntervalPickerProps {
  value?: RepeatInterval;
  onChange: (repeat: RepeatInterval | null) => void;
}

export default function RepeatIntervalPicker({
  value,
  onChange,
}: RepeatIntervalPickerProps) {
  const [currentVal, setCurrentVal] = useState(value);

  return (
    <div className="flex flex-col items-center">
      <Tabs defaultValue={currentVal?.kind}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          Daily: {value ? repeatAsString(value) : "no value"}
        </TabsContent>
        <TabsContent value="weekly">
          <WeeklyTabContent
            value={currentVal as WeeklyInterval}
            onChange={setCurrentVal}
          />
        </TabsContent>
        <TabsContent value="monthly">
          Monthly: {value ? repeatAsString(value) : "no value"}
        </TabsContent>
      </Tabs>
      <Button
        className="mt-2"
        disabled={!currentVal}
        onClick={() => onChange(currentVal as RepeatInterval)}
      >
        Done
      </Button>
      <Button className="mt-2" variant="outline" onClick={() => onChange(null)}>
        Clear
      </Button>
    </div>
  );
}

type WeeklyTabContentProps = {
  value?: WeeklyInterval;
  onChange: (value: WeeklyInterval) => void;
};

function WeeklyTabContent({ value, onChange }: WeeklyTabContentProps) {
  const weekdaySymbols = ["M", "T", "W", "T", "F", "S", "S"];
  // A default value to fall back to; used when the Weekly tab is first selected.
  const currentVal = value || {
    kind: "weekly",
    weeks: 1,
    weekdays: [],
    at: "09:00:00",
  };
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
  return (
    <div>
      Weekdays:
      <div className="grid grid-cols-7 divide-x w-fit">
        {weekdaySymbols.map((day) => (
          <div className="w-5 h-5 text-center text-gray-400 text-xs border-transparent">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 w-fit">
        {weekdaySymbols.map((_, idx) => (
          <Checkbox
            key={idx}
            checked={currentVal.weekdays.includes(idx as Weekday)}
            className="rounded-none border-r-0 w-5 h-5 first:rounded-l-sm last:rounded-r-sm last-of-type:border-r"
            onCheckedChange={(checked) =>
              handleCheckChange(checked, idx as Weekday)
            }
          />
        ))}
      </div>
    </div>
  );
}

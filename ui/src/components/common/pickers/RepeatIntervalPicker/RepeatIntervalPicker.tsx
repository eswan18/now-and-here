import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { RepeatInterval } from "@/types/repeatInterval";

import MonthlyIntervalPicker from "./MonthlyIntervalPicker";
import WeeklyIntervalPicker from "./WeeklyIntervalPicker";
import DailyIntervalPicker from "./DailyIntervalPicker";
import {
  defaultDailyValue,
  defaultWeeklyValue,
  defaultMonthlyValue,
} from "./defaultValues";

export interface RepeatIntervalPickerProps {
  value?: RepeatInterval;
  onChange: (repeat: RepeatInterval | null) => void;
}

export default function RepeatIntervalPicker({
  value,
  onChange,
}: RepeatIntervalPickerProps) {
  const [currentVal, setCurrentVal] = useState(value);
  const handleTabValueChange = (v: string) => {
    // This handles changing the value in state every time the tab is switched; without
    // it, navigating to a new tab leaves the currenvVal intact until the user modifies
    // the values in the tab (but they might not, if they like the defaults).
    if (v === "daily") {
      setCurrentVal(defaultDailyValue);
    } else if (v === "weekly") {
      setCurrentVal(defaultWeeklyValue);
    } else if (v === "monthly") {
      setCurrentVal(defaultMonthlyValue);
    }
  };

  const disabled =
    !currentVal || (currentVal.kind === "weekly" && isNaN(currentVal.weeks));

  return (
    <div className="flex flex-col items-center">
      <Tabs
        defaultValue={currentVal?.kind}
        onValueChange={handleTabValueChange}
      >
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <DailyIntervalPicker
            value={currentVal?.kind === "daily" ? currentVal : undefined}
            onChange={setCurrentVal}
          />
        </TabsContent>
        <TabsContent value="weekly">
          <WeeklyIntervalPicker
            value={currentVal?.kind === "weekly" ? currentVal : undefined}
            onChange={setCurrentVal}
          />
        </TabsContent>
        <TabsContent value="monthly">
          <MonthlyIntervalPicker
            value={currentVal?.kind === "monthly" ? currentVal : undefined}
            onChange={setCurrentVal}
          />
        </TabsContent>
      </Tabs>
      <div className="flex flex-row justify-center gap-2">
        <Button
          className="mt-2"
          size="sm"
          variant="outline"
          onClick={() => onChange(null)}
        >
          Clear
        </Button>
        <Button
          className="mt-2"
          disabled={disabled}
          onClick={() => onChange(currentVal as RepeatInterval)}
          size="sm"
        >
          Done
        </Button>
      </div>
    </div>
  );
}

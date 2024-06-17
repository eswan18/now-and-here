import { RepeatInterval } from "@/types/repeatInterval";

export function repeatAsString(repeat: RepeatInterval): string {
  switch (repeat.kind) {
    case "DailyInterval":
      return `Every ${repeat.days} days at ${repeat.at}`;
    case "WeeklyInterval": {
      const weekdaysFormatted = repeat.weekdays.map(
        (day) => day[0].toUpperCase() + day.slice(1).toLowerCase(),
      );
      if (weekdaysFormatted.length === 1) {
        if (repeat.weeks === 1) {
          return `Every ${weekdaysFormatted[0]}`;
        } else if (repeat.weeks === 2) {
          return `Every other ${weekdaysFormatted[0]}`;
        }
      }
      return `Every ${repeat.weeks} weeks on ${weekdaysFormatted.join(", ")}`;
    }
    case "MonthlyInterval": {
      return `Every ${repeat.months} months on day ${repeat.day}`;
    }
  }
  throw new Error(
    `Unexpected repeat interval kind: ${(repeat as RepeatInterval).kind}`,
  );
}

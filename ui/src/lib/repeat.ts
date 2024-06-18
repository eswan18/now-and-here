import { RepeatInterval, Weekday } from "@/types/repeatInterval";

function integerToOrdinal(n: number): string {
  if (n === 1) {
    return "1st";
  } else if (n === 2) {
    return "2nd";
  } else if (n === 3) {
    return "3rd";
  }
  return `${n}th`;
}

export function repeatAsString(repeat: RepeatInterval): string {
  switch (repeat.kind) {
    case "daily":
      return `Every ${repeat.days} days at ${repeat.at}`;
    case "weekly": {
      const weekdaysFormatted = repeat.weekdays.map(weekdayName);
      if (weekdaysFormatted.length === 1) {
        if (repeat.weeks === 1) {
          return `Every ${weekdaysFormatted[0]}`;
        } else if (repeat.weeks === 2) {
          return `Every other ${weekdaysFormatted[0]}`;
        }
      }
      return `Every ${repeat.weeks} weeks on ${weekdaysFormatted.join(", ")}`;
    }
    case "monthly": {
      const monthCadenceString =
        repeat.months === 1 ? "Every month" : `Every ${repeat.months} months`;
      return `${monthCadenceString} on the ${integerToOrdinal(repeat.day)} at ${repeat.at}`;
    }
  }
  throw new Error(
    `Unexpected repeat interval kind: ${(repeat as RepeatInterval).kind}`,
  );
}

export function weekdayName(weekday: Weekday): string {
  switch (weekday) {
    case 0:
      return "Monday";
    case 1:
      return "Tuesday";
    case 2:
      return "Wednesday";
    case 3:
      return "Thursday";
    case 4:
      return "Friday";
    case 5:
      return "Saturday";
    case 6:
      return "Sunday";
  }
}

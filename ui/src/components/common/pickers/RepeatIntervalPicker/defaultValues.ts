import {
  DailyInterval,
  WeeklyInterval,
  MonthlyInterval,
} from "@/types/repeatInterval";

export const defaultMonthlyValue: MonthlyInterval = {
  kind: "monthly",
  months: 1,
  day: 1,
  at: "09:00:00",
};

export const defaultWeeklyValue: WeeklyInterval = {
  kind: "weekly",
  weeks: 1,
  weekdays: [],
  at: "09:00:00",
};

export const defaultDailyValue: DailyInterval = {
  kind: "daily",
  days: 1,
  at: "09:00:00",
};

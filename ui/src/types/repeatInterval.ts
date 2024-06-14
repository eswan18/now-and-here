export type RepeatInterval = DailyInterval | WeeklyInterval | MonthlyInterval;

export type DailyInterval = {
  kind: "DailyInterval";
  days: number;
  at: string;
};

export type WeeklyInterval = {
  kind: "WeeklyInterval";
  weeks: number;
  weekdays: string[];
  at: string;
};

export type MonthlyInterval = {
  kind: "MonthlyInterval";
  months: number;
  day: number;
  at: string;
};

export type RepeatInterval = DailyInterval | WeeklyInterval | MonthlyInterval;

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DailyInterval = {
  kind: "daily";
  days: number;
  at: string;
};

export type WeeklyInterval = {
  kind: "weekly";
  weeks: number;
  weekdays: Weekday[];
  at: string;
};

export type MonthlyInterval = {
  kind: "monthly";
  months: number;
  day: number;
  at: string;
};

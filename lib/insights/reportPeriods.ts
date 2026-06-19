import type { AIInsightPeriodType } from "@/types/aiInsightReport";

export type ReportPeriod = {
  type: AIInsightPeriodType;
  start: Date;
  end: Date;
  label: string;
};

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
});

const monthDayYearFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
});

export function getCurrentReportPeriod(
  type: AIInsightPeriodType,
  now = new Date(),
): ReportPeriod {
  return type === "weekly"
    ? getCurrentWeeklyPeriod(now)
    : getCurrentMonthlyPeriod(now);
}

export function isAIInsightPeriodType(
  value: unknown,
): value is AIInsightPeriodType {
  return value === "weekly" || value === "monthly";
}

export function getReportCacheKey(period: ReportPeriod) {
  return `${period.type}:${period.start.toISOString()}:${period.end.toISOString()}`;
}

function getCurrentWeeklyPeriod(now: Date): ReportPeriod {
  const currentDay = startOfLocalDay(now);
  const dayIndex = currentDay.getDay();
  const daysSinceMonday = dayIndex === 0 ? 6 : dayIndex - 1;
  const start = new Date(currentDay);
  start.setDate(currentDay.getDate() - daysSinceMonday);
  const end = endOfLocalDay(addDays(start, 6));

  return {
    end,
    label: getWeeklyLabel(start, end),
    start,
    type: "weekly",
  };
}

function getCurrentMonthlyPeriod(now: Date): ReportPeriod {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = endOfLocalDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  return {
    end,
    label: monthFormatter.format(start),
    start,
    type: "monthly",
  };
}

function getWeeklyLabel(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();

  if (sameMonth && sameYear) {
    return `${monthDayFormatter.format(start)}-${dayFormatter.format(end)}, ${end.getFullYear()}`;
  }

  if (!sameYear) {
    return `${monthDayYearFormatter.format(start)}-${monthDayYearFormatter.format(end)}`;
  }

  return `${monthDayFormatter.format(start)}-${monthDayFormatter.format(end)}, ${end.getFullYear()}`;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfLocalDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + days);
  return nextDate;
}

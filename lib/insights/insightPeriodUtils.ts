import type { InsightsDateRange, InsightsPeriod } from "@/types/insights";

const fullMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const shortMonthDayFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
});

const shortMonthDayYearFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function getInsightDateRange(
  period: InsightsPeriod,
  referenceDate: Date,
): InsightsDateRange {
  if (period === "week") {
    const start = getStartOfLocalWeek(referenceDate);
    const end = endOfLocalDay(addDays(start, 6));

    return {
      end,
      label: getWeekRangeLabel(start, end),
      start,
    };
  }

  if (period === "month") {
    const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const end = endOfLocalDay(
      new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0),
    );

    return {
      end,
      label: fullMonthFormatter.format(start),
      start,
    };
  }

  const start = new Date(referenceDate.getFullYear(), 0, 1);
  const end = endOfLocalDay(new Date(referenceDate.getFullYear(), 11, 31));

  return {
    end,
    label: String(referenceDate.getFullYear()),
    start,
  };
}

export function shiftInsightReferenceDate(
  period: InsightsPeriod,
  referenceDate: Date,
  direction: -1 | 1,
) {
  if (period === "week") {
    return addDays(referenceDate, direction * 7);
  }

  if (period === "month") {
    return new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + direction,
      1,
    );
  }

  return new Date(referenceDate.getFullYear() + direction, 0, 1);
}

export function isFutureInsightPeriod(
  period: InsightsPeriod,
  referenceDate: Date,
  now = new Date(),
) {
  return getInsightDateRange(period, referenceDate).start.getTime() >
    getInsightDateRange(period, now).start.getTime();
}

export function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getStartOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getStartOfLocalWeek(date: Date) {
  const currentDay = getStartOfLocalDay(date);
  const dayIndex = currentDay.getDay();
  const daysSinceMonday = dayIndex === 0 ? 6 : dayIndex - 1;

  return addDays(currentDay, -daysSinceMonday);
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

function getWeekRangeLabel(start: Date, end: Date) {
  const sameYear = start.getFullYear() === end.getFullYear();

  if (sameYear) {
    return `${shortMonthDayFormatter.format(start)} - ${shortMonthDayYearFormatter.format(end)}`;
  }

  return `${shortMonthDayYearFormatter.format(start)} - ${shortMonthDayYearFormatter.format(end)}`;
}

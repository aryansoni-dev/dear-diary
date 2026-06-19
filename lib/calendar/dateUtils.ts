export const createLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const parseLocalDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
};

export const startOfLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const isSameLocalDay = (first: Date, second: Date): boolean =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export const isSameLocalMonth = (first: Date, second: Date): boolean =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth();

export const addCalendarMonths = (date: Date, amount: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

export const formatCalendarMonth = (
  date: Date,
  locale = "en-US",
): string =>
  new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);

export const formatSelectedDate = (date: Date, locale = "en-US"): string =>
  new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  }).format(date);

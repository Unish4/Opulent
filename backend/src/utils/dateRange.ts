import { ApiError } from "./ApiError.js";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kathmandu",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kathmandu",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export const nepalDateString = (date: Date): string =>
  dayFormatter.format(date);
export const formatNepalDateTime = (date: Date): string =>
  dateTimeFormatter.format(date);

const startOf = (day: string): Date => new Date(`${day}T00:00:00.000+05:45`);
const endOf = (day: string): Date => new Date(`${day}T23:59:59.999+05:45`);

export interface DateRange {
  from: string;
  to: string;
  start: Date;
  end: Date;
}

export const resolveRange = (from?: string, to?: string): DateRange => {
  const toDay = to ?? nepalDateString(new Date());
  const fromDay =
    from ??
    nepalDateString(new Date(startOf(toDay).getTime() - 29 * 86_400_000));
  const start = startOf(fromDay);
  const end = endOf(toDay);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new ApiError(400, "Invalid date range.");
  }
  if (start > end)
    throw new ApiError(400, "The start date must not be after the end date.");
  if (end.getTime() - start.getTime() > 366 * 86_400_000) {
    throw new ApiError(400, "The date range can be at most one year.");
  }

  return { from: fromDay, to: toDay, start, end };
};

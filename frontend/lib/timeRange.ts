export const TIME_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "1m", label: "Last 1 month" },
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last 1 year" },
] as const;

export type TimeRange = (typeof TIME_RANGE_OPTIONS)[number]["value"];

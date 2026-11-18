export const MIN_BIRTHDAY_YEAR = 1900;

export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse a date without converting a UTC timestamp into the device's time zone.
export function parseBirthday(value?: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (year < MIN_BIRTHDAY_YEAR || formatDate(date) !== value) return undefined;
  return date;
}

export function getBirthdayLimits(year: number, month: number, today = new Date()) {
  const maxMonth = year === today.getFullYear() ? today.getMonth() + 1 : 12;
  const safeMonth = Math.min(Math.max(month, 1), maxMonth);
  const daysInMonth = new Date(year, safeMonth, 0).getDate();
  const maxDay = year === today.getFullYear() && safeMonth === maxMonth
    ? Math.min(daysInMonth, today.getDate())
    : daysInMonth;
  return { maxMonth, month: safeMonth, maxDay };
}

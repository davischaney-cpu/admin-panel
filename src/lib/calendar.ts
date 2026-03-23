import { formatDate } from "@/lib/format";

type CalendarItem = {
  id: string;
  title: string;
  course: string;
  dueAt: Date | null;
  htmlUrl: string | null;
  pointsPossible?: number | null;
  submissionStatus?: string | null;
  workflowState?: string | null;
  courseId?: string;
};

export function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getWeekdayLabels() {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
}

export function buildMonthGrid(referenceDate: Date) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
  const end = new Date(lastOfMonth);
  end.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()));

  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function groupAssignmentsByDay(assignments: CalendarItem[]) {
  const map = new Map<string, CalendarItem[]>();
  for (const assignment of assignments) {
    if (!assignment.dueAt) continue;
    const key = dayKey(assignment.dueAt);
    const existing = map.get(key) ?? [];
    existing.push(assignment);
    map.set(key, existing);
  }
  return map;
}

export function isSameMonth(day: Date, referenceDate: Date) {
  return day.getMonth() === referenceDate.getMonth() && day.getFullYear() === referenceDate.getFullYear();
}

export function isToday(day: Date) {
  const today = new Date();
  return day.toDateString() === today.toDateString();
}

export function dayKey(day: Date) {
  const year = day.getFullYear();
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const date = String(day.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

export function parseDayKey(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCalendarDueDate(date: Date | null) {
  if (!date) return "TBD";
  return `${formatDate(date)} · ${new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)}`;
}

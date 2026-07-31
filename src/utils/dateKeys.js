// Shared "what day/week is it" keys, used everywhere a doc needs to know if
// it's stale (daily/weekly task resets, notification reminders, check-ins)
// so "today" and "this week" always mean the same thing across the app.
export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Monday of the current week, as a date-string key.
export function weekKey() {
  const d = new Date();
  const day = d.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  return monday.toISOString().slice(0, 10);
}

import { todayKey } from "./dateKeys";

// "Write a gratitude entry" is auto-detected (like accomplishments) rather
// than manually self-toggled, since we can just check whether any of the
// user's own gratitude entries were created today.
export function hasGratitudeToday(myGratitudeEntries) {
  const today = todayKey();
  return (myGratitudeEntries || []).some((entry) => {
    const created = entry.createdAt?.toDate?.();
    return created && created.toISOString().slice(0, 10) === today;
  });
}

// Single source of truth for "are today's/this week's tasks done" so the
// profile checklist and the notification reminders never disagree.
export function areDailyTasksComplete(user, myGratitudeEntries) {
  const accomplishmentsDone = (user.dailyAccomplishments || []).every(
    (a) => a.trim() !== ""
  );
  const manualDone = ["support", "tip"].every((id) =>
    (user.dailyTasksDone || []).includes(id)
  );
  return accomplishmentsDone && manualDone && hasGratitudeToday(myGratitudeEntries);
}

export function areWeeklyTasksComplete(user) {
  return ["weekly-question", "new-category"].every((id) =>
    (user.weeklyTasksDone || []).includes(id)
  );
}

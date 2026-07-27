// Single source of truth for "are today's/this week's tasks done" so the
// profile checklist and the notification reminders never disagree.
export function areDailyTasksComplete(user) {
  const accomplishmentsDone = (user.dailyAccomplishments || []).every(
    (a) => a.trim() !== ""
  );
  const manualDone = ["support", "tip", "encourage"].every((id) =>
    (user.dailyTasksDone || []).includes(id)
  );
  return accomplishmentsDone && manualDone;
}

export function areWeeklyTasksComplete(user) {
  return ["weekly-question", "new-category"].every((id) =>
    (user.weeklyTasksDone || []).includes(id)
  );
}

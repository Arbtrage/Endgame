export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const daySet = new Set(
    dates.map((d) => {
      const copy = new Date(d);
      copy.setHours(0, 0, 0, 0);
      return copy.getTime();
    }),
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const check = new Date(today);
    check.setDate(check.getDate() - i);
    if (daySet.has(check.getTime())) {
      streak += 1;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

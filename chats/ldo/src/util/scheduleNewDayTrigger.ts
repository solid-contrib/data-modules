/**
 * A helper function that triggers a given callback when a new UTC day begins
 * @param onNewDay: Callback function
 * @returns Cleanup (call this function when you no longer want a trigger)
 */
export function scheduleNewDayTrigger(onNewDay: () => void): () => void {
  let timer: NodeJS.Timeout;

  const now = new Date();
  const nextUtcMidnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));

  const msUntilNextMidnight = nextUtcMidnight.getTime() - now.getTime();

  timer = setTimeout(() => {
    onNewDay();
    timer = setInterval(onNewDay, 24 * 60 * 60 * 1000); // every 24 hours
  }, msUntilNextMidnight);

  return () => {
    clearTimeout(timer);
    clearInterval(timer); // works even if it's not an interval yet
  };
}
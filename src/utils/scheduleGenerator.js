function generateSchedule(start, end, interval, stops) {
  const startDate = new Date(`1970-01-01T${start}`);
  const endDate = new Date(`1970-01-01T${end}`);
  const schedule = stops.map(() => []);
  let currTime = new Date(startDate);

  while (currTime <= endDate) {
    for (let i = 0; i < stops.length; i++) {
      const stopTime = new Date(currTime);
      stopTime.setMinutes(stopTime.getMinutes() + i * 2);

      if (stopTime > endDate) continue;

      const hours = stopTime.getHours().toString().padStart(2, "0");
      const minutes = stopTime.getMinutes().toString().padStart(2, "0");
      schedule[i].push(`${hours}:${minutes}`);
    }

    currTime.setMinutes(currTime.getMinutes() + interval);
    if (currTime > endDate) break;
  }

  return schedule;
}

module.exports = generateSchedule;

function isMeetingWithinWorkday(startWork, endWork, startMeeting, durationMinutes) {
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const startWorkMin = toMinutes(startWork);
  const endWorkMin = toMinutes(endWork);
  const startMeetingMin = toMinutes(startMeeting);
  const endMeetingMin = startMeetingMin + durationMinutes;

  return startMeetingMin >= startWorkMin && endMeetingMin <= endWorkMin;
}

// Вызов функции (чтобы ESLint не ругался)
isMeetingWithinWorkday('08:00', '17:30', '14:00', 90);


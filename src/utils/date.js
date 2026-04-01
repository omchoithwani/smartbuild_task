function getWeekRange(referenceDate = new Date()) {
  const current = new Date(referenceDate);
  const day = current.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(current);
  start.setDate(current.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

module.exports = { getWeekRange };

// Pregnancy calculation utilities

export function calculatePregnancyWeek(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  
  // Calculate conception date (280 days before due date)
  const conceptionDate = new Date(due);
  conceptionDate.setDate(due.getDate() - 280);
  
  // Calculate days since conception
  const daysSinceConception = Math.floor((now - conceptionDate) / (1000 * 60 * 60 * 24));
  
  // Calculate weeks and days
  const weeks = Math.floor(daysSinceConception / 7);
  const days = daysSinceConception % 7;
  
  // Calculate days remaining
  const daysRemaining = Math.floor((due - now) / (1000 * 60 * 60 * 24));
  
  return {
    weeks,
    days,
    daysRemaining,
    totalDays: daysSinceConception,
    dueDate
  };
}

export function getTrimester(weeks) {
  if (weeks <= 13) return 1;
  if (weeks <= 26) return 2;
  return 3;
}

export function getWeekDescription(weeks) {
  const trimester = getTrimester(weeks);
  return `${trimester}${trimester === 1 ? 'er' : 'e'} trimestre`;
}

export function formatDaysRemaining(days) {
  if (days < 0) {
    return 'Date dépassée';
  }
  if (days === 0) {
    return 'C\'est aujourd\'hui !';
  }
  if (days === 1) {
    return '1 jour restant';
  }
  return `${days} jours restants`;
}

export function formatWeekDisplay(weeks, days) {
  if (days === 0) {
    return `Semaine ${weeks}`;
  }
  return `Semaine ${weeks} + ${days} jour${days > 1 ? 's' : ''}`;
}

// Calculate due date from last menstrual period (LMP)
// LMP + 280 days = Due Date (Naegele's rule)
export function calculateDueDateFromLMP(lmpDate) {
  const lmp = new Date(lmpDate);
  const dueDate = new Date(lmp);
  dueDate.setDate(lmp.getDate() + 280);
  return dueDate.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
}

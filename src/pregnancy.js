// Pregnancy calculation utilities

export function calculatePregnancyWeek(dueDate, targetDate = null) {
  const now = targetDate ? new Date(targetDate) : new Date();
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

import { t } from './i18n/index.js';

export function getWeekDescription(weeks) {
  const trimester = getTrimester(weeks);
  return t(`trimester${trimester}`);
}

export function formatDaysRemaining(days) {
  if (days < 0) {
    return t('dateExpired');
  }
  if (days === 0) {
    return t('dueToday');
  }
  if (days === 1) {
    return t('dayRemainingFormat');
  }
  return t('daysRemainingFormat', { count: days });
}

export function formatWeekDisplay(weeks, days) {
  if (days === 0) {
    return `${t('week')} ${weeks}`;
  }
  const dayWord = days > 1 ? t('days') : t('day');
  return `${t('week')} ${weeks} + ${days} ${dayWord}`;
}

// Calculate due date from last menstrual period (LMP)
// LMP + 280 days = Due Date (Naegele's rule)
export function calculateDueDateFromLMP(lmpDate) {
  const lmp = new Date(lmpDate);
  const dueDate = new Date(lmp);
  dueDate.setDate(lmp.getDate() + 280);
  return dueDate.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
}

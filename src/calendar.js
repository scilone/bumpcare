// Calendar utilities for BumpCare

import { calculatePregnancyWeek, getTrimester } from './pregnancy.js';
import { loadPregnancyInfo, loadAppointments } from './storage.js';
import { getBabyDevelopment } from './babyDevelopment.js';

// Get all weeks in the current year for display
export function getWeeksInYear() {
  const now = new Date();
  const year = now.getFullYear();
  const weeks = [];
  
  // Start from the first day of the year
  let currentDate = new Date(year, 0, 1);
  
  // Find the first Monday of the year (or use Jan 1 if it's a Monday)
  const dayOfWeek = currentDate.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (1 - dayOfWeek + 7) % 7;
  currentDate.setDate(currentDate.getDate() + daysUntilMonday);
  
  // Generate weeks for the entire year
  while (currentDate.getFullYear() === year || weeks.length < 52) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekNumber = getWeekNumber(weekStart);
    
    weeks.push({
      weekNumber,
      startDate: new Date(weekStart),
      endDate: new Date(weekEnd),
      month: weekStart.getMonth()
    });
    
    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
    
    // Stop if we've moved to the next year
    if (currentDate.getFullYear() > year && weeks.length >= 52) {
      break;
    }
  }
  
  return weeks;
}

// Get ISO week number
export function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Get current week
export function getCurrentWeek() {
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  
  // Find Monday of current week
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return {
    weekNumber,
    startDate: weekStart,
    endDate: weekEnd
  };
}

// Get appointments for a specific week
export function getAppointmentsForWeek(weekStart, weekEnd) {
  const appointments = loadAppointments();
  
  return appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    
    return aptDate >= weekStart && aptDate <= weekEnd;
  });
}

// Get pregnancy info for a specific week
export function getPregnancyInfoForWeek(weekStart) {
  const pregnancyInfo = loadPregnancyInfo();
  if (!pregnancyInfo || !pregnancyInfo.dueDate) {
    return null;
  }
  
  // Calculate pregnancy week for the start of this calendar week
  const info = calculatePregnancyWeek(pregnancyInfo.dueDate, weekStart);
  const trimester = getTrimester(info.weeks);
  const development = getBabyDevelopment(info.weeks);
  
  return {
    weeks: info.weeks,
    days: info.days,
    trimester,
    development
  };
}

// Format date range for display
export function formatWeekRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startDay = start.getDate().toString().padStart(2, '0');
  const startMonth = (start.getMonth() + 1).toString().padStart(2, '0');
  const endDay = end.getDate().toString().padStart(2, '0');
  const endMonth = (end.getMonth() + 1).toString().padStart(2, '0');
  
  const monthName = start.toLocaleDateString('fr-FR', { month: 'long' });
  const year = start.getFullYear();
  
  return {
    short: `${startDay}/${startMonth} - ${endDay}/${endMonth}`,
    long: `${monthName} ${year}`
  };
}

// Get upcoming appointments (next 3)
export function getUpcomingAppointments(limit = 3) {
  const appointments = loadAppointments();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const upcoming = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate >= now;
  });
  
  return upcoming.slice(0, limit);
}

// Check if a week has appointments
export function weekHasAppointments(weekStart, weekEnd) {
  const appointments = getAppointmentsForWeek(weekStart, weekEnd);
  return appointments.length > 0;
}

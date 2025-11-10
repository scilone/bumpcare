// Calendar utilities for BumpCare

import { calculatePregnancyWeek, getTrimester } from './pregnancy.js';
import { loadPregnancyInfo, loadAppointments } from './storage.js';
import { getBabyDevelopment } from './babyDevelopment.js';

// Get all weeks from LMP to due date
export function getWeeksInYear() {
  const pregnancyInfo = loadPregnancyInfo();
  
  // If no pregnancy info, return empty array
  if (!pregnancyInfo || !pregnancyInfo.dueDate) {
    return [];
  }
  
  // Get LMP date or calculate it from due date
  let lmpDate;
  if (pregnancyInfo.lmpDate) {
    lmpDate = new Date(pregnancyInfo.lmpDate);
  } else {
    const dueDate = new Date(pregnancyInfo.dueDate);
    lmpDate = new Date(dueDate);
    lmpDate.setDate(dueDate.getDate() - 280);
  }
  
  const dueDate = new Date(pregnancyInfo.dueDate);
  const weeks = [];
  
  // Start from the Monday of the LMP week
  let currentDate = new Date(lmpDate);
  const dayOfWeek = currentDate.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? -6 : (1 - dayOfWeek);
  currentDate.setDate(currentDate.getDate() + daysUntilMonday);
  
  // Generate weeks from LMP to due date
  let weekCounter = 1;
  while (currentDate <= dueDate) {
    const weekStart = new Date(currentDate);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    weeks.push({
      weekNumber: weekCounter,
      pregnancyWeek: weekCounter,
      startDate: new Date(weekStart),
      endDate: new Date(weekEnd),
      month: weekStart.getMonth()
    });
    
    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
    weekCounter++;
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

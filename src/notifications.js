// Notification Management for BumpCare
// Handles browser notifications for appointment reminders

import { loadAppointments } from './storage.js';

// Check if notifications are supported
export function isNotificationSupported() {
  return 'Notification' in window;
}

// Check notification permission status
export function getNotificationPermission() {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  
  // Request permission
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

// Show a notification
export function showNotification(title, options = {}) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }
  
  const defaultOptions = {
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'bumpcare-notification',
    requireInteraction: false
  };
  
  const notificationOptions = { ...defaultOptions, ...options };
  
  try {
    return new Notification(title, notificationOptions);
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
}

// Check appointments and show notifications for upcoming ones
export function checkUpcomingAppointments() {
  if (Notification.permission !== 'granted') {
    return;
  }
  
  const appointments = loadAppointments();
  const now = new Date();
  
  appointments.forEach(apt => {
    const aptDateTime = new Date(apt.date + (apt.time ? ' ' + apt.time : ' 09:00'));
    const timeDiff = aptDateTime - now;
    
    // Notification 24 hours before (23-25 hours window)
    const hoursUntil = timeDiff / (1000 * 60 * 60);
    if (hoursUntil > 23 && hoursUntil <= 25) {
      const dateStr = aptDateTime.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      const timeStr = apt.time || 'dans la journée';
      
      showNotification('Rappel: Rendez-vous demain', {
        body: `${apt.note}\n${dateStr} ${timeStr}`,
        tag: `apt-${apt.id}-24h`
      });
    }
    
    // Notification 1 hour before (0.5-1.5 hours window)
    if (hoursUntil > 0.5 && hoursUntil <= 1.5) {
      const timeStr = apt.time || '';
      
      showNotification('Rappel: Rendez-vous dans 1 heure', {
        body: `${apt.note}${timeStr ? ' à ' + timeStr : ''}`,
        tag: `apt-${apt.id}-1h`
      });
    }
  });
}

// Initialize notification checking interval
export function initializeNotificationSystem() {
  if (!isNotificationSupported()) {
    console.log('Notifications not supported in this browser');
    return;
  }
  
  // Check immediately on initialization
  if (Notification.permission === 'granted') {
    checkUpcomingAppointments();
  }
  
  // Check every 30 minutes for upcoming appointments
  setInterval(() => {
    if (Notification.permission === 'granted') {
      checkUpcomingAppointments();
    }
  }, 30 * 60 * 1000); // 30 minutes
}

// Show notification settings status
export function getNotificationStatus() {
  if (!isNotificationSupported()) {
    return {
      supported: false,
      permission: 'unsupported',
      message: 'Les notifications ne sont pas supportées par votre navigateur'
    };
  }
  
  const permission = Notification.permission;
  
  if (permission === 'granted') {
    return {
      supported: true,
      permission: 'granted',
      message: 'Notifications activées ✓'
    };
  }
  
  if (permission === 'denied') {
    return {
      supported: true,
      permission: 'denied',
      message: 'Notifications bloquées. Autorisez-les dans les paramètres du navigateur.'
    };
  }
  
  return {
    supported: true,
    permission: 'default',
    message: 'Cliquez pour activer les notifications'
  };
}

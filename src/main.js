// Main application logic for BumpCare
import {
  loadPregnancyInfo,
  savePregnancyInfo,
  loadNotes,
  addNote,
  deleteNote,
  loadAppointments,
  addAppointment,
  deleteAppointment,
  loadWeightHistory,
  addWeight,
  isOnboardingComplete,
  setOnboardingComplete,
  loadNotificationPreference,
  saveNotificationPreference,
  loadChecklists,
  toggleChecklistItem,
  addChecklistItem,
  deleteChecklistItem,
  saveData
} from './storage.js';

import {
  calculatePregnancyWeek,
  getWeekDescription,
  formatDaysRemaining,
  formatWeekDisplay,
  calculateDueDateFromLMP
} from './pregnancy.js';

import { getDailyTip } from './tips.js';

import { 
  t, 
  setLanguage, 
  loadLanguagePreference,
  formatDate,
  formatDateTime,
  getTranslationArray,
  availableLanguages,
  getCurrentLanguage
} from './i18n/index.js';

import {
  getWeeksInYear,
  getCurrentWeek,
  getAppointmentsForWeek,
  getPregnancyInfoForWeek,
  formatWeekRange,
  getUpcomingAppointments,
  weekHasAppointments
} from './calendar.js';

import {
  initializeNotificationSystem,
  requestNotificationPermission,
  getNotificationStatus,
  getNotificationPermission
} from './notifications.js';

import { Chart, LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend, Filler } from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend, Filler);

// Track if this is first-time setup
let isFirstTimeSetup = false;

// Track chart instance
let weightChart = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Load language preference
  loadLanguagePreference();
  
  // Initialize language selector
  initializeLanguageSelector();
  
  // Update static content with current language
  updateStaticContent();
  
  // Check if this is the first time opening the app
  if (!isOnboardingComplete()) {
    isFirstTimeSetup = true;
    showOnboardingModal();
  } else {
    initializeApp();
  }
  setupEventListeners();
});

function initializeApp() {
  loadPregnancyTracker();
  loadNotesList();
  loadCalendarView();
  loadUpcomingAppointments();
  loadWeightHistoryList();
  loadChecklistsDisplay();
  loadDailyTip();
  loadNotificationSettings();
  initializeNotificationSystem();
}

// Pregnancy Tracker
function loadPregnancyTracker() {
  const pregnancyInfo = loadPregnancyInfo();
  const trackerElement = document.getElementById('pregnancy-tracker');
  
  if (!pregnancyInfo || !pregnancyInfo.dueDate) {
    // Show setup prompt
    trackerElement.innerHTML = `
      <div class="setup-prompt">
        <p>${t('startTracking')}</p>
        <button id="setup-btn" class="primary-btn">${t('configure')}</button>
      </div>
    `;
    document.getElementById('setup-btn').addEventListener('click', showSetupModal);
  } else {
    // Show pregnancy info
    const info = calculatePregnancyWeek(pregnancyInfo.dueDate);
    const trimester = getWeekDescription(info.weeks);
    const greeting = pregnancyInfo.name ? `${t('hello')} ${pregnancyInfo.name} !` : `${t('hello')} !`;
    
    trackerElement.innerHTML = `
      <div class="pregnancy-display">
        <p style="font-size: 1.1rem; margin-bottom: 1rem;">${greeting}</p>
        <div class="week-info">${formatWeekDisplay(info.weeks, info.days)}</div>
        <div class="days-left">${formatDaysRemaining(info.daysRemaining)}</div>
        <div class="trimester">${trimester}</div>
        <button id="edit-pregnancy-btn" class="secondary-btn" style="margin-top: 1rem; width: auto; padding: 0.5rem 1rem;">${t('modify')}</button>
      </div>
    `;
    document.getElementById('edit-pregnancy-btn').addEventListener('click', showSetupModal);
  }
}

// Onboarding Modal (first-time setup)
function showOnboardingModal() {
  const modal = document.getElementById('setup-modal');
  const cancelBtn = document.getElementById('cancel-setup');
  
  // Hide cancel button during onboarding
  cancelBtn.style.display = 'none';
  
  // Clear any existing values
  document.getElementById('name').value = '';
  document.getElementById('due-date').value = '';
  document.getElementById('lmp-date').value = '';
  
  modal.classList.remove('hidden');
}

// Setup Modal (edit mode)
function showSetupModal() {
  const modal = document.getElementById('setup-modal');
  const pregnancyInfo = loadPregnancyInfo();
  const cancelBtn = document.getElementById('cancel-setup');
  
  // Show cancel button in edit mode
  cancelBtn.style.display = 'block';
  
  if (pregnancyInfo) {
    document.getElementById('due-date').value = pregnancyInfo.dueDate;
    document.getElementById('name').value = pregnancyInfo.name || '';
  }
  
  modal.classList.remove('hidden');
}

function hideSetupModal() {
  const modal = document.getElementById('setup-modal');
  modal.classList.add('hidden');
  
  // Reset first-time setup flag
  if (isFirstTimeSetup) {
    isFirstTimeSetup = false;
  }
}

function setupEventListeners() {
  // Tab navigation
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // Remove active class from all buttons and panels
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));
      
      // Add active class to clicked button and corresponding panel
      button.classList.add('active');
      document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
  });
  
  // Radio button listeners for date choice
  const radioButtons = document.querySelectorAll('input[name="date-type"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
      // Hide all date inputs
      document.querySelectorAll('.date-input').forEach(input => {
        input.classList.remove('active');
        input.removeAttribute('required');
      });
      
      // Show the selected date input
      const selectedValue = e.target.value;
      const selectedInput = document.getElementById(selectedValue);
      selectedInput.classList.add('active');
      selectedInput.setAttribute('required', 'required');
    });
  });
  
  // Setup form
  const setupForm = document.getElementById('setup-form');
  setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const dateType = document.querySelector('input[name="date-type"]:checked').value;
    let dueDate;
    let lmpDate = null;
    
    if (dateType === 'due-date') {
      dueDate = document.getElementById('due-date').value;
    } else {
      // Calculate due date from LMP
      lmpDate = document.getElementById('lmp-date').value;
      dueDate = calculateDueDateFromLMP(lmpDate);
    }
    
    // Validate inputs
    if (!name) {
      alert(t('pleaseEnterName'));
      return;
    }
    
    if (!dueDate) {
      alert(t('pleaseSelectDate'));
      return;
    }
    
    savePregnancyInfo({ dueDate, name, lmpDate });
    
    // Mark onboarding as complete if this is first time
    if (isFirstTimeSetup) {
      setOnboardingComplete();
      isFirstTimeSetup = false;
      // Initialize the app after first-time setup
      initializeApp();
    }
    
    hideSetupModal();
    loadPregnancyTracker();
  });
  
  document.getElementById('cancel-setup').addEventListener('click', () => {
    // Only allow cancel if not first-time setup
    if (!isFirstTimeSetup) {
      hideSetupModal();
    }
  });
  
  // Notes
  document.getElementById('add-note-btn').addEventListener('click', () => {
    const noteInput = document.getElementById('note-input');
    const content = noteInput.value.trim();
    
    if (content) {
      addNote(content);
      noteInput.value = '';
      loadNotesList();
    }
  });
  
  // Appointments
  document.getElementById('add-appointment-btn').addEventListener('click', () => {
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('appointment-time').value;
    const note = document.getElementById('appointment-note').value;
    
    if (date && note) {
      addAppointment(date, time, note);
      document.getElementById('appointment-date').value = '';
      document.getElementById('appointment-time').value = '';
      document.getElementById('appointment-note').value = '';
      loadCalendarView();
      loadUpcomingAppointments();
    }
  });
  
  // Close week modal
  document.getElementById('close-week-modal').addEventListener('click', hideWeekModal);
  document.getElementById('week-modal-overlay').addEventListener('click', hideWeekModal);
  
  // Weight tracking
  const handleWeightSubmit = () => {
    const weightInput = document.getElementById('weight-input');
    const weightDateInput = document.getElementById('weight-date');
    const weight = weightInput.value;
    const selectedDate = weightDateInput.value;
    
    if (weight && weight > 0) {
      addWeight(weight, selectedDate);
      weightInput.value = '';
      weightDateInput.value = '';
      loadWeightHistoryList();
    }
  };
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('weight-date').value = today;
  
  document.getElementById('add-weight-btn').addEventListener('click', handleWeightSubmit);
  
  // Allow Enter key to submit weight
  document.getElementById('weight-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleWeightSubmit();
    }
  });
  
  // Notification settings
  const notificationBtn = document.getElementById('notification-settings-btn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', handleNotificationPermissionRequest);
  }
  
  // Checklist items
  document.getElementById('add-maternity-item-btn').addEventListener('click', () => {
    const input = document.getElementById('maternity-item-input');
    const text = input.value.trim();
    if (text) {
      addChecklistItem('maternity', text);
      input.value = '';
      loadChecklistsDisplay();
    }
  });
  
  document.getElementById('add-baby-arrival-item-btn').addEventListener('click', () => {
    const input = document.getElementById('baby-arrival-item-input');
    const text = input.value.trim();
    if (text) {
      addChecklistItem('babyArrival', text);
      input.value = '';
      loadChecklistsDisplay();
    }
  });
}

// Notes List
function loadNotesList() {
  const notes = loadNotes();
  const notesList = document.getElementById('notes-list');
  
  if (notes.length === 0) {
    notesList.innerHTML = `<div class="empty-state">${t('noNotes')}</div>`;
    return;
  }
  
  notesList.innerHTML = notes.map(note => {
    const date = new Date(note.date);
    const formattedDate = formatDateTime(date, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <div class="note-item" data-id="${note.id}">
        <div class="note-date">${formattedDate}</div>
        <div class="note-content">${escapeHtml(note.content)}</div>
        <div class="note-actions">
          <button class="delete-btn" onclick="window.deleteNoteHandler(${note.id})">${t('deleteNote')}</button>
        </div>
      </div>
    `;
  }).join('');
}

// Upcoming Appointments
function loadUpcomingAppointments() {
  const upcoming = getUpcomingAppointments(3);
  const upcomingElement = document.getElementById('upcoming-appointments');
  
  if (upcoming.length === 0) {
    upcomingElement.innerHTML = `<div class="empty-state">${t('noAppointments')}</div>`;
    return;
  }
  
  upcomingElement.innerHTML = upcoming.map(apt => {
    const date = new Date(apt.date);
    const formattedDate = formatDate(date, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const timeDisplay = apt.time ? ` ${t('at')} ${apt.time}` : '';
    
    return `
      <div class="upcoming-appointment-item" data-id="${apt.id}">
        <div class="upcoming-appointment-info">
          <div class="upcoming-appointment-date">${formattedDate}${timeDisplay}</div>
          ${apt.note ? `<div class="upcoming-appointment-note">${escapeHtml(apt.note)}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Calendar View
function loadCalendarView() {
  const weeks = getWeeksInYear();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const calendarGrid = document.querySelector('.calendar-grid');
  
  calendarGrid.innerHTML = weeks.map(week => {
    const isCurrentWeek = now >= week.startDate && now <= week.endDate;
    const isPastWeek = now > week.endDate;
    const hasAppointments = weekHasAppointments(week.startDate, week.endDate);
    
    let classes = 'calendar-week';
    if (isCurrentWeek) {
      classes += ' current-week';
    } else if (isPastWeek) {
      classes += ' past-week';
    }
    
    if (hasAppointments) classes += ' has-appointments';
    
    const monthName = formatDate(week.startDate, { month: 'short' });
    
    return `
      <div class="${classes}" 
           data-week-start="${week.startDate.toISOString()}"
           data-week-end="${week.endDate.toISOString()}"
           onclick="window.showWeekDetailsHandler('${week.startDate.toISOString()}', '${week.endDate.toISOString()}')">
        <div class="week-number">S${week.pregnancyWeek}</div>
        <div class="week-month">${monthName}</div>
        ${hasAppointments ? '<div class="week-indicator"></div>' : ''}
      </div>
    `;
  }).join('');
}

// Show week details modal
function showWeekDetails(weekStartISO, weekEndISO) {
  const weekStart = new Date(weekStartISO);
  const weekEnd = new Date(weekEndISO);
  
  const modal = document.getElementById('week-modal');
  const title = document.getElementById('week-modal-title');
  const content = document.getElementById('week-modal-content');
  
  // Format date range
  const dateRange = formatWeekRange(weekStart, weekEnd);
  title.textContent = `${t('week')} ${dateRange.short}`;
  
  // Get appointments for this week
  const appointments = getAppointmentsForWeek(weekStart, weekEnd);
  
  // Get pregnancy info for this week
  const pregnancyInfo = getPregnancyInfoForWeek(weekStart);
  
  let contentHTML = `
    <div class="week-detail-section">
      <h3>${t('period')}</h3>
      <p>${dateRange.long}</p>
      <p style="color: var(--text-light);">${dateRange.short}</p>
    </div>
  `;
  
  if (pregnancyInfo) {
    const trimesterText = t(`trimester${pregnancyInfo.trimester}`);
    const dayWord = pregnancyInfo.days > 1 ? t('days') : t('day');
    
    contentHTML += `
      <div class="week-detail-section">
        <h3>${t('yourPregnancy')}</h3>
        <div class="pregnancy-info-detail">
          <p><strong>${t('trimester')}:</strong> ${trimesterText}</p>
          <p><strong>${t('pregnancyWeek')}:</strong> ${t('week')} ${pregnancyInfo.weeks} + ${pregnancyInfo.days} ${dayWord}</p>
          <p><strong>${t('weeksSA')}:</strong> ${pregnancyInfo.weeks + 2} SA</p>
          <p><strong>${t('weeksSG')}:</strong> ${pregnancyInfo.weeks} SG</p>
        </div>
      </div>
      
      <div class="week-detail-section">
        <h3>${t('babyDevelopment')}</h3>
        <div class="baby-development-info">
          ${pregnancyInfo.development}
        </div>
      </div>
    `;
  }
  
  contentHTML += `
    <div class="week-detail-section">
      <h3>${t('weekAppointments')}</h3>
  `;
  
  if (appointments.length === 0) {
    contentHTML += `<p style="color: var(--text-light); font-style: italic;">${t('noWeekAppointments')}</p>`;
  } else {
    contentHTML += '<div class="week-appointments-list">';
    appointments.forEach(apt => {
      const date = new Date(apt.date);
      const formattedDate = formatDate(date, {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      const timeDisplay = apt.time ? ` ${t('at')} ${apt.time}` : '';
      
      contentHTML += `
        <div class="week-appointment-item">
          <div class="week-appointment-time">${formattedDate}${timeDisplay}</div>
          ${apt.note ? `<div class="week-appointment-note">${escapeHtml(apt.note)}</div>` : ''}
        </div>
      `;
    });
    contentHTML += '</div>';
  }
  
  contentHTML += '</div>';
  
  content.innerHTML = contentHTML;
  modal.classList.remove('hidden');
}

function hideWeekModal() {
  const modal = document.getElementById('week-modal');
  modal.classList.add('hidden');
}

// Weight History List
function loadWeightHistoryList() {
  const history = loadWeightHistory();
  const historyElement = document.getElementById('weight-history');
  const canvas = document.getElementById('weight-chart');
  
  if (history.length === 0) {
    historyElement.innerHTML = `<div class="empty-state">${t('noWeightRecords')}</div>`;
    if (weightChart) {
      weightChart.destroy();
      weightChart = null;
    }
    return;
  }
  
  // Ensure canvas is visible
  if (!canvas) {
    historyElement.innerHTML = '<canvas id="weight-chart"></canvas>';
  }
  
  // Prepare data for chart (sort by date)
  const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sortedHistory.map(record => new Date(record.date));
  const data = sortedHistory.map(record => record.weight);
  
  // Destroy existing chart if it exists
  if (weightChart) {
    weightChart.destroy();
  }
  
  // Create new chart
  const ctx = document.getElementById('weight-chart');
  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: t('weight'),
        data: data,
        borderColor: '#FF6B9D',
        backgroundColor: 'rgba(255, 107, 157, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#FF6B9D',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 14
          },
          bodyFont: {
            size: 14
          },
          padding: 12,
          displayColors: false,
          callbacks: {
            title: function(context) {
              const timestamp = context[0].parsed.x;
              const date = new Date(timestamp);
              return formatDate(date, {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
            },
            label: function(context) {
              return context.parsed.y + ' kg';
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'd MMM'
            }
          },
          title: {
            display: true,
            text: t('appointmentDate'),
            font: {
              size: 12
            }
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: t('weight'),
            font: {
              size: 12
            }
          },
          ticks: {
            callback: function(value) {
              return value + ' kg';
            }
          }
        }
      }
    }
  });
}

// Get default checklists with current language
function getDefaultChecklists() {
  const maternityItems = getTranslationArray('checklistMaternity');
  const babyArrivalItems = getTranslationArray('checklistBabyArrival');
  
  return {
    maternity: {
      title: t('maternityPreparation'),
      items: maternityItems.map((text, index) => ({
        id: index + 1,
        text,
        checked: false
      }))
    },
    babyArrival: {
      title: t('babyArrival'),
      items: babyArrivalItems.map((text, index) => ({
        id: index + 1,
        text,
        checked: false
      }))
    }
  };
}

// Checklists Display
function loadChecklistsDisplay() {
  let checklists = loadChecklists();
  
  // If no saved checklists, initialize with defaults
  if (!checklists) {
    checklists = getDefaultChecklists();
    saveData('bumpcare_checklists', checklists);
  }
  
  // Load maternity checklist
  const maternityContainer = document.getElementById('maternity-checklist');
  maternityContainer.innerHTML = checklists.maternity.items.map(item => `
    <div class="checklist-item ${item.checked ? 'checked' : ''}">
      <input type="checkbox" 
             id="maternity-${item.id}" 
             ${item.checked ? 'checked' : ''}
             onchange="window.toggleChecklistItemHandler('maternity', ${item.id})">
      <label for="maternity-${item.id}">${escapeHtml(item.text)}</label>
      <button class="delete-checklist-btn" onclick="window.deleteChecklistItemHandler('maternity', ${item.id})">🗑️</button>
    </div>
  `).join('');
  
  // Load baby arrival checklist
  const babyArrivalContainer = document.getElementById('baby-arrival-checklist');
  babyArrivalContainer.innerHTML = checklists.babyArrival.items.map(item => `
    <div class="checklist-item ${item.checked ? 'checked' : ''}">
      <input type="checkbox" 
             id="baby-arrival-${item.id}" 
             ${item.checked ? 'checked' : ''}
             onchange="window.toggleChecklistItemHandler('babyArrival', ${item.id})">
      <label for="baby-arrival-${item.id}">${escapeHtml(item.text)}</label>
      <button class="delete-checklist-btn" onclick="window.deleteChecklistItemHandler('babyArrival', ${item.id})">🗑️</button>
    </div>
  `).join('');
}

// Daily Tip
function loadDailyTip() {
  const tip = getDailyTip();
  document.querySelector('.tip').textContent = tip;
}

// Notification Settings
function loadNotificationSettings() {
  const notificationBtn = document.getElementById('notification-settings-btn');
  if (!notificationBtn) return;
  
  const status = getNotificationStatus();
  
  // Update button text and state
  notificationBtn.textContent = status.message;
  
  if (status.permission === 'granted') {
    notificationBtn.disabled = false;
    if (status.enabled) {
      notificationBtn.classList.add('active');
    } else {
      notificationBtn.classList.remove('active');
    }
  } else if (status.permission === 'denied') {
    notificationBtn.disabled = true;
    notificationBtn.classList.remove('active');
  } else { // default or unsupported
    notificationBtn.disabled = !status.supported;
    notificationBtn.classList.remove('active');
  }
}

async function handleNotificationPermissionRequest() {
  const permission = getNotificationPermission();

  if (permission === 'granted') {
    // Toggle the preference
    const areNotificationsEnabled = loadNotificationPreference();
    saveNotificationPreference(!areNotificationsEnabled);
    if (!areNotificationsEnabled) {
      alert(t('notificationsReactivated'));
    } else {
      alert(t('notificationsDeactivated'));
    }
  } else if (permission === 'denied') {
    alert(t('notificationsBlockedAlert'));
    return;
  } else {
    // Request permission for the first time
    const newPermission = await requestNotificationPermission();
    if (newPermission === 'granted') {
      saveNotificationPreference(true);
      alert(t('notificationsActivated'));
    } else if (newPermission === 'denied') {
      // User denied permission, so we save the preference as false
      saveNotificationPreference(false);
      alert(t('notificationsRefused'));
    }
  }

  loadNotificationSettings();
}

// Delete handlers (exposed globally for inline onclick)
window.deleteNoteHandler = (noteId) => {
  if (confirm(t('confirmDeleteNote'))) {
    deleteNote(noteId);
    loadNotesList();
  }
};

window.deleteAppointmentHandler = (aptId) => {
  if (confirm(t('confirmDeleteNote'))) {
    deleteAppointment(aptId);
    loadCalendarView();
    loadUpcomingAppointments();
  }
};

window.showWeekDetailsHandler = (weekStartISO, weekEndISO) => {
  showWeekDetails(weekStartISO, weekEndISO);
};

window.toggleChecklistItemHandler = (checklistType, itemId) => {
  toggleChecklistItem(checklistType, itemId);
  loadChecklistsDisplay();
};

window.deleteChecklistItemHandler = (checklistType, itemId) => {
  if (confirm(t('confirmDeleteItem'))) {
    deleteChecklistItem(checklistType, itemId);
    loadChecklistsDisplay();
  }
};

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Language selector functionality
function initializeLanguageSelector() {
  // Create language selector in the header
  const header = document.querySelector('header');
  const langSelector = document.createElement('div');
  langSelector.className = 'language-selector';
  langSelector.innerHTML = `
    <button id="lang-selector-btn" class="lang-btn" aria-label="Select language">
      🌐 ${getCurrentLanguage().toUpperCase()}
    </button>
    <div id="lang-dropdown" class="lang-dropdown hidden">
      ${availableLanguages.map(lang => `
        <button class="lang-option ${getCurrentLanguage() === lang.code ? 'active' : ''}" 
                data-lang="${lang.code}">
          ${lang.flag} ${lang.label}
        </button>
      `).join('')}
    </div>
  `;
  header.appendChild(langSelector);
  
  // Toggle dropdown
  const langBtn = document.getElementById('lang-selector-btn');
  const dropdown = document.getElementById('lang-dropdown');
  
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    dropdown.classList.add('hidden');
  });
  
  // Handle language selection
  dropdown.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const newLang = option.dataset.lang;
      if (setLanguage(newLang)) {
        updateUILanguage();
        dropdown.classList.add('hidden');
      }
    });
  });
}

// Update UI with new language
function updateUILanguage() {
  // Reload all dynamic content
  loadPregnancyTracker();
  loadNotesList();
  loadCalendarView();
  loadUpcomingAppointments();
  loadWeightHistoryList();
  loadChecklistsDisplay();
  loadDailyTip();
  loadNotificationSettings();
  
  // Update language button
  const langBtn = document.getElementById('lang-selector-btn');
  if (langBtn) {
    langBtn.textContent = `🌐 ${getCurrentLanguage().toUpperCase()}`;
  }
  
  // Update active state in dropdown
  document.querySelectorAll('.lang-option').forEach(option => {
    if (option.dataset.lang === getCurrentLanguage()) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
  
  // Update static HTML content
  updateStaticContent();
}

// Update static HTML content with translations
function updateStaticContent() {
  // Helper function to safely update element
  const safeUpdate = (selector, property, value) => {
    const element = document.querySelector(selector);
    if (element) {
      element[property] = value;
    }
  };
  
  // Update HTML lang attribute
  document.documentElement.lang = getCurrentLanguage();
  
  // Update page title
  document.title = `BumpCare - ${t('tagline')}`;
  
  // Update header
  safeUpdate('header h1', 'textContent', `🤰 ${t('appTitle')}`);
  safeUpdate('header .tagline', 'textContent', t('tagline'));
  
  // Update tabs
  const tabs = document.querySelectorAll('.tab-btn');
  const tabKeys = ['appointments', 'notes', 'preparation', 'health'];
  tabs.forEach((tab, index) => {
    tab.textContent = t(tabKeys[index]);
  });
  
  // Update section titles
  safeUpdate('.pregnancy-info h2', 'textContent', t('myPregnancy'));
  safeUpdate('#tab-appointments .card:nth-child(1) h2', 'textContent', t('myAppointments'));
  safeUpdate('#tab-appointments .card:nth-child(2) h2', 'textContent', t('calendar'));
  safeUpdate('#tab-appointments .card:nth-child(3) h2', 'textContent', t('addAppointment'));
  safeUpdate('#tab-appointments .card:nth-child(4) h2', 'textContent', t('notifications'));
  safeUpdate('#tab-appointments .card:nth-child(4) p', 'textContent', t('notificationDescription'));
  
  safeUpdate('#tab-notes h2', 'textContent', t('myNotes'));
  safeUpdate('#note-input', 'placeholder', t('notePlaceholder'));
  safeUpdate('#add-note-btn', 'textContent', t('addNote'));
  
  safeUpdate('#tab-preparation .card:nth-child(1) h2', 'textContent', t('maternityPreparation'));
  safeUpdate('#tab-preparation .card:nth-child(1) p', 'textContent', t('maternityDescription'));
  safeUpdate('#maternity-item-input', 'placeholder', t('addCustomItem'));
  
  safeUpdate('#tab-preparation .card:nth-child(2) h2', 'textContent', t('babyArrival'));
  safeUpdate('#tab-preparation .card:nth-child(2) p', 'textContent', t('babyArrivalDescription'));
  safeUpdate('#baby-arrival-item-input', 'placeholder', t('addCustomItem'));
  
  safeUpdate('#tab-health h2', 'textContent', t('healthTracking'));
  safeUpdate('#tab-health .health-item label', 'textContent', t('weight'));
  safeUpdate('#add-weight-btn', 'textContent', t('record'));
  
  // Update tips section - using alternative selector
  const tipsCard = document.querySelector('#tips-section')?.closest('.card');
  if (tipsCard) {
    const h2 = tipsCard.querySelector('h2');
    if (h2) h2.textContent = t('dailyTip');
  }
  
  // Update footer
  const footerP = document.querySelector('footer p:first-child');
  if (footerP) footerP.textContent = t('footerText');
  safeUpdate('footer .version', 'textContent', t('version'));
  
  // Update setup modal
  safeUpdate('#setup-modal h2', 'textContent', t('setupTitle'));
  safeUpdate('label[for="name"]', 'textContent', t('firstName'));
  safeUpdate('#name', 'placeholder', t('firstNamePlaceholder'));
  safeUpdate('.date-choice-section > p', 'textContent', t('chooseOption'));
  
  const radioOptions = document.querySelectorAll('.radio-option span');
  if (radioOptions[0]) radioOptions[0].textContent = t('dueDate');
  if (radioOptions[1]) radioOptions[1].textContent = t('lmpDate');
  
  safeUpdate('#setup-form button[type="submit"]', 'textContent', t('save'));
  safeUpdate('#cancel-setup', 'textContent', t('cancel'));
  
  // Update appointment form
  safeUpdate('#appointment-date', 'placeholder', t('appointmentDate'));
  safeUpdate('#appointment-time', 'placeholder', t('appointmentTime'));
  safeUpdate('#appointment-note', 'placeholder', t('appointmentNote'));
  safeUpdate('#add-appointment-btn', 'textContent', t('add'));
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('Service Worker registered:', registration);
      },
      (error) => {
        console.log('Service Worker registration failed:', error);
      }
    );
  });
}

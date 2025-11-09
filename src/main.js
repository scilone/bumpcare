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
  setOnboardingComplete
} from './storage.js';

import {
  calculatePregnancyWeek,
  getWeekDescription,
  formatDaysRemaining,
  formatWeekDisplay,
  calculateDueDateFromLMP
} from './pregnancy.js';

import { getDailyTip } from './tips.js';

// Track if this is first-time setup
let isFirstTimeSetup = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
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
  loadAppointmentsList();
  loadWeightHistoryList();
  loadDailyTip();
}

// Pregnancy Tracker
function loadPregnancyTracker() {
  const pregnancyInfo = loadPregnancyInfo();
  const trackerElement = document.getElementById('pregnancy-tracker');
  
  if (!pregnancyInfo || !pregnancyInfo.dueDate) {
    // Show setup prompt
    trackerElement.innerHTML = `
      <div class="setup-prompt">
        <p>Commencez votre suivi de grossesse</p>
        <button id="setup-btn" class="primary-btn">Configurer</button>
      </div>
    `;
    document.getElementById('setup-btn').addEventListener('click', showSetupModal);
  } else {
    // Show pregnancy info
    const info = calculatePregnancyWeek(pregnancyInfo.dueDate);
    const trimester = getWeekDescription(info.weeks);
    const greeting = pregnancyInfo.name ? `Bonjour ${pregnancyInfo.name} !` : 'Bonjour !';
    
    trackerElement.innerHTML = `
      <div class="pregnancy-display">
        <p style="font-size: 1.1rem; margin-bottom: 1rem;">${greeting}</p>
        <div class="week-info">${formatWeekDisplay(info.weeks, info.days)}</div>
        <div class="days-left">${formatDaysRemaining(info.daysRemaining)}</div>
        <div class="trimester">${trimester}</div>
        <button id="edit-pregnancy-btn" class="secondary-btn" style="margin-top: 1rem; width: auto; padding: 0.5rem 1rem;">Modifier</button>
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
    
    if (dateType === 'due-date') {
      dueDate = document.getElementById('due-date').value;
    } else {
      // Calculate due date from LMP
      const lmpDate = document.getElementById('lmp-date').value;
      dueDate = calculateDueDateFromLMP(lmpDate);
    }
    
    // Validate inputs
    if (!name) {
      alert('Veuillez entrer votre prénom');
      return;
    }
    
    if (!dueDate) {
      alert('Veuillez sélectionner une date');
      return;
    }
    
    savePregnancyInfo({ dueDate, name });
    
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
    
    if (date && time) {
      addAppointment(date, time, note);
      document.getElementById('appointment-date').value = '';
      document.getElementById('appointment-time').value = '';
      document.getElementById('appointment-note').value = '';
      loadAppointmentsList();
    }
  });
  
  // Weight tracking
  document.getElementById('add-weight-btn').addEventListener('click', () => {
    const weightInput = document.getElementById('weight-input');
    const weight = weightInput.value;
    
    if (weight && weight > 0) {
      addWeight(weight);
      weightInput.value = '';
      loadWeightHistoryList();
    }
  });
}

// Notes List
function loadNotesList() {
  const notes = loadNotes();
  const notesList = document.getElementById('notes-list');
  
  if (notes.length === 0) {
    notesList.innerHTML = '<div class="empty-state">Aucune note pour le moment</div>';
    return;
  }
  
  notesList.innerHTML = notes.map(note => {
    const date = new Date(note.date);
    const formattedDate = date.toLocaleDateString('fr-FR', {
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
          <button class="delete-btn" onclick="window.deleteNoteHandler(${note.id})">🗑️ Supprimer</button>
        </div>
      </div>
    `;
  }).join('');
}

// Appointments List
function loadAppointmentsList() {
  const appointments = loadAppointments();
  const appointmentsList = document.getElementById('appointments-list');
  
  if (appointments.length === 0) {
    appointmentsList.innerHTML = '<div class="empty-state">Aucun rendez-vous prévu</div>';
    return;
  }
  
  appointmentsList.innerHTML = appointments.map(apt => {
    const date = new Date(apt.date);
    const formattedDate = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `
      <div class="appointment-item" data-id="${apt.id}">
        <div class="appointment-info">
          <div class="appointment-date-time">${formattedDate} à ${apt.time}</div>
          ${apt.note ? `<div class="appointment-note">${escapeHtml(apt.note)}</div>` : ''}
        </div>
        <button class="delete-btn" onclick="window.deleteAppointmentHandler(${apt.id})">🗑️</button>
      </div>
    `;
  }).join('');
}

// Weight History List
function loadWeightHistoryList() {
  const history = loadWeightHistory();
  const historyElement = document.getElementById('weight-history');
  
  if (history.length === 0) {
    historyElement.innerHTML = '<div class="empty-state">Aucune mesure enregistrée</div>';
    return;
  }
  
  historyElement.innerHTML = history.slice(0, 5).map(record => {
    const date = new Date(record.date);
    const formattedDate = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
    
    return `
      <div class="weight-record">
        <span class="weight-value">${record.weight} kg</span>
        <span class="weight-date">${formattedDate}</span>
      </div>
    `;
  }).join('');
}

// Daily Tip
function loadDailyTip() {
  const tip = getDailyTip();
  document.querySelector('.tip').textContent = tip;
}

// Delete handlers (exposed globally for inline onclick)
window.deleteNoteHandler = (noteId) => {
  if (confirm('Supprimer cette note ?')) {
    deleteNote(noteId);
    loadNotesList();
  }
};

window.deleteAppointmentHandler = (aptId) => {
  if (confirm('Supprimer ce rendez-vous ?')) {
    deleteAppointment(aptId);
    loadAppointmentsList();
  }
};

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

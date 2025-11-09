// Local Storage Management for BumpCare
// All data is stored locally in the browser

const STORAGE_KEYS = {
  PREGNANCY_INFO: 'bumpcare_pregnancy',
  NOTES: 'bumpcare_notes',
  APPOINTMENTS: 'bumpcare_appointments',
  WEIGHT_HISTORY: 'bumpcare_weight',
  SETTINGS: 'bumpcare_settings',
  ONBOARDING_COMPLETE: 'bumpcare_onboarding_complete'
};

// Generic storage functions
export function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

export function loadData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
}

export function deleteData(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error deleting data:', error);
    return false;
  }
}

// Pregnancy Info
export function savePregnancyInfo(info) {
  // Calculate and store LMP if not provided but dueDate is available
  if (info.dueDate && !info.lmpDate) {
    const dueDate = new Date(info.dueDate);
    const lmp = new Date(dueDate);
    lmp.setDate(dueDate.getDate() - 280);
    info.lmpDate = lmp.toISOString().split('T')[0];
  }
  return saveData(STORAGE_KEYS.PREGNANCY_INFO, info);
}

export function loadPregnancyInfo() {
  return loadData(STORAGE_KEYS.PREGNANCY_INFO);
}

// Notes
export function saveNotes(notes) {
  return saveData(STORAGE_KEYS.NOTES, notes);
}

export function loadNotes() {
  return loadData(STORAGE_KEYS.NOTES) || [];
}

export function addNote(noteContent) {
  const notes = loadNotes();
  const newNote = {
    id: Date.now(),
    content: noteContent,
    date: new Date().toISOString()
  };
  notes.unshift(newNote);
  saveNotes(notes);
  return newNote;
}

export function deleteNote(noteId) {
  const notes = loadNotes();
  const filteredNotes = notes.filter(note => note.id !== noteId);
  return saveNotes(filteredNotes);
}

// Appointments
export function saveAppointments(appointments) {
  return saveData(STORAGE_KEYS.APPOINTMENTS, appointments);
}

export function loadAppointments() {
  return loadData(STORAGE_KEYS.APPOINTMENTS) || [];
}

export function addAppointment(date, time, note) {
  const appointments = loadAppointments();
  const newAppointment = {
    id: Date.now(),
    date,
    time: time || null,
    note,
    created: new Date().toISOString()
  };
  appointments.push(newAppointment);
  // Sort by date and time
  appointments.sort((a, b) => {
    // Build date strings for comparison, using midnight (00:00) if no time is specified
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';
    const dateA = new Date(a.date + ' ' + timeA);
    const dateB = new Date(b.date + ' ' + timeB);
    return dateA - dateB;
  });
  saveAppointments(appointments);
  return newAppointment;
}

export function deleteAppointment(appointmentId) {
  const appointments = loadAppointments();
  const filteredAppointments = appointments.filter(apt => apt.id !== appointmentId);
  return saveAppointments(filteredAppointments);
}

// Weight History
export function saveWeightHistory(history) {
  return saveData(STORAGE_KEYS.WEIGHT_HISTORY, history);
}

export function loadWeightHistory() {
  return loadData(STORAGE_KEYS.WEIGHT_HISTORY) || [];
}

export function addWeight(weight, date = null) {
  const history = loadWeightHistory();
  const recordDate = date ? new Date(date + 'T00:00:00').toISOString() : new Date().toISOString();
  const newRecord = {
    id: Date.now(),
    weight: parseFloat(weight),
    date: recordDate
  };
  history.unshift(newRecord);
  // Keep only last 50 records
  if (history.length > 50) {
    history.pop();
  }
  saveWeightHistory(history);
  return newRecord;
}

// Settings
export function saveSettings(settings) {
  return saveData(STORAGE_KEYS.SETTINGS, settings);
}

export function loadSettings() {
  return loadData(STORAGE_KEYS.SETTINGS) || {};
}

// Onboarding
export function isOnboardingComplete() {
  return loadData(STORAGE_KEYS.ONBOARDING_COMPLETE) === true;
}

export function setOnboardingComplete() {
  return saveData(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
}

// Clear all data (for testing or reset)
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    deleteData(key);
  });
}

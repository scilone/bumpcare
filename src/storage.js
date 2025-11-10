// Local Storage Management for BumpCare
// All data is stored locally in the browser

const STORAGE_KEYS = {
  PREGNANCY_INFO: 'bumpcare_pregnancy',
  NOTES: 'bumpcare_notes',
  APPOINTMENTS: 'bumpcare_appointments',
  WEIGHT_HISTORY: 'bumpcare_weight',
  SETTINGS: 'bumpcare_settings',
  ONBOARDING_COMPLETE: 'bumpcare_onboarding_complete',
  NOTIFICATIONS_ENABLED: 'bumpcare_notifications_enabled',
  CHECKLISTS: 'bumpcare_checklists'
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

// Notification Preferences
export function saveNotificationPreference(enabled) {
  return saveData(STORAGE_KEYS.NOTIFICATIONS_ENABLED, enabled);
}

export function loadNotificationPreference() {
  const preference = loadData(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
  // Default to true if not set, so notifications are on by default if permission is granted
  return preference === null ? true : preference;
}

// Checklists Management
export function getDefaultChecklists() {
  return {
    maternity: {
      title: "Préparation pour la Maternité",
      items: [
        { id: 1, text: "Documents administratifs (carte d'identité, carte vitale, livret de famille)", checked: false },
        { id: 2, text: "Dossier médical de grossesse et examens", checked: false },
        { id: 3, text: "Chemises de nuit ou pyjamas confortables (3-4)", checked: false },
        { id: 4, text: "Soutiens-gorge d'allaitement", checked: false },
        { id: 5, text: "Sous-vêtements adaptés (culottes jetables ou en coton)", checked: false },
        { id: 6, text: "Serviettes hygiéniques maternité", checked: false },
        { id: 7, text: "Robe de chambre et chaussons", checked: false },
        { id: 8, text: "Trousse de toilette (brosse à dents, shampooing, savon, etc.)", checked: false },
        { id: 9, text: "Serviettes de toilette", checked: false },
        { id: 10, text: "Chargeur de téléphone", checked: false },
        { id: 11, text: "En-cas et bouteille d'eau", checked: false },
        { id: 12, text: "Tenue confortable pour le retour à la maison", checked: false }
      ]
    },
    babyArrival: {
      title: "Arrivée de Bébé à la Maison",
      items: [
        { id: 1, text: "Siège-auto homologué et installé", checked: false },
        { id: 2, text: "Berceau ou lit bébé avec matelas ferme", checked: false },
        { id: 3, text: "Linge de lit adapté (draps-housses, gigoteuse)", checked: false },
        { id: 4, text: "Bodies et pyjamas (taille naissance et 1 mois)", checked: false },
        { id: 5, text: "Bonnets et chaussettes", checked: false },
        { id: 6, text: "Couverture légère", checked: false },
        { id: 7, text: "Couches nouveau-né", checked: false },
        { id: 8, text: "Lingettes et produits de toilette pour bébé", checked: false },
        { id: 9, text: "Table à langer ou matelas à langer", checked: false },
        { id: 10, text: "Thermomètre pour bébé", checked: false },
        { id: 11, text: "Biberons et stérilisateur (si nécessaire)", checked: false },
        { id: 12, text: "Lait infantile (si non-allaitement)", checked: false },
        { id: 13, text: "Coussin d'allaitement (si allaitement)", checked: false },
        { id: 14, text: "Baignoire pour bébé", checked: false },
        { id: 15, text: "Numéros d'urgence (pédiatre, sage-femme, hôpital)", checked: false }
      ]
    }
  };
}

export function loadChecklists() {
  const saved = loadData(STORAGE_KEYS.CHECKLISTS);
  if (!saved) {
    // Return default checklists if none exist
    return getDefaultChecklists();
  }
  return saved;
}

export function saveChecklists(checklists) {
  return saveData(STORAGE_KEYS.CHECKLISTS, checklists);
}

export function toggleChecklistItem(checklistType, itemId) {
  const checklists = loadChecklists();
  const item = checklists[checklistType].items.find(i => i.id === itemId);
  if (item) {
    item.checked = !item.checked;
    saveChecklists(checklists);
  }
  return checklists;
}

export function addChecklistItem(checklistType, text) {
  const checklists = loadChecklists();
  const newId = Math.max(...checklists[checklistType].items.map(i => i.id), 0) + 1;
  const newItem = {
    id: newId,
    text: text,
    checked: false
  };
  checklists[checklistType].items.push(newItem);
  saveChecklists(checklists);
  return newItem;
}

export function deleteChecklistItem(checklistType, itemId) {
  const checklists = loadChecklists();
  checklists[checklistType].items = checklists[checklistType].items.filter(i => i.id !== itemId);
  saveChecklists(checklists);
  return checklists;
}

// Clear all data (for testing or reset)
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    deleteData(key);
  });
}

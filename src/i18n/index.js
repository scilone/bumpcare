// Internationalization (i18n) system
import fr from './fr.js';
import en from './en.js';
import es from './es.js';
import it from './it.js';
import de from './de.js';

// Available translations
const translations = {
  fr,
  en,
  es,
  it,
  de
};

// Available languages with their labels
export const availableLanguages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' }
];

// Current language (default to French)
let currentLanguage = 'fr';

/**
 * Get the current language
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * Set the current language
 */
export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    // Save to localStorage
    localStorage.setItem('bumpcare-language', lang);
    return true;
  }
  return false;
}

/**
 * Load saved language preference from localStorage
 */
export function loadLanguagePreference() {
  const saved = localStorage.getItem('bumpcare-language');
  if (saved && translations[saved]) {
    currentLanguage = saved;
    return saved;
  }
  
  // Try to detect browser language
  const browserLang = navigator.language.split('-')[0];
  if (translations[browserLang]) {
    currentLanguage = browserLang;
    return browserLang;
  }
  
  return currentLanguage;
}

/**
 * Get a translated string
 * @param {string} key - Translation key
 * @param {object} params - Optional parameters for string interpolation
 */
export function t(key, params = {}) {
  const translation = translations[currentLanguage];
  let text = translation[key] || key;
  
  // Replace parameters in the text
  if (typeof text === 'string') {
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
  }
  
  return text;
}

/**
 * Get the current translation object
 */
export function getTranslations() {
  return translations[currentLanguage];
}

/**
 * Get a specific array from translations (like tips or checklist items)
 */
export function getTranslationArray(key) {
  const translation = translations[currentLanguage];
  return translation[key] || [];
}

/**
 * Format date according to current language
 */
export function formatDate(date, options = {}) {
  const locales = {
    fr: 'fr-FR',
    en: 'en-US',
    es: 'es-ES',
    it: 'it-IT',
    de: 'de-DE'
  };
  
  const locale = locales[currentLanguage] || 'fr-FR';
  return new Date(date).toLocaleDateString(locale, options);
}

/**
 * Format date with time according to current language
 */
export function formatDateTime(date, options = {}) {
  const locales = {
    fr: 'fr-FR',
    en: 'en-US',
    es: 'es-ES',
    it: 'it-IT',
    de: 'de-DE'
  };
  
  const locale = locales[currentLanguage] || 'fr-FR';
  return new Date(date).toLocaleString(locale, options);
}

// Initialize on load
loadLanguagePreference();

// Daily tips for pregnant women

import { getTranslationArray } from './i18n/index.js';

export function getRandomTip() {
  const tips = getTranslationArray('tips');
  const index = Math.floor(Math.random() * tips.length);
  return tips[index] || "Take care of yourself during this special time.";
}

export function getDailyTip() {
  // Use date to get consistent tip for the day
  const tips = getTranslationArray('tips');
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % tips.length;
  return tips[index] || "Take care of yourself during this special time.";
}

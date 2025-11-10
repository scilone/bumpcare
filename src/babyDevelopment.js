// Baby development information by pregnancy week
// Information organized by week with key development milestones

import { getTranslationArray } from './i18n/index.js';

export function getBabyDevelopment(week) {
  const developments = getTranslationArray('babyDevelopmentByWeek');
  return developments[week - 1] || developments[0] || "Baby continues developing.";
}

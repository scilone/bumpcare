// Daily tips for pregnant women

export const pregnancyTips = [
  "Buvez au moins 8 verres d'eau par jour pour rester bien hydratée.",
  "Prenez le temps de vous reposer quand votre corps vous le demande.",
  "Faites des exercices doux comme la marche ou le yoga prénatal.",
  "Mangez de petits repas fréquents pour éviter les nausées.",
  "Notez vos questions pour ne rien oublier lors de vos rendez-vous.",
  "Écoutez de la musique relaxante pour réduire le stress.",
  "Partagez vos émotions avec votre partenaire ou un proche.",
  "Évitez les aliments crus ou mal cuits pour votre sécurité.",
  "Dormez sur le côté gauche pour améliorer la circulation.",
  "Prenez vos vitamines prénatales chaque jour.",
  "Pratiquez la respiration profonde pour vous détendre.",
  "Lisez des livres sur la grossesse et la parentalité.",
  "Préparez votre sac pour la maternité à l'avance.",
  "Prenez des photos de votre ventre pour garder des souvenirs.",
  "Connectez-vous avec d'autres futures mamans.",
  "Prenez soin de votre peau avec des crèmes hydratantes.",
  "Évitez le stress autant que possible.",
  "Faites des étirements doux pour soulager les tensions.",
  "Planifiez des moments de détente dans votre journée.",
  "Gardez des collations saines à portée de main.",
  "Portez des vêtements confortables et amples.",
  "Profitez de ce moment unique de votre vie.",
  "N'hésitez pas à demander de l'aide quand vous en avez besoin.",
  "Célébrez chaque étape de votre grossesse.",
  "Écoutez votre intuition, vous connaissez votre corps."
];

export function getRandomTip() {
  const index = Math.floor(Math.random() * pregnancyTips.length);
  return pregnancyTips[index];
}

export function getDailyTip() {
  // Use date to get consistent tip for the day
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % pregnancyTips.length;
  return pregnancyTips[index];
}

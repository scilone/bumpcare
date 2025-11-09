// Baby development information by pregnancy week
// Information organized by week with key development milestones

export const babyDevelopmentByWeek = {
  1: "Début de la grossesse. La fécondation peut avoir lieu cette semaine.",
  2: "L'ovule fécondé se divise et commence son voyage vers l'utérus.",
  3: "L'embryon s'implante dans la paroi utérine. Vos hormones de grossesse commencent à augmenter.",
  4: "L'embryon mesure environ 2mm. Le cœur commence à se former.",
  5: "Le cœur de bébé commence à battre ! Les premiers organes se développent.",
  6: "Le tube neural se ferme. Les bourgeons des bras et des jambes apparaissent.",
  7: "Bébé mesure environ 1 cm. Le cerveau se développe rapidement.",
  8: "Les doigts et les orteils commencent à se former. Bébé bouge déjà !",
  9: "Tous les organes essentiels sont en place. Bébé mesure environ 2,3 cm.",
  10: "Bébé entre dans la période fœtale. Ses organes vitaux sont formés.",
  11: "Les os commencent à durcir. Le visage prend forme.",
  12: "Les ongles apparaissent. Bébé peut ouvrir et fermer ses poings.",
  13: "Fin du 1er trimestre ! Les empreintes digitales se forment.",
  14: "Début du 2e trimestre. Bébé mesure environ 9 cm et pèse 43g.",
  15: "Le squelette continue de se développer. Bébé peut sucer son pouce !",
  16: "Les yeux bougent. Bébé peut entendre vos sons internes.",
  17: "Le système circulatoire est opérationnel. Bébé pèse environ 140g.",
  18: "Vous pourriez sentir les premiers mouvements de bébé.",
  19: "Le vernix caseosa (enduit protecteur) se forme sur la peau.",
  20: "Mi-grossesse ! Bébé mesure environ 25 cm de la tête aux pieds.",
  21: "Les mouvements de bébé deviennent plus forts et plus réguliers.",
  22: "Les sourcils et les cils sont visibles. Bébé pèse environ 430g.",
  23: "L'ouïe de bébé se développe. Il peut entendre votre voix !",
  24: "Les poumons se développent. Bébé mesure environ 30 cm.",
  25: "Bébé réagit aux sons et à la lumière. Il pèse environ 660g.",
  26: "Les yeux commencent à s'ouvrir. Fin du 2e trimestre proche.",
  27: "Début du 3e trimestre. Les poumons continuent leur développement.",
  28: "Bébé peut ouvrir et fermer les yeux. Il rêve peut-être déjà !",
  29: "Le cerveau se développe rapidement. Bébé grossit vite.",
  30: "Bébé mesure environ 39 cm et pèse 1,3 kg.",
  31: "Les cinq sens sont maintenant fonctionnels.",
  32: "Le système digestif est presque mature. Bébé pèse environ 1,7 kg.",
  33: "Les os durcissent mais le crâne reste flexible pour l'accouchement.",
  34: "Le vernix s'épaissit. Bébé se prépare à la vie à l'extérieur.",
  35: "Les reins sont complètement développés. Bébé pèse environ 2,4 kg.",
  36: "Bébé continue de prendre du poids. Il mesure environ 47 cm.",
  37: "Bébé est considéré à terme ! Il peut naître à tout moment.",
  38: "Les poumons sont maintenant matures. Bébé pèse environ 3 kg.",
  39: "Bébé a moins de place pour bouger. Il se positionne pour la naissance.",
  40: "Date prévue d'accouchement ! Bébé est prêt à rencontrer le monde.",
  41: "Grossesse prolongée. Bébé continue de grandir.",
  42: "Votre médecin pourrait proposer de déclencher l'accouchement."
};

export function getBabyDevelopment(week) {
  return babyDevelopmentByWeek[week] || "Bébé continue son développement.";
}

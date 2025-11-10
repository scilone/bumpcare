# 🤰 BumpCare - Application de Suivi de Grossesse

BumpCare est une Progressive Web App (PWA) conçue pour accompagner les femmes enceintes tout au long de leur grossesse. L'application fonctionne entièrement hors ligne et stocke toutes les données localement sur votre appareil.

## ✨ Fonctionnalités

- **Suivi de grossesse** : Calcul automatique de la semaine de grossesse et du nombre de jours restants
- **Notes personnelles** : Conservez vos pensées, symptômes et questions
- **Gestion des rendez-vous** : Planifiez et suivez vos rendez-vous médicaux
- **Rappels de rendez-vous** : Recevez des notifications 24h et 1h avant vos rendez-vous
- **Listes de préparation** : Checklists pour la maternité et l'arrivée de bébé à la maison
- **Suivi du poids** : Enregistrez votre évolution de poids
- **Conseils quotidiens** : Recevez des conseils adaptés chaque jour
- **Fonctionnement hors ligne** : Toutes les fonctionnalités sont disponibles sans connexion Internet
- **Installation** : Installez l'application sur votre téléphone comme une app native
- **Données locales** : Toutes vos données restent privées sur votre appareil

## 🚀 Installation et Utilisation

### Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn

### Installation pour le développement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Ouvrir dans le navigateur
# L'application sera disponible sur http://localhost:5173
```

### Build pour la production

```bash
# Créer le build de production
npm run build

# Prévisualiser le build de production
npm run preview
```

### Installation comme PWA

1. Ouvrez l'application dans votre navigateur (Chrome, Edge, Safari)
2. Recherchez l'option "Installer l'application" ou "Ajouter à l'écran d'accueil"
3. Suivez les instructions pour installer BumpCare sur votre appareil

## 📱 Compatibilité

- **Mobile** : Optimisé pour iOS et Android
- **Desktop** : Compatible avec Chrome, Edge, Firefox, Safari
- **PWA** : Installable sur tous les appareils supportant les PWA
- **Hors ligne** : Fonctionne sans connexion Internet

## 🔒 Confidentialité et Sécurité

- **Stockage local** : Toutes les données sont stockées dans le `localStorage` de votre navigateur
- **Aucune base de données externe** : Pas de serveur, pas de synchronisation cloud
- **Confidentialité totale** : Vos données ne quittent jamais votre appareil
- **Aucun tracking** : Aucune analytique, aucun suivi

## 🛠️ Technologies Utilisées

- **Vite** : Build tool moderne et rapide
- **Vanilla JavaScript** : Pas de framework lourd, application légère
- **PWA** : Progressive Web App avec service worker
- **LocalStorage** : Stockage local des données
- **CSS moderne** : Design responsive mobile-first

## 🔄 Migration vers App Native

L'application est structurée pour faciliter la migration vers une application mobile native :

- Code JavaScript modulaire et réutilisable
- Séparation claire entre logique et interface
- Stockage de données structuré
- Architecture compatible avec Capacitor ou React Native

### Options de migration recommandées :

1. **Capacitor** : Wrapper l'application web existante
2. **React Native** : Réutiliser la logique métier
3. **Flutter** : Adapter l'architecture de données

## 📂 Structure du Projet

```
bumpcare/
├── public/              # Fichiers statiques et icônes PWA
│   ├── favicon.svg
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── apple-touch-icon.png
├── src/                 # Code source
│   ├── main.js         # Point d'entrée principal
│   ├── storage.js      # Gestion du localStorage
│   ├── pregnancy.js    # Calculs liés à la grossesse
│   ├── tips.js         # Conseils quotidiens
│   └── style.css       # Styles CSS
├── index.html          # Page HTML principale
├── vite.config.js      # Configuration Vite et PWA
└── package.json        # Dépendances du projet
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

ISC


## 💬 Support

Pour toute question ou suggestion, ouvrez une issue sur GitHub.

---

Fait avec ❤️ pour toutes les futures mamans

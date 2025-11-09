# 🚀 Guide de Déploiement - BumpCare PWA

Ce guide explique comment déployer BumpCare sur différentes plateformes d'hébergement.

## Option 1: Netlify (Recommandé)

### Déploiement automatique via Git

1. Créez un compte sur [Netlify](https://www.netlify.com/)
2. Cliquez sur "New site from Git"
3. Connectez votre repository GitHub
4. Configurez les paramètres de build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18 ou supérieur
5. Cliquez sur "Deploy site"

### Déploiement manuel via CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Build le projet
npm run build

# Se connecter à Netlify
netlify login

# Déployer
netlify deploy --prod --dir=dist
```

**Avantages**: 
- HTTPS automatique
- CDN global
- Déploiements automatiques
- Gratuit pour usage personnel

---

## Option 2: Vercel

1. Créez un compte sur [Vercel](https://vercel.com/)
2. Cliquez sur "Import Project"
3. Importez votre repository GitHub
4. Vercel détectera automatiquement Vite
5. Cliquez sur "Deploy"

**Configuration automatique**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

---

## Option 3: GitHub Pages

1. Modifiez `vite.config.js` pour ajouter la base URL:

```javascript
export default defineConfig({
  base: '/bumpcare/', // Remplacez par le nom de votre repo
  plugins: [
    // ... rest of config
  ]
});
```

2. Ajoutez un script de déploiement dans `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. Installez gh-pages:

```bash
npm install --save-dev gh-pages
```

4. Déployez:

```bash
npm run deploy
```

5. Activez GitHub Pages dans les paramètres du repository:
   - Settings → Pages → Source: gh-pages branch

---

## Option 4: Firebase Hosting

1. Installez Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Initialisez Firebase:

```bash
firebase login
firebase init hosting
```

3. Configuration:
   - Public directory: `dist`
   - Single-page app: `No`
   - Automatic builds: `No`

4. Déployez:

```bash
npm run build
firebase deploy
```

---

## Option 5: Serveur Personnalisé

### Avec Node.js et Express

Créez un fichier `server.js`:

```javascript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`BumpCare running on http://localhost:${PORT}`);
});
```

Installez Express:

```bash
npm install express
```

Ajoutez un script dans `package.json`:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

Déployez sur votre serveur:

```bash
npm run build
node server.js
```

---

## Configuration Post-Déploiement

### 1. Vérifier le HTTPS

Les PWA nécessitent HTTPS en production. Assurez-vous que votre site est servi en HTTPS.

### 2. Tester l'installation PWA

1. Ouvrez votre site sur mobile
2. Le navigateur devrait proposer "Ajouter à l'écran d'accueil"
3. Installez et testez l'application

### 3. Tester le mode hors ligne

1. Ouvrez l'application
2. Activez le mode avion
3. Vérifiez que l'application fonctionne toujours

### 4. Lighthouse Audit

Exécutez un audit Lighthouse dans Chrome DevTools:

```bash
# Ou via CLI
npm install -g lighthouse
lighthouse https://votre-site.com --view
```

Visez des scores élevés dans:
- Performance: > 90
- PWA: 100
- Accessibility: > 90
- Best Practices: > 90

---

## Variables d'Environnement

Aucune variable d'environnement n'est requise pour BumpCare car tout est côté client.

Si vous ajoutez des fonctionnalités futures nécessitant des clés API:

1. Créez un fichier `.env`:

```env
VITE_API_KEY=votre_clé_ici
```

2. Accédez-y dans le code:

```javascript
const apiKey = import.meta.env.VITE_API_KEY;
```

3. Ajoutez `.env` au `.gitignore` (déjà fait)

---

## Monitoring et Analytics (Optionnel)

Si vous souhaitez ajouter de l'analytique **tout en respectant la vie privée**:

### Option: Plausible Analytics (Privacy-friendly)

```html
<!-- Dans index.html, avant </head> -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

**Note**: Évitez Google Analytics pour respecter la vie privée des utilisatrices.

---

## Dépannage

### PWA ne s'installe pas

- ✅ Vérifiez que le site est en HTTPS
- ✅ Vérifiez que `manifest.webmanifest` est accessible
- ✅ Vérifiez que le service worker est enregistré (DevTools → Application)
- ✅ Vérifiez les icônes (192x192 et 512x512 requises)

### Mode hors ligne ne fonctionne pas

- ✅ Vérifiez que le service worker est activé
- ✅ Videz le cache et rechargez
- ✅ Vérifiez la console pour les erreurs

### Données perdues

- ✅ localStorage peut être effacé par le navigateur si l'espace est limité
- ✅ Ajoutez une fonctionnalité d'export/import pour backup
- ✅ Considérez IndexedDB pour plus de robustesse

---

## Performance Tips

1. **Préchargement des polices**: Déjà optimisé (system fonts)
2. **Lazy loading**: Images déjà optimisées (SVG et emoji)
3. **Code splitting**: Vite le fait automatiquement
4. **Compression**: Activez gzip sur votre serveur

---

## Support Multi-Plateformes

L'application fonctionne sur:

- ✅ iOS Safari 14+
- ✅ Android Chrome 80+
- ✅ Desktop Chrome/Edge 80+
- ✅ Desktop Firefox 75+
- ✅ Desktop Safari 14+

---

## Contact et Support

Pour toute question sur le déploiement, ouvrez une issue sur GitHub.

---

**Bonne chance avec votre déploiement! 🚀**

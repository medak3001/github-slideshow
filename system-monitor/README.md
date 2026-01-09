# 🚀 System Monitor - Interface Futuriste

Application de monitoring système en temps réel avec une interface utilisateur futuriste. Surveille tous les composants de l'ordinateur et affiche des visualisations détaillées de l'utilisation des ressources.

## ✨ Fonctionnalités

### 📊 Monitoring en Temps Réel

- **CPU**
  - Charge totale, utilisateur et système
  - Température du processeur
  - Fréquence actuelle
  - Charge par cœur/thread individuel
  - Informations détaillées (marque, nombre de cœurs, etc.)

- **Mémoire RAM**
  - Utilisation totale avec visualisation circulaire
  - Mémoire utilisée, libre et active
  - Swap utilisé et disponible
  - Pourcentage d'utilisation en temps réel

- **Disques**
  - Liste de tous les disques montés
  - Espace utilisé et disponible
  - Type de système de fichiers
  - Barres de progression visuelles

- **I/O Disque**
  - Vitesse de lecture en temps réel
  - Vitesse d'écriture en temps réel
  - I/O total par seconde

- **Réseau**
  - Vitesse de téléchargement/upload
  - Statistiques par interface réseau
  - Total des données transférées
  - État des interfaces (up/down)

- **Processus**
  - Nombre total de processus
  - Processus en cours, en veille, bloqués
  - Top 10 des processus par utilisation CPU
  - Utilisation CPU et mémoire par processus

- **GPU** (si disponible)
  - Modèle et fabricant
  - VRAM disponible
  - Température

- **Batterie** (pour portables)
  - Pourcentage de charge
  - État (charge/décharge)
  - Temps restant estimé

### 🎨 Interface Futuriste

- Design cyberpunk avec effets de lumière néon
- Animations fluides et transitions
- Scanner animé en arrière-plan
- Barres de progression avec effets de lueur
- Visualisations circulaires pour la mémoire
- Grille responsive pour tous les écrans
- Thème sombre optimisé pour les longues sessions

## 🔧 Installation

### Prérequis

- Node.js (version 14 ou supérieure)
- npm ou yarn

### Étapes d'installation

1. **Cloner ou naviguer vers le répertoire**
   ```bash
   cd system-monitor
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

## 🚀 Utilisation

### Démarrer le serveur

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000` par défaut.

### Mode développement (avec rechargement automatique)

```bash
npm run dev
```

### Accéder à l'interface

1. Ouvrez votre navigateur
2. Naviguez vers `http://localhost:3000`
3. L'interface se connecte automatiquement via WebSocket
4. Les données sont mises à jour toutes les secondes

## 🌐 Configuration

### Changer le port

Utilisez la variable d'environnement `PORT` :

```bash
PORT=8080 npm start
```

### Modifier la fréquence de mise à jour

Dans `server.js`, ligne 142, changez l'intervalle (en millisecondes) :

```javascript
const interval = setInterval(async () => {
  // ...
}, 1000); // 1000ms = 1 seconde
```

## 📦 Structure du Projet

```
system-monitor/
├── server.js                 # Serveur Node.js avec WebSocket
├── package.json              # Dépendances et scripts
├── public/
│   ├── index.html           # Interface utilisateur
│   ├── style.css            # Styles futuristes
│   └── app.js               # Logique client et WebSocket
└── README.md                # Documentation
```

## 🛠️ Technologies Utilisées

- **Backend**
  - Node.js
  - Express.js - Serveur web
  - ws - WebSocket pour communication temps réel
  - systeminformation - Collecte d'informations système

- **Frontend**
  - HTML5
  - CSS3 (animations, gradients, flexbox, grid)
  - JavaScript (ES6+)
  - WebSocket API

## 📊 Informations Système Collectées

L'application utilise le module `systeminformation` pour collecter :

- Informations CPU (marque, cœurs, fréquence, charge)
- Température CPU
- Mémoire (RAM, swap)
- Disques (taille, utilisation, type)
- I/O disque (lecture/écriture)
- Interfaces réseau (vitesse, données transférées)
- Processus en cours d'exécution
- Informations GPU
- Batterie (pour ordinateurs portables)
- Informations OS et système

## 🎯 Cas d'Utilisation

- **Développeurs** : Surveiller les ressources lors du développement
- **Administrateurs système** : Monitoring visuel des serveurs
- **Gamers** : Surveiller les performances pendant le jeu
- **Overclockers** : Observer températures et fréquences
- **Éducation** : Apprendre le fonctionnement des systèmes
- **Démos** : Interface impressionnante pour présentations

## ⚡ Performances

- Mise à jour toutes les secondes
- Faible impact sur les ressources système
- WebSocket pour communication efficace
- Interface optimisée avec animations CSS

## 🔒 Sécurité

- Lecture seule des informations système
- Pas de modifications du système
- Communication WebSocket locale
- Pas d'envoi de données externes

## 🐛 Dépannage

### Le serveur ne démarre pas
- Vérifiez que Node.js est installé : `node --version`
- Vérifiez que les dépendances sont installées : `npm install`
- Vérifiez que le port 3000 est disponible

### Pas de données affichées
- Vérifiez la console du navigateur (F12)
- Vérifiez que le WebSocket est connecté (indicateur "CONNECTED")
- Certaines informations peuvent ne pas être disponibles sur tous les OS

### Données manquantes sur certains OS
- La température CPU peut ne pas être disponible sur tous les systèmes
- Les informations GPU dépendent des pilotes installés
- Certaines métriques sont spécifiques à Linux/Windows/macOS

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer la documentation
- Optimiser les performances

## 📝 Licence

MIT License - Libre d'utilisation et de modification

## 🎨 Personnalisation

### Changer les couleurs

Dans `public/style.css`, modifiez les variables CSS :

```css
:root {
    --primary: #00ff9d;      /* Couleur principale (vert) */
    --secondary: #00d4ff;    /* Couleur secondaire (bleu) */
    --accent: #ff006e;       /* Couleur accent (rose) */
    /* ... */
}
```

### Ajouter de nouvelles métriques

1. Ajoutez la collecte dans `server.js`
2. Créez l'élément HTML dans `public/index.html`
3. Ajoutez le style dans `public/style.css`
4. Mettez à jour les données dans `public/app.js`

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation de [systeminformation](https://github.com/sebhildebrandt/systeminformation)

---

**Développé avec ❤️ pour le monitoring système en temps réel**

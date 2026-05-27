# 🎬 BrokHomeTV

> **Plateforme de Visionnage Synchrone / Synchronous Watch-Party Platform**
> 
> *Regardez vos films et séries locaux synchronisés avec vos amis, sans aucune charge serveur.*
> *Stream your local movies and shows in perfect sync with friends, with zero server load.*

---

## 🌍 Langue / Language
- [🇫🇷 Version Française](#-version-française)
- [🇬🇧 English Version](#-english-version)

---

## 🇫🇷 Version Française

Bienvenue sur **BrokHomeTV**, une plateforme d'auto-hébergement et de visionnage partagé (style *SyncTube*), inspirée de l'interface et de l'expérience utilisateur de Netflix. 
Conçue pour être ultra-légère, rapide et stable, elle permet de diffuser vos fichiers vidéo locaux (.mp4, .mkv, .webm) de manière parfaitement synchronisée entre tous vos amis, associée à un chat interactif en temps réel et un système de gestion des rôles.

---

### 🚀 Éléments Clés & Architecture du Système

#### ⚡ 1. Le "Direct Play" (Lecture Directe) : Soulager le Serveur
Contrairement à des solutions lourdes (comme Plex ou Jellyfin) qui sollicitent énormément le processeur pour transcoder les vidéos en temps réel, BrokHomeTV utilise une architecture en **Lecture Directe (Direct Play)** :
* **Décodage Client :** C'est le navigateur web ou l'appareil de l'utilisateur qui effectue tout le travail de décodage matériel.
* **Serveur Léger :** Le serveur Node.js se contente de lire et d'envoyer le flux vidéo brut sans conversion.
* **Résultat :** Une utilisation du processeur (CPU) proche de 0% sur votre NAS ou votre machine d'hébergement. Cela permet à des configurations modestes (comme le processeur Realtek du NAS Ugreen DH2300) d'accueillir de nombreux spectateurs simultanément !

#### 🛠️ 2. Fonctionnalités Majeures
* **Lecteur Vidéo Synchrone Ultra-Stabilisé :** Contrôles partagés (Lecture, Pause, Navigation dans la chronologie) répercutés instantanément chez tous les participants du salon via des WebSockets robustes.
* **Micro-Animations Premium :** Interface dynamique et réactive, carrousels de prévisualisation au survol et chat adaptatif.
* **Gestion des Rôles Avancée :**
  * **Administrateur :** (Le tout premier compte inscrit sur la plateforme obtient ce rôle automatiquement). Contrôle total sur la bibliothèque, les chemins de stockage, les paramètres Discord et les exclusions de membres.
  * **Premium / Membre :** Accès aux dossiers de films restreints et aux salons privés.
  * **Invité (Guest) :** Mode spectateur rapide sans compte persistant, avec nettoyage automatique de leur session après 1 heure d'inactivité.
* **Console d'Administration Complète :** Gestion à chaud des répertoires de stockage, indexation forcée de la bibliothèque, configuration du bot Discord et logs en direct.

---

## 🐳 Guide d'Installation sur NAS Ugreen (UGOS) via Docker Compose

Les NAS Ugreen intègrent le système d'exploitation **UGOS** dont le gestionnaire d'applications intègre nativement la gestion de projets Docker Compose.

### 📁 1. Préparation des Dossiers sur le NAS
Avant de lancer le projet, créez l'arborescence suivante à l'aide de l'application **Fichiers** de votre NAS Ugreen :

1. **Volume Système (Volume 1) :**
   * Accédez au répertoire partagé contenant vos conteneurs Docker (ex : `/volume1/docker`).
   * Créez un dossier appelé `brokhome` puis un sous-dossier `site`. C'est là que vous placerez le code de votre application.
2. **Volume de Stockage (Volume 2) :**
   * Accédez à votre gros disque de stockage (Volume 2), créez-y un dossier partagé officiel nommé `Medias`.
   * C'est dans ce dossier `Medias` que vous organiserez vos dossiers de vidéos (ex : `Films`, `Séries`).

---

### 📝 2. Configuration du Fichier Proxy (`vite.config.ts`)
Dans un environnement Docker sous Linux, l'utilisation de `localhost` dans la configuration de proxy de Vite peut déclencher une erreur de refus de connexion (`ECONNREFUSED ::1:3001`) car le système tente de résoudre le chemin via l'IPv6 locale du conteneur.

Pour corriger cela, modifiez votre fichier `vite.config.ts` se trouvant à la racine du projet pour forcer l'usage de l'IPv4 locale (`127.0.0.1`) :

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: '0.0.0.0',
    allowedHosts: [
      'watch.brokhome.fr', // Remplacez par votre nom de domaine
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      '/api': 'http://127.0.0.1:3001',
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        ws: true
      },
      '/video': 'http://127.0.0.1:3001'
    }
  }
});
```

---

### 🛠️ 3. Le script Docker Compose (`docker-compose.yml`)
Ouvrez l'application **Container (Docker)** sur le bureau d'UGOS, rendez-vous dans la section **Projet**, cliquez sur **Créer un Projet**, puis collez-y le script YAML ci-dessous. 

> 🔔 **Remarque :** Ce fichier configure à la fois l'application Node et un conteneur Cloudflare Tunnel pour rendre votre serveur accessible hors de chez vous en toute sécurité et gratuitement !

```yaml
version: '3.8'

services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared-tunnel
    restart: unless-stopped
    command: tunnel --no-autoupdate run --token <VOTRE_TOKEN_CLOUDFLARE_ICI>
    networks:
      - broknot

  site:
    image: node:18-alpine
    container_name: brokhome-site
    restart: unless-stopped
    working_dir: /app
    volumes:
      # Montage de la racine de l'application
      - /volume1/docker/brokhome/site:/app
      # Montage de votre dossier de vidéos (Volume 2 d'Ugreen)
      - /volume2/Medias:/app/medias
    command: sh -c "npm install && npm run dev:all"
    ports:
      - "3001:3001" # Port API / Sockets
      - "8080:8080" # Port d'interface utilisateur (Vite)
    networks:
      - broknot

networks:
  broknot:
    driver: bridge
```

---

### 📂 4. Configuration des Chemins de Scan (`server.js`)
Pour changer ou ajouter d'autres répertoires de stockage (comme vos disques locaux ou des dossiers spécifiques), vous pouvez le faire directement depuis l'**Interface d'Administration** dans l'onglet **Stockage**, ou modifier à chaud les chemins dans le tableau `mediaPaths` / `videoPaths` de votre fichier `server.js` ou dans votre base de données `db.json` :

```javascript
const mediaPaths = [
    { path: "/app/medias", isPremium: false }
];
```

---

## 🌐 Rendre le site accessible à l'extérieur gratuitement avec Cloudflare
Pour donner l'accès à vos amis sans avoir besoin d'ouvrir de ports sur votre box internet (pas de redirections de ports, aucun risque de sécurité sur votre réseau domestique), nous utilisons un **Cloudflare Tunnel (Zero Trust)** :

1. Enregistrez un nom de domaine (ou liez-en un existant, ex : `brokhome.fr`) sur votre compte gratuit Cloudflare.
2. Allez dans l'onglet **Zero Trust** ➡️ **Access** ➡️ **Tunnels**.
3. Créez un nouveau tunnel, sélectionnez le déploiement **Docker** et copiez le jeton d'accès généré (**Token**).
4. Remplacez `<VOTRE_TOKEN_CLOUDFLARE_ICI>` dans votre fichier `docker-compose.yml` par le vôtre.
5. Dans l'onglet **Public Hostname** de la configuration de votre tunnel sur l'interface de Cloudflare, ajoutez une adresse de routage :
   * **Subdomain :** `watch`
   * **Domain :** `brokhome.fr`
   * **Type :** `HTTP`
   * **URL :** `brokhome-site:8080` *(Le trafic réseau sera directement redirigé vers le conteneur Vite sur le réseau Docker).*
6. Lancez votre projet sur le NAS. L'application est instantanément accessible dans le monde entier en HTTPS sécurisé !

---

## 💻 Guide d'Installation sur Machine Locale (Pour Test ou PC Principal)
Idéal pour essayer l'application ou travailler sur son code en local avant de déployer sur votre NAS.

### Lancement Classique (Sans Docker)
#### Prérequis :
* **Node.js** v18 ou version supérieure installé.

1. Ouvrez votre terminal à la racine du dossier projet et installez les paquets requis :
   ```bash
   npm install
   ```
2. Modifiez si besoin les chemins de films de votre bibliothèque directement depuis la **Console d'Administration** (recommandé), ou configurez-les dans votre base de données locale (`db.json`) pour pointer vers vos disques Windows locaux (ex : `D:\MesFilms` sous Windows).
3. Démarrez le frontend et le backend en même temps :
   ```bash
   npm run dev:all
   ```
4. Ouvrez votre navigateur internet sur `http://localhost:8080`.

---

## 🛠️ Résolution des Problèmes Courants (Troubleshooting)

### 1. Erreur `ENOTEMPTY` ou échec de `npm install` au démarrage de Docker
* **Cause :** Des dossiers de cache ou fragments créés sous Windows lors du développement entrent en conflit avec les permissions strictes de l'environnement Linux Alpine du conteneur.
* **Solution :** Arrêtez le projet Docker. Via l'explorateur de fichiers de votre NAS, rendez-vous à la racine de votre projet et supprimez manuellement le dossier `node_modules` et le fichier `package-lock.json`. Relancez le projet.

### 2. Écran noir ou chargement illimité au lancement de certaines vidéos
* **Cause :** Ne faisant aucun réencodage côté serveur afin d'économiser l'intégralité de votre processeur (Direct Play), le lecteur vidéo du navigateur client ne peut lire que des formats reconnus en natif par son moteur de rendu web.
* **Solution :** Pour s'assurer d'une lisibilité universelle (tablettes, smartphones, ordinateurs et liaisons 4G/5G), structurez votre bibliothèque en encodant vos vidéos au format **H.264 (x264)** dans un conteneur **.mp4** associé à une bande sonore au format **AAC Stereo**. Évitez les pistes audio propriétaires lourdes (ex : DTS-HD, TrueHD).

---

## ☕ Soutien au Projet
Si vous appréciez mon travail, si vous souhaitez soutenir le projet ou m'offrir un café :
* **PayPal :** [paypal.me/Taidana972](https://paypal.me/Taidana972)
* **Twitch :** Venez me saluer de temps en temps en live sur [twitch.tv/brok_n_one](https://twitch.tv/brok_n_one) !

---

## 🌐 Système d'Internationalisation (i18n) Géré par le Code
BrokHomeTV prend en charge un système complet de traduction couvrant 12 langues majeures : **Français (FR), Anglais (EN), Espagnol (ES), Italien (IT), Allemand (DE), Portugais (PT), Néerlandais (NL), Polonais (PL), Turc (TR), Arabe (AR), Japonais (JA) et Coréen (KO)**.

Pour conserver une interface épurée, semblable à celle de Netflix, aucun élément visuel (bouton, drapeau ou sélecteur) n'encombre l'écran. Tout est géré directement à la racine du projet.

### ⚙️ Comment changer la langue de la plateforme
Ouvrez le fichier `/locales.ts` à la racine de votre application et modifiez la variable globale de configuration supérieure `CURRENT_LANG` :

```typescript
// /locales.ts -> Ligne 11
export const CURRENT_LANG: keyof typeof dictionary = 'FR'; // Remplacez par 'EN', 'ES', 'JA', etc.
```

Dès que vous modifiez ce code, l'ensemble de la plateforme (interface d'accueil, connexion, médiathèque, player, chat, rôles) s'actualise instantanément dans la langue sélectionnée pour tous vos utilisateurs.

### 💻 Utilisation dans vos composants React (Développeurs)
Pour ajouter de nouvelles clés ou traduire un composant, importez simplement le hook dynamique `useTranslation` de la façon suivante :

```tsx
import { useTranslation } from '../useTranslation';

export const MonComposant = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t.global.welcome}</h2>
      <button>{t.global.logout}</button>
    </div>
  );
};
```
Tous les dictionnaires complets des 12 langues sont rangés de façon structurée et typée dans `/locales.ts`.

---
---

## 🇬🇧 English Version

Welcome to the official documentation for **BrokHomeTV**, a self-hosted synchronous watch-party platform (a private "SyncTube"), heavily inspired by the Netflix user interface.
Designed to be lightweight, fast, and highly responsive, it lets you stream local video files (.mp4, .mkv, .webm) perfectly synced across multiple users with real-time chat and an advanced role-management system.

---

### 🚀 System Architecture & Key Features

#### ⚡ 1. Direct Play: Offloading the Server
Unlike heavier software solutions (such as Plex or Jellyfin) that encode the video on the host machine using high CPU cycles, BrokHomeTV relies entirely on a **Direct Play** architecture:
* **Client-Side Decoding:** The user's web browser or device (the client) does all the decoding work, utilizing its own local hardware (CPU/GPU) to handle the video stream.
* **Light Router Server:** The Node.js backend acts as a raw file router, straight streaming raw files to the network interface without any CPU modifications.
* **Result:** Around 0% CPU utilization on your server system. Even low-tier hardware (like the Realtek CPU on the Ugreen DH2300 NAS) can host multiple simultaneous viewers without slowing down!

#### 🛠️ 2. Main Features
* **Ultra-Synced Video Player:** Playback state actions (Play/Pause, timeline scrubbing) are immediately replicated to all viewers in real-time via sturdy WebSockets.
* **Fluid Premium Animations:** Smooth, responsive navigation and neat visual layouts.
* **Industrial-Grade Role Management:**
  * **Administrator:** Granted to the first registered account automatically. Complete control over local file structures, scan paths, user lists, and Discord authorization settings.
  * **Premium / Member:** Allowed access to specific locked video folders and private rooms.
  * **Guest:** Instant watcher mode with automatic session cleanup after 1 hour of quiet inactivity.
* **Dynamic Control Board:** Dynamically edit index paths, force quick directory reload logs, handle security settings, and link Discord.

---

## 🐳 Deployment Guide via Docker Compose on Ugreen NAS (UGOS)

Ugreen NAS runs the **UGOS** operating system, which includes a graphical Docker Compose Project administrator out-of-the-box.

### 📁 1. Initial Folders Set Up on the NAS
Before initiating the Docker container, construct the following directory path architecture using the **Files** app of your Ugreen:

1. **On your System Drive (Volume 1) :**
   * Move inside your Docker apps root workspace (e.g., `/volume1/docker`).
   * Create a directory named `brokhome` and inside a subfolder named `site` (this is where your web application source code files go).
2. **On your Storage Drive (Volume 2) :**
   * Go inside your large media drive environment (Volume 2), and create a shared directory path folder labeled `Medias`.
   * Arrange your movie folders inside this `Medias` folder (ex: `Films`, `Series`).

---

### 📝 2. Vite Proxy Adjustment (`vite.config.ts`)
Within Linux containers bridges, configuring a Vite internal hot proxy referencing `localhost` might throw connectivity errors (`ECONNREFUSED ::1:3001`) because the setup attempts to route traffic inside isolated IPv6 interfaces.

To prevent this issue, edit the `vite.config.ts` file situated in the project root to force local IPv4 loopbacks (`127.0.0.1`):

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: '0.0.0.0',
    allowedHosts: [
      'watch.brokhome.fr', // Replace with your domain URL
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      '/api': 'http://127.0.0.1:3001',
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        ws: true
      },
      '/video': 'http://127.0.0.1:3001'
    }
  }
});
```

---

### 🛠️ 3. The Docker Compose file (`docker-compose.yml`)
Launch the **Container (Docker)** application in UGOS, head to **Project**, click **Create Project**, and input this compose template sequence:

```yaml
version: '3.8'

services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared-tunnel
    restart: unless-stopped
    command: tunnel --no-autoupdate run --token <YOUR_CLOUDFLARE_TOKEN_HERE>
    networks:
      - broknot

  site:
    image: node:18-alpine
    container_name: brokhome-site
    restart: unless-stopped
    working_dir: /app
    volumes:
      # Application source mapping
      - /volume1/docker/brokhome/site:/app
      # Video source volume mapping from Volume 2
      - /volume2/Medias:/app/medias
    command: sh -c "npm install && npm run dev:all"
    ports:
      - "3001:3001" # Sockets / API Port
      - "8080:8080" # Vite UI Port
    networks:
      - broknot

networks:
  broknot:
    driver: bridge
```

---

### 📂 4. Setting Media Paths in server backend (`server.js`)
To link your application scanner backend with directories mapped by Docker, register your volume path inside your bottom section in `server.js` or directly configure your custom directories using the **Admin Storage Settings** dashboard:

```javascript
const mediaPaths = [
    { path: "/app/medias", isPremium: false }
];
```

---

## 🌐 WAN Connection: Expose your Server safely with Cloudflare for Free
To share connection with close friends globally without modifying your home firewall ports or mapping dangerous tunnels:

1. Bring a domain address (either purchased or free, like `brokhome.fr`) inside your Cloudflare panel.
2. Direct onto the **Zero Trust** window ➡️ **Access** ➡️ **Tunnels**.
3. Launch a Tunnel, pick the **Docker** deploy card, and save the generated authentication **Token**.
4. Substitute `<YOUR_CLOUDFLARE_TOKEN_HERE>` in your `docker-compose.yml` file with your saved token.
5. In the tunnel configurations tab **Public Hostname**, insert your sub routing coordinates:
   * **Subdomain :** `watch`
   * **Domain :** `brokhome.fr`
   * **Type :** `HTTP`
   * **URL :** `brokhome-site:8080` *(Will direct external DNS requests Straight into Vite internal project container).*
6. Startup the project stack on your NAS! Your streaming services are securely linked in encrypted HTTPS worldwide.

---

## 💻 Local PC Installation (Evaluation, Diagnostics, or Local development)

### Node Standard Startup (No Docker)
#### Requirements:
* **Node.js** v18 or subsequent setup installed.

1. Open your terminal at the project root workspace and install standard requirements:
   ```bash
   npm install
   ```
2. Update local movie drive index values inside the `db.json` database files or from the **Administration** dashboard interface to represent local folder locations (ex: `D:\Movies` on Windows machines).
3. Start full system execution:
   ```bash
   npm run dev:all
   ```
4. Find UI access by entering `http://localhost:8080` in your web browser.

---

## 🛠️ Troubleshooting & Quick fixes

### 1. `ENOTEMPTY` locks or `npm install` fails during container startup
* **Root Cause:** Directory caches generated while active under Windows system hosts create permission locks with native Linux execution during mounts within Linux Alpine containers.
* **Fix:** Shut Compose projects down completely. Inside the File Manager on NAS, access your folder and erase `node_modules` folders along with `package-lock.json` databases, then relaunch Compose.

### 2. Black screens or endless spinner circles when starting files
* **Root Cause:** BrokHomeTV implements Direct Play routing for hardware speed savings, meaning files must rely entirely on browser native codec decoders.
* **Fix:** For unified playback setups everywhere, encode files into **H.264 (x264)** standards nested in **.mp4** wrapper files alongside **AAC Stereo** audio configurations. Avoid using proprietary multichannel formats (such as DTS-HD or TrueHD).

---

## ☕ Support the Project
If you enjoy my work, want to support the project or buy me a coffee:
* **PayPal:** [paypal.me/Taidana972](https://paypal.me/Taidana972)
* **Twitch:** Say hello live on stream over on [twitch.tv/brok_n_one](https://twitch.tv/brok_n_one) !

---

## 🌐 Code-Managed Internationalization System (i18n)
BrokHomeTV supports a global, fully-translated i18n system spanning 12 major languages: **French (FR), English (EN), Spanish (ES), Italian (IT), German (DE), Portuguese (PT), Dutch (NL), Polish (PL), Turkish (TR), Arabic (AR), Japanese (JA), and Korean (KO)**.

To stay true to Netflix's premium minimalist interface design, there are no visual buttons, flags, or dropdown selectors cluttering the viewport. Everything is controlled directly within the codebase.

### ⚙️ How to Switch the Platform Language
Open the `/locales.ts` file situated at the root of your application and update the global configuration variable `CURRENT_LANG` at the top:

```typescript
// /locales.ts -> Line 11
export const CURRENT_LANG: keyof typeof dictionary = 'EN'; // Replace with 'FR', 'ES', 'JA', etc.
```

Upon saving your changes, the entire platform (welcome view, login parameters, admin dashboard, video player, active socket rooms, chat labels, and role levels) instantly switches into chosen language.

### 💻 Usage inside React Components (For Developers)
To resolve localized strings or add new translation components, just import and call the dynamic `useTranslation` hook as shown below:

```tsx
import { useTranslation } from '../useTranslation';

export const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t.global.welcome}</h2>
      <button>{t.global.logout}</button>
    </div>
  );
};
```
All typed dictionary structures for the 12 major languages are stored cleanly within `/locales.ts`.

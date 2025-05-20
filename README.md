# ChatIRC - Client & Serveur IRC

Bienvenue sur **ChatIRC**, une application de messagerie instantanée inspirée du protocole IRC. Ce projet comprend un serveur en **NodeJS + ExpressJS** et un client en **ReactJS**, permettant une communication en temps réel via **Socket.IO**.

## 📌 Fonctionnalités principales
- Connexion simultanée à plusieurs canaux
- Création, suppression et gestion des canaux
- Persistance des messages et canaux via MongoDB
- Système de pseudo personnalisable
- Envoi de messages publics et privés
- Interface utilisateur moderne et intuitive

## 🚀 Installation et Exécution
### 1️⃣ Prérequis
- **Node.js** et **npm** installés
- **MongoDB Atlas** configuré

### 2️⃣ Installation des dépendances
```bash
# Cloner le projet
git clone <url_du_repo>
cd ChatIRC

# Installer le backend
cd backend
npm install

# Installer le frontend
cd ../frontend
npm install
```

### 3️⃣ Configuration
Créer un fichier `.env` dans le dossier `backend` :
```env
PORT=5000
MONGO_URI=<votre_url_mongodb>
JWT_SECRET=<clé_secrète>
JWT_EXPIRES_IN=1h
```

### 4️⃣ Lancer l'application
```bash
# Démarrer le backend
cd backend
npm start

# Démarrer le frontend
cd ../frontend
npm start
```

## 🎯 Commandes IRC supportées
| Commande            | Description |
|---------------------|-------------|
| `/nick <pseudo>`   | Changer de pseudo |
| `/list`            | Lister les canaux disponibles |
| `/create <nom>`    | Créer un nouveau canal |
| `/delete <nom>`    | Supprimer un canal |
| `/join <nom>`      | Rejoindre un canal |
| `/quit <nom>`      | Quitter un canal |
| `/users`           | Voir la liste des utilisateurs dans un canal |
| `/msg <pseudo> <message>` | Envoyer un message privé |

## 📌 Technologies utilisées
**Backend** : Node.js, Express.js, MongoDB, Socket.IO
**Frontend** : React.js, TailwindCSS, Socket.IO-client

## 🛠 Tests
Le backend inclut des tests unitaires exécutables avec Jest :
```bash
cd backend
npm test
```

## 📖 Documentation
Un guide d'utilisation détaillé est disponible dans le fichier `Guide_Utilisation.md`.

## 🎤 Présentation
Une démonstration fonctionnelle est prévue avec une présentation technique détaillée.

---

Projet développé dans le cadre du module T-JSF-600.

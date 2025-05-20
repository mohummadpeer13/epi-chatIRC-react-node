# 📖 Guide d'utilisation - ChatIRC

Bienvenue sur **ChatIRC**, une application de chat inspirée du protocole IRC.

## 🔹 Connexion et Interface

1. Accédez à l'application sur **http://localhost:3000**.
2. Connectez-vous avec votre compte ou utilisez le mode **Connexion Anonyme**.
3. Une fois connecté, vous pouvez voir la **liste des channels disponibles**.

## 🔹 Gestion des Channels

- **Lister les channels** : Tapez `/list` dans le champ de message.
- **Créer un channel** : Tapez `/create <nom_du_channel>`.
- **Supprimer un channel** : Tapez `/delete <nom_du_channel>`.
- **Rejoindre un channel** : Tapez `/join <nom_du_channel>`.
- **Quitter un channel** : Tapez `/quit <nom_du_channel>`.

## 🔹 Gestion des Utilisateurs

- **Changer de pseudo** : `/nick <nouveau_pseudo>`.
- **Lister les utilisateurs** d'un channel : `/users`.

## 🔹 Envoyer des Messages

- **Message public** : Tapez un message et appuyez sur **Entrée**.
- **Message privé** : `/msg <pseudo> <message>`.

## 🔹 Notifications

- Lorsqu'un utilisateur rejoint un channel, un message s'affiche : _"User a rejoint le channel"_
- Lorsqu'un utilisateur quitte un channel, un message s'affiche : _"User a quitté le channel"_

## 🎨 Interface

L'interface est intuitive avec **TailwindCSS** :
- 📌 Barre latérale pour voir les **utilisateurs connectés**.
- 📌 Liste des channels disponibles en **haut de l'écran**.
- 📌 Messages affichés avec les pseudos et timestamps.
- 📌 **Système de notifications** pour informer des changements.

---

## 🛠️ Résolution de Problèmes

### 🔹 Impossible de se connecter ?
- Vérifiez que **le backend est bien lancé** (`npm start` dans `backend/`).
- Assurez-vous que **MongoDB est accessible**.
- Vérifiez votre **fichier `.env`**.

### 🔹 Les messages ne s’affichent pas ?
- Vérifiez que **le serveur WebSocket fonctionne** (`npm start` dans `backend/`).
- Rafraîchissez la page et reconnectez-vous.

### 🔹 Impossible de créer un channel ?
- Vérifiez que **le nom du channel est disponible**.
- Assurez-vous que vous avez bien écrit `/create <nom_du_channel>`.

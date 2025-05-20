require('dotenv').config()

const connectDatabase = require('./db/db');

const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app); // Création du serveur HTTP à partir de app

const userRoutes = require('./routes/userRoutes');
const socketInit = require('./socket');

// Connexion à la base de données
connectDatabase();

app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Initialisation de Socket.IO
socketInit(server);

// Exportez à la fois `app` et `server` pour les utiliser dans les tests
module.exports = { app, server };

// Démarrer le serveur (c'est uniquement pour l'exécution normale, pas pour les tests)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

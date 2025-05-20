const mongoose = require('mongoose');

module.exports = async () => {
  if (mongoose.connection.readyState) {
    await mongoose.disconnect(); // Ferme la connexion si elle est ouverte
  }
};
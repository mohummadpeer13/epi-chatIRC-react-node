const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,  // Assure que chaque channel a un nom unique
  },
});

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;

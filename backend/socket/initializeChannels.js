const Channel = require('../models/Channel');

const initializeChannels = async () => {
  try {
    const existingChannel = await Channel.findOne({ name: 'management' });

    if (!existingChannel) {
      // s'il n'existe pas
      const newChannel = new Channel({
        name: 'management',
      });

      await newChannel.save();
      console.log('Channel "management" created!');
    } else {
      console.log('Channel "management" already exists.');
    }
  } catch (error) {
    console.error('Error initializing channels:', error);
  }
};

module.exports = initializeChannels;

const Channel = require('../models/Channel');
const User = require('../models/User');
const initializeChannels = require('./initializeChannels'); 

const users = {}; // Objet pour stocker les utilisateurs en mémoire
const channelsData = {}; // Objet pour stocker les données des channels en mémoire


//initializeChannels();

const chatEvents = async (socket, io) => {
  console.log(`User connected: ${socket.id}`);

  // Liste des channels
  socket.on('getListChannels', async () => {
    try {
      const channels = await Channel.find();
      const channelList = channels.map((channel) => ({
        id: channel.name, 
        alias: channel.alias || channel.name, 
      }));
      socket.emit('channelListGet', channelList);
    } catch (error) {
      console.error('Error fetching channel list:', error);
    }
  });


  // Recevoir un message et le diffuser dans le channel
  socket.on('sendMessage', ({ channel, username, message }) => {
    try {
      if (channelsData[channel]) {
        const newMessage = { username, message, timestamp: new Date().toISOString() };
        channelsData[channel].messages.push(newMessage);

        // Diffuser le message à tous les membres du channel
        io.to(channel).emit('newMessage', newMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });


  // Déconnexion
  socket.on('disconnect', async () => {
    try {
      // Supprimer l'utilisateur de tous les channels en mémoire
      for (const channel in channelsData) {
        const userIndex = channelsData[channel].users.findIndex((user) => user.socketId === socket.id);
        if (userIndex !== -1) {
          channelsData[channel].users.splice(userIndex, 1);
          io.to(channel).emit('userList', channelsData[channel].users);
        }
      }

      // Supprimer l'utilisateur de la mémoire
      delete users[socket.id];
      console.log(`User disconnected: ${socket.id}`);
    } catch (error) {
      console.error('Error on disconnect:', error);
    }
  });

  

  // COMMAND /nick
  socket.on('nick', async (newUsername, oldUsername, channel) => {
    try {
      // Vérifier si le nouveau pseudo est déjà utilisé
      const existingUser = await User.findOne({ pseudo: newUsername });
      if (existingUser) {
        socket.emit('error', 'Pseudo existe déjà !!!');
        console.error(`Pseudo ${newUsername} allready exist.`);
        return;
      }

      // Mise à jour du pseudo dans la base de données
      const updatedUser = await User.findOneAndUpdate(
        { pseudo: oldUsername },      
        { $set: { pseudo: newUsername } }, 
        { new: true }                 
      );
        
        const user = users[socket.id];
        if (user) {
          user.username = newUsername; // Changer le pseudo de l'utilisateur

          // Mettre à jour le pseudo dans les données des channels
          for (const channel in channelsData) {
                const channelUsers = channelsData[channel].users;

                // Recherche de l'utilisateur dans le tableau avec `socketId`
                const user = channelUsers.find(u => u.socketId === socket.id);

                if (user) {
                  // Mettre à jour le pseudo de l'utilisateur dans le canal
                  user.username = newUsername;
                } else {
                  // Si l'utilisateur n'est pas trouvé, afficher un message
                  console.log(`User avec socket ID ${socket.id} non trouvé dans le channel ${channel}.`);
                }
          }

          // Informer tous les utilisateurs que le pseudo a changé
          io.emit('nickChanged', { socketId: socket.id, newUsername, oldUsername });

          
        const systemMessage = {
          username: 'System',
          message: `${oldUsername} a changé son pseudo en ${newUsername}.`,
          timestamp: new Date(),
        };
        
         // Vérifier si le canal existe avant d'ajouter un message
        if (channelsData[channel]) {
          channelsData[channel].messages.push(systemMessage); // Ajouter le message système dans le canal
          io.to(channel).emit('newMessage', systemMessage); // Diffuser le message à tous les membres du canal
        } else {
          console.error(`Le canal ${channel} n'existe pas dans les données en mémoire.`);
        }

          console.log(`${oldUsername} a changé son pseudo en ${newUsername}`);

        } else {
          socket.emit('error', 'User non trouvé.');
        }
      
    } catch (error) {
      console.error('Erreur durant changement de pseudo :', error);
    }
  });


  // COMMAND /list
  socket.on('listChannels', async () => {
    try {
      const channels = await Channel.find(); // Récupérer les channels depuis la base de données
      const channelNames = channels.map((channel) => channel.name); // Obtenir les noms des channels
      socket.emit('channelList', channelNames); // Envoyer la liste des channels à l'utilisateur
      console.log('Liste des channels envoyée');
    } catch (error) {
      console.error('Error fetching channel list:', error);
    }
  });


  // COMMAND /create
  socket.on('createChannel', async (channelName) => {
    try {
      const existingChannel = await Channel.findOne({ name: channelName });

      if (!existingChannel) {
        // si le channel n'existe âs
        // crée le nouveau channel dans la base de données
        const newChannel = new Channel({
          name: channelName,
        });

        await newChannel.save();

        // ajoute le channel dans les données en mémoire
        channelsData[channelName] = { users: [], messages: [] };

        // notifie à tous les utilisateurs la création du nouveau channel
        io.emit('channelCreated', channelName);

        console.log(`Nouveau channel crée : ${channelName}`);
      } else {
        // Envoyer une erreur si le channel existe déjà
        socket.emit('error', `Channel "${channelName}" existe déjà.`);
        console.error(`Channel ${channelName} existe déjà.`);
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  });


  // COMMAND /delete
  socket.on('deleteChannel', async (channelName) => {
    try {
      const channelToDelete = await Channel.findOne({ name: channelName });
      if (channelToDelete) {
        // si le channel existe supprime celle ci
        await Channel.deleteOne({ name: channelName });

        // supprime le channel de la mémoire
        delete channelsData[channelName];

        // notifie tous les clients de la suppression
        io.emit('channelDeleted', channelName);

        console.log(`Channel ${channelName} supprimé.`);
      } else {
        socket.emit('deleteError', `Channel "${channelName}" n'existe pas.`);
      }
    } catch (error) {
      console.error('erreur suppression channel :', error);
    }
  });

  //COMAND /msg
  socket.on('private_message', ({ targetUser, message, privateChannel }) => {
    try {
      const sender = users[socket.id];
      const targetSocketId = Object.keys(users).find(
        (id) => users[id].username === targetUser
      );
  
      if (targetSocketId) {
        // initialise le channel privé
        if (!channelsData[privateChannel]) {
          channelsData[privateChannel] = { users: [], messages: [] };
        }
  
        // ajoute les utilisateurs au channel privé
        [socket.id, targetSocketId].forEach((id) => {
          if (!channelsData[privateChannel].users.some((u) => u.socketId === id)) {
            channelsData[privateChannel].users.push(users[id]);
          }
        });
  
        // joins les utilisateurs au channel
        socket.join(privateChannel);
        io.to(targetSocketId).socketsJoin(privateChannel);
  
        socket.emit('joined_private_channel', { privateChannel, alias: targetUser });
        io.to(targetSocketId).emit('joined_private_channel', { privateChannel, alias: sender.username });

        // ajoute et diffuse le message
        const newMessage = {
          username: sender.username,
          message,
          timestamp: new Date().toISOString(),
        };
        channelsData[privateChannel].messages.push(newMessage);
        io.to(privateChannel).emit('new_private_message', newMessage);
        io.to(privateChannel).emit('newMessage', newMessage);
  
      } else {
        socket.emit('error', { message: "L'utilisateur cible n'est pas en ligne." });
      }
    } catch (error) {
      console.error('Erreur lors de l’envoi du message privé:', error);
    }
  });

  // Quand un utilisateur demande l'historique des messages privés
  socket.on('getPrivateHistory', (privateChannel) => {
    // Si le canal privé existe, envoyer l'historique des messages
    if (channelsData[privateChannel] && channelsData[privateChannel].messages) {
      socket.emit('privateMessageHistory', channelsData[privateChannel].messages);
    }
  });

  

  //COMMAND /join
  socket.on('joinChannel', async ({ username, channel }) => {
    try {
      // vérifie si le chanel existe dans la base de données
      let currentChannel = await Channel.findOne({ name: channel });
  
      if (currentChannel) {

        // initialise les données du channel en mémoire si ce n'est pas déjà fait
        if (!channelsData[channel]) {
          channelsData[channel] = { users: [], messages: [] };
        }
  
        // Vérifie si l'utilisateur est déjà dans le channel
        const userAlreadyInChannel = channelsData[channel].users.some(user => user.username === username);
  
        if (userAlreadyInChannel) {
          // si déjà connecté au channel
          io.to(channel).emit('userList', channelsData[channel].users);
          io.to(socket.id).emit('messageHistory', channelsData[channel].messages);
          
          socket.emit('channelActivated', { channel });
          return;
        }
        // si pas connecté au channel
        // ajoute l'utilisateur dans le channel en mémoire
        channelsData[channel].users.push({ username, socketId: socket.id });
        users[socket.id] = { username, channel };
  
        // joint l'utilisateur au channel
        socket.join(channel);

        // ajoute un message système pour notifier que l'utilisateur à rejoins le channel
        const systemMessageRejoinChannel = {
          username: 'System',
          message: `${username} a rejoint le channel ${channel}.`,
          timestamp: new Date(),
        };
        channelsData[channel].messages.push(systemMessageRejoinChannel);
        io.to(channel).emit('newMessage', systemMessageRejoinChannel);
    

        // envoi la liste des utilisateurs et l'historique des messages
        io.to(channel).emit('userList', channelsData[channel].users);
        io.to(socket.id).emit('messageHistory', channelsData[channel].messages);
        socket.emit('privateMessageHistory', channelsData[privateChannel].messages);
        socket.emit('channelActivated', { channel });

        console.log(`${username} à rejoint le channel ${channel}`);
      } 
  
    } catch (error) {
      console.error('Erreur pour rejoindre le channel, socket joinChannel :', error);
    }
  });


   // COMMAND /quit
   socket.on('leaveChannel', async ({ channel, username }) => {
    try {
      if (channelsData[channel]) {
        // Trouver l'utilisateur dans le canal
        const user = channelsData[channel].users.find(user => user.socketId === socket.id);
  
        if (user) {
          // Retirer l'utilisateur de la liste des utilisateurs du canal
          channelsData[channel].users = channelsData[channel].users.filter(u => u.socketId !== socket.id);
  
          // Retirer l'utilisateur de la mémoire globale
          delete users[socket.id];
  
          socket.leave(channel);
  
          // Créer un message système pour notifier les autres utilisateurs
          const systemMessage = {
            username: 'System',
            message: `${username} a quitté le channel ${channel}.`,
            timestamp: new Date(),
          };
  
          // Ajouter le message au canal et notifier les utilisateurs
          channelsData[channel].messages.push(systemMessage);
          io.to(channel).emit('newMessage', systemMessage);
          io.to(channel).emit('userList', channelsData[channel].users);
          
          socket.emit('quitSuccess');
          
          console.log(`${user.username} left ${channel} at ${systemMessage.timestamp}`);
        } 
      } 
      
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  });


  socket.on('getChannelUsers', ({ channel }, callback) => {
    try {
      if (channelsData[channel]) {
        // Récupérer la liste des utilisateurs dans le canal
        const userList = channelsData[channel].users || [];
        
        callback(userList);
      } else {
        callback([]); // Renvoie une liste vide si le canal n'existe pas
      }
    } catch (error) {
      console.error('Error retrieving user list:', error);
      callback([]); // Renvoie une liste vide en cas d'erreur
    }
  });



};

module.exports = chatEvents;

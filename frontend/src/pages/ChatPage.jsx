//CHATPAGE.JSX
import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import UserList from '../components/UserList';
import Messages from '../components/Messages'; 
import InputMessage from '../components/InputMessage';
import Snackbar from '../components/Snackbar';
import ActiveChannel from '../components/ActiveChannel';
import ChannelList from '../components/ChannelList';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const socket = io(apiUrl);

const ChatPage = () => {
  const [channels, setChannels] = useState([]); // Liste des channels
  const [activeChannel, setActiveChannel] = useState(null); // Channel actif
  const [users, setUsers] = useState([]); // Utilisateurs connectés
  const [messages, setMessages] = useState([]); // Messages du chat
  const [messageInput, setMessageInput] = useState(''); // Message en cours d'écriture
  const [username, setUsername] = useState(''); // Génére un username aléatoire
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Message à afficher dans le Snackbar
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Niveau de gravité du Snackbar ('success' ou 'error')
  const [openSnackbar, setOpenSnackbar] = useState(false); // Gére l'ouverture du Snackbar
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  useEffect(() => {
    if (openSnackbar) {
      const timer = setTimeout(() => {
        setOpenSnackbar(false);
      }, 3000);
  
      return () => clearTimeout(timer);
    }
  }, [openSnackbar]);



  useEffect(() => {
    setUsername(localStorage.getItem('nickname'));

    if (activeChannel) {
      console.log("passe")
      // efface les messages précédents avant de charger les nouveaux
      setMessages([]);

      // rejoins un channel
      socket.emit('joinChannel', { username, channel: activeChannel });

      // ecoute retour historique des messages
      socket.on('messageHistory', (messages) => {
        setMessages(messages);
      });

      // ecoute retour nouveaux messages
      socket.on('newMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      // ecoute retour liste des utilisateurs
      socket.on('userList', (users) => {
        setUsers(users);
      });

      // ecoute retour changement de channel join
      socket.on('channelActivated', ({ channel}) => {
        setActiveChannel(channel); 
      });
  
      // ecoute retour changement de pseudo, met à jour la liste des utilisateurs
      socket.on('nickChanged', ({ socketId, newUsername, oldUsername }) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.socketId === socketId ? { ...user, username: newUsername } : user
          )
        );
        
      });
     
      return () => {
        socket.off('messageHistory');
        socket.off('newMessage');
        socket.off('userList');
        socket.off('channelActivated');
        socket.off('nickChanged');
      };
    }
  }, [activeChannel]);



  // messages privés 
  useEffect(() => {
    
    socket.on('new_private_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('joined_private_channel', ({ privateChannel, alias }) => {
      if (!channels.find((c) => c.id === privateChannel)) {
        setChannels((prevChannels) => [...prevChannels, { id: privateChannel, alias }]);
      }

       // Charger l'historique des messages privés
      socket.emit('getPrivateHistory', privateChannel); 

      setActiveChannel(privateChannel);
      setSnackbarMessage(`Vous avez rejoint un canal privé avec ${alias}`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
    });

    socket.on('privateMessageHistory', (messages) => {
      setMessages(messages);  // Mettez à jour les messages avec l'historique récupéré
    });

    return () => {
      socket.off('new_private_message');
      socket.off('joined_private_channel');
      socket.off('privateMessageHistory');
    };
  }, [channels]);


  // ecoute les channels disponibles
  useEffect(() => {
    
    socket.emit('getListChannels');
    
    socket.on('channelListGet', (channelList) => {
      setChannels(channelList);
    });

     
    // COMMAND /LIST RESPONSE
    socket.on('channelList', (channelList) => {
      // ajoute la liste des channels comme un message système
      const systemMessage = {
        username: 'System',
        message: `Channels disponibles : ${channelList.join(', ')}`,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, systemMessage]);
    });

    socket.on('channelCreated', (newChannel) => {
      socket.emit('getListChannels');
      setSnackbarMessage(`Channel "${newChannel}" créé avec succès!`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    });

    // ecoute erreur de création de channel
    socket.on('error', (errorMessage) => {
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setOpenSnackbar(true); 
    });

    // ecoute la suppression du channel
    socket.on('channelDeleted', (deletedChannel) => {
      socket.emit('getListChannels');
      setSnackbarMessage(`Channel "${deletedChannel}" supprimé avec succès!`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true); 
    });

    // ecoute erreur de suppression de channel
    socket.on('deleteError', (errorMessage) => {
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setOpenSnackbar(true); 
    });

    // ecoute erreur de quitter channel
    socket.on('quitError', (errorMessage) => {
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setOpenSnackbar(true); 
      setMessageInput('');
    });

     // ecoute success quitter channel
     socket.on('quitSuccess', (errorMessage) => {
      setActiveChannel(null);
      setUsers([]); 
      setMessages([]);
      setMessageInput('');
    });

    return () => {
      socket.off('getListChannels');
      socket.off('channelList');
      socket.off('channelCreated');
      socket.off('error');
      socket.off('channelDeleted');
      socket.off('deleteError');
    };
  }, []);


  const handleSendMessage = () => {
    const trimmedMessage = messageInput.trim();
    if (!trimmedMessage) return;
    
        //COMMAND /msg
        if (trimmedMessage.startsWith('/msg')) {
          const [targetUser, ...messageParts] = trimmedMessage.slice(5).split(' ');
          const message = messageParts.join(' ');
      
          if (targetUser) {
            if (targetUser !== username) {
              const privateChannel = `private:${[username, targetUser].sort().join(':')}`;
              socket.emit('private_message', { targetUser, message, privateChannel });
              setMessageInput('');
              setSnackbarMessage(`Message privé envoyé à ${targetUser}`);
              setSnackbarSeverity('success');
              setOpenSnackbar(true);
            } else {
              setSnackbarMessage('Vous ne pouvez pas vous envoyé de message');
              setSnackbarSeverity('error');
              setOpenSnackbar(true);
            }
          } else {
            setSnackbarMessage('Usage: /msg <nickname> <message>');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
          }
          return;
        }
  
        // COMMAND /create
        if (trimmedMessage.startsWith('/create')) {
          const channelName = trimmedMessage.slice(8).trim();
          if (channelName) {
            socket.emit('createChannel', channelName);
            setMessageInput('');
            return;
          } else {
            setSnackbarMessage('/create => Le channel est requis.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true); 
          }
          setMessageInput('');
          return;
        }

        // COMMAND /list
        if (trimmedMessage === '/list') {
          socket.emit('listChannels');
          setMessageInput('');
          return;
        }

        // COMMAND /delete
        if (trimmedMessage.startsWith('/delete')) {
          const channelName = trimmedMessage.slice(8).trim();
          if (channelName) {
            socket.emit('deleteChannel', channelName);
            setMessageInput('');
            return;
          } else {
            setSnackbarMessage('/delete => Le channel est requis.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true); 
          }
          setMessageInput('');
          return;
        }

        // COMMAND /nick
        if (trimmedMessage.startsWith('/nick')) {
          const newNickname = trimmedMessage.slice(6).trim();
          if (newNickname) {
            socket.emit('nick', newNickname, username, activeChannel);
            setUsername(newNickname);
            localStorage.setItem('nickname', newNickname);

          } else {
            setSnackbarMessage('/nick => Le pseudo est requis.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true); 
          }
          setMessageInput('');
          return;
        }

        // COMMAND /join
        if (trimmedMessage.startsWith('/join')) {
          const channelName = trimmedMessage.slice(6).trim();
          if (channelName) {
            socket.emit('joinChannel', { channel: channelName, username });
            setMessageInput('');
          } else {
            setSnackbarMessage('/join => Le nom du channel est requis.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            setMessageInput(''); 
          }
          return;
        }

        // COMMAND /quit
        if (trimmedMessage.startsWith('/quit')) {
          const channelName = trimmedMessage.slice(6).trim();
          if (channelName) {
            socket.emit('leaveChannel', { channel: channelName, username });
          } else {
            setSnackbarMessage('/quit => Le nom du channel est requis.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            setMessageInput(''); 
          }
          return;
        }

        // COMMAND /users
        if (trimmedMessage.startsWith('/users')) {
          const channelName = trimmedMessage.slice(6).trim();
          if (channelName) {
            // Demande la liste des utilisateurs au backend pour le channel actif
            socket.emit('getChannelUsers', { channel: channelName }, (userList) => {
              const systemMessage = {
                username: 'System',
                message: `Utilisateurs connectés dans "${channelName}": ${userList.map((u) => u.username).join(', ')}`,
                timestamp: new Date(),
              };
              setMessages((prevMessages) => [...prevMessages, systemMessage]);
            });
          } else {
            setSnackbarMessage('/users => Le nom du channel est requis.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
          }
          setMessageInput('');
          return;
        }

        // message classique
        if (trimmedMessage && activeChannel) {
          socket.emit('sendMessage', { channel: activeChannel, username, message: trimmedMessage });
          setMessageInput('');
        }
  };

  const handleUserClick = (targetUser) => {
    if (targetUser !== username) {
      const message='';
      const privateChannel = `private:${[username, targetUser].sort().join(':')}`;
      socket.emit('private_message', { targetUser, message, privateChannel });
      setMessageInput('');
      setSnackbarMessage(`Conversation privé envoyé à ${targetUser}`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }
  };

  // ferme le Snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // quitte channel
  const handleLeaveChannel = () => {
    socket.emit('leaveChannel', { channel: activeChannel, username });
    setActiveChannel(null);
    setUsers([]);
    setMessages([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('nickname');
    socket.disconnect();
    navigate('/');
    window.location.reload(); 
  };


  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 p-4">
      {/* Sidebar - User List */}
      <div className="w-64 bg-white shadow-xl p-4 rounded-lg">
        <UserList users={users} onUserClick={handleUserClick} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 bg-gray-50 rounded-lg shadow-lg ml-2">
        
      <div className="flex justify-between items-center mb-4">
      <h1 className="text-xl text-black font-bold">Bonjour, {username}!</h1>
      <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-2 py-1 text-sm rounded-lg hover:bg-red-600 transition duration-200"
      >
          Déconnexion
      </button>
    </div>

        
        {/* Active Channel */}
        <ActiveChannel activeChannel={activeChannel} onLeaveChannel={handleLeaveChannel} />

        {/* Channel List */}
        <ChannelList
          channels={channels}
          activeChannel={activeChannel}
          setActiveChannel={setActiveChannel}
        />

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto border rounded-lg bg-white p-4 shadow-md">
          {/* Messages */}
          <Messages messages={messages} username={username} />

          {/* Scroll to bottom */}
          <div ref={messagesEndRef} />
          
          {/* Input Message */}
          <InputMessage messageInput={messageInput} setMessageInput={setMessageInput} handleSendMessage={handleSendMessage} />
        </div>

        {/* Snackbar */}
        {openSnackbar && <Snackbar message={snackbarMessage} severity={snackbarSeverity} onClose={handleCloseSnackbar} />}
      </div>
    </div>
  );
  
};

export default ChatPage;

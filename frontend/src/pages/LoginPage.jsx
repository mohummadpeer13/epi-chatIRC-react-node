import React, { useState } from 'react';
import { postLogin } from '../services/api';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Validation simple
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const response = await postLogin({ email, password });
      const token = response.data.token;
      const nickname = response.data.user.pseudo;

      // Sauvegarde le token et pseudo
      localStorage.setItem('authToken', token);
      localStorage.setItem('nickname', nickname);

      // Connexion à Socket.IO
      socket.connect();
      socket.emit('set_nickname', nickname);
      socket.emit('join_channel', 'management');
       
      // Redirection vers la page de chat
      navigate('/chat'); 

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
    }
  };

  const handleLoginAnonymous = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Générer un pseudo anonyme
      const nickname = 'User' + Math.floor(Math.random() * 10000);

      // Sauvegarde le token et pseudo
      localStorage.setItem('authToken', 'null');
      localStorage.setItem('nickname', nickname);

      // Connexion à Socket.IO
      socket.connect();
      socket.emit('set_nickname', nickname);
      socket.emit('join_channel', 'management');
       
      // Redirection vers la page de chat
      navigate('/chat'); 

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-sm w-full">
        <h1 className="text-3xl text-center text-gray-800 font-semibold mb-6">Bienvenue sur IRC Chat</h1>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="input-group">
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              type="email"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="block text-gray-700 font-medium">Mot de passe</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Connexion avec email
          </button>
        </form>

        <button
          onClick={handleLoginAnonymous}
          className="w-full py-3 mt-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Connexion anonyme
        </button>

        <button
          onClick={() => navigate('/register')}
          className="w-full py-3 mt-4 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300"
        >
          S'inscrire
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

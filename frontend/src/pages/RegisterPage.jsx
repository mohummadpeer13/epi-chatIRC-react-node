import React, { useState } from 'react';
import { postRegister } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        pseudo: '',
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await postRegister(formData);
            setSuccess(response.data.message);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
            setSuccess('');
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            <div className="bg-white shadow-lg rounded-xl p-8 max-w-sm w-full">
                <h1 className="text-3xl text-center text-gray-800 font-semibold mb-6">Bienvenue sur IRC Chat</h1>
                {error && <p className="text-red-600 text-center mb-4">{error}</p>}
                {success && <p className="text-green-600 text-center mb-4">{success}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="input-group">
                        <label className="block text-gray-700 font-medium">Pseudo</label>
                        <input
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            type="text"
                            name="pseudo"
                            placeholder="Entrez votre pseudo"
                            value={formData.pseudo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="block text-gray-700 font-medium">Email</label>
                        <input
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            type="email"
                            name="email"
                            placeholder="Entrez votre email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="block text-gray-700 font-medium">Mot de passe</label>
                        <input
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            type="password"
                            name="password"
                            placeholder="Entrez votre mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        S'inscrire
                    </button>

                    <button className="w-80 p-2 my-2 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                        onClick={() => navigate('/')}>Connexion</button>
                </form>
            </div>
        </div>
    );
};

export default Register;

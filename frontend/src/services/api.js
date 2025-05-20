import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: apiUrl
});

export const postLogin = (loginData) => api.post('/api/login', loginData);
export const postRegister = (formData) => api.post('/api/register', formData);
export const createChannel = (channelData) => api.post('/api/channels', channelData);
export const getChannels = () => api.get('/api/channels');

export default api;

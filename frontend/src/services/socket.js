import { io } from 'socket.io-client';
const apiUrl = process.env.REACT_APP_API_URL;

const SOCKET_URL = apiUrl

const socket = io(SOCKET_URL, {
  autoConnect: false, 
});

export default socket;

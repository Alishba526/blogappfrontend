import { io } from 'socket.io-client';

const SOCKET_URL = 'https://blogappbackend-one.vercel.app';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem('token') // JWT token
  }
});

// Socket event handlers
const setupSocket = () => {
  // Reconnect with new token when it changes
  const token = localStorage.getItem('token');
  if (token) {
    socket.auth = { token };
    socket.connect();
  }

  // Handle connection errors
  socket.on('connect_error', (error) => {
    if (error.message === 'Authentication error') {
      console.error('Socket authentication failed');
    }
  });
};

// Cleanup function
const cleanupSocket = () => {
  socket.disconnect();
};

export { socket, setupSocket, cleanupSocket };

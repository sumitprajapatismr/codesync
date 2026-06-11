import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    let newSocket = null;

    if (user && token) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket'],
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket client connected:', newSocket.id);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
        console.log('Socket client disconnected.');
      }
    };
  }, [user, token]);

  const joinRoom = (roomId, userInfo) => {
    if (socket) {
      socket.emit('join-room', { roomId, user: userInfo });
    }
  };

  const leaveRoom = (roomId, userInfo) => {
    if (socket) {
      socket.emit('leave-room', { roomId, user: userInfo });
    }
  };

  const emitCodeChange = (roomId, code, language, userInfo) => {
    if (socket) {
      socket.emit('code-change', { roomId, code, language, user: userInfo });
    }
  };

  const emitCursorMove = (roomId, position, userInfo) => {
    if (socket) {
      socket.emit('cursor-move', { roomId, position, user: userInfo });
    }
  };

  const emitTyping = (roomId, isTyping, userInfo) => {
    if (socket) {
      socket.emit('typing', { roomId, isTyping, user: userInfo });
    }
  };

  const emitChatMessage = (roomId, message, userInfo) => {
    if (socket) {
      socket.emit('chat-message', { roomId, message, user: userInfo });
    }
  };

  const emitSaveVersion = (roomId, code, language, userInfo) => {
    if (socket) {
      socket.emit('save-version', { roomId, code, language, user: userInfo });
    }
  };

  const emitExecutingStatus = (roomId, status, userInfo) => {
    if (socket) {
      socket.emit('executing-code', { roomId, status, user: userInfo });
    }
  };

  const emitExecutionFinished = (roomId, result, userInfo) => {
    if (socket) {
      socket.emit('execution-finished', { roomId, result, user: userInfo });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        joinRoom,
        leaveRoom,
        emitCodeChange,
        emitCursorMove,
        emitTyping,
        emitChatMessage,
        emitSaveVersion,
        emitExecutingStatus,
        emitExecutionFinished,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

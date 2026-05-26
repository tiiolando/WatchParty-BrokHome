// Author: Senior Frontend Engineer
// OS support: Cross-platform
// Description: Service de gestion des sockets pour la synchronisation en temps réel

import { io } from 'socket.io-client';

const socket = io();

export const SocketService = {
  socket,
  joinRoom: (roomId: string, user: any, password?: string) => {
    socket.emit('join-room', { roomId, user, password });
  },
  sendPlayback: (roomId: string, state: any) => {
    socket.emit('playback-control', { roomId, state });
  },
  reportWatchTime: (userId: string, minutes: number) => {
    socket.emit('update-watch-time', { userId, minutes });
  },
  sendMessage: (roomId: string, message: any) => {
    socket.emit('send-message', { roomId, message });
  },
  onRoomUpdate: (callback: (room: any) => void) => {
    socket.on('room-update', callback);
  },
  onPlaybackSync: (callback: (state: any) => void) => {
    socket.on('playback-sync', callback);
  },
  onNewMessage: (callback: (msg: any) => void) => {
    socket.on('new-message', callback);
  },
  onJoinError: (callback: (error: { message: string }) => void) => {
    socket.on('join-error', callback);
  },
  disconnect: () => {
    socket.off('room-update');
    socket.off('playback-sync');
    socket.off('new-message');
    socket.off('join-error');
    socket.off('rooms-updated');
    socket.off('room-deleted');
  }
};

// --- End of services/socket.ts ---
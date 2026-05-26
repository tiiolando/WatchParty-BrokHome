// Author: Senior Frontend Engineer
// OS support: Cross-platform
// Description: Service backend simulé avec persistance locale pour SyncStream

import { User, Room, PlaylistItem, ChatMessage, Role, Permission } from '../types';

class MockBackend {
  private users: User[] = [];
  private rooms: Room[] = [];
  private currentUser: User | null = null;

  init() {
    const storedUsers = localStorage.getItem('ss_users');
    const storedRooms = localStorage.getItem('ss_rooms');

    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    } else {
      this.users = [
        { 
          id: '1', 
          username: 'AdminUser', 
          role: { id: 'admin', name: 'Administrateur', color: '#e50914', permissions: [Permission.MANAGE_ROLES, Permission.MANAGE_USERS, Permission.MANAGE_ROOMS, Permission.MANAGE_PATHS, Permission.KICK_MEMBERS, Permission.ADD_TO_PLAYLIST, Permission.VIEW_STATS, Permission.BYPASS_PASSWORD, Permission.VIEW_PERFORMANCE] }, 
          roleId: 'admin',
          avatar: 'https://picsum.photos/seed/admin/200', 
          // Ajout des propriétés manquantes avgWatchHour et lastMovieTitle pour respecter l'interface UserStats
          stats: { totalMinutes: 0, filmsFinished: 0, roomsCreated: 0, messagesSent: 0, abandonRate: 0, favoriteGenre: "Inconnu", avgWatchHour: "00:00", lastMovieTitle: "Inconnu", activityHistory: [], watchedHistory: [] } 
        },
        { 
          id: '2', 
          username: 'ModeratorJoe', 
          role: { id: 'moderator', name: 'Modérateur', color: '#10b981', permissions: [Permission.KICK_MEMBERS, Permission.ADD_TO_PLAYLIST] }, 
          roleId: 'moderator',
          avatar: 'https://picsum.photos/seed/mod/200', 
          // Ajout des propriétés manquantes avgWatchHour et lastMovieTitle pour respecter l'interface UserStats
          stats: { totalMinutes: 0, filmsFinished: 0, roomsCreated: 0, messagesSent: 0, abandonRate: 0, favoriteGenre: "Inconnu", avgWatchHour: "00:00", lastMovieTitle: "Inconnu", activityHistory: [], watchedHistory: [] } 
        },
        { 
          id: '3', 
          username: 'ViewerFan', 
          role: { id: 'viewer', name: 'Spectateur', color: '#6b7280', permissions: [] }, 
          roleId: 'viewer',
          avatar: 'https://picsum.photos/seed/viewer/200', 
          // Ajout des propriétés manquantes avgWatchHour et lastMovieTitle pour respecter l'interface UserStats
          stats: { totalMinutes: 0, filmsFinished: 0, roomsCreated: 0, messagesSent: 0, abandonRate: 0, favoriteGenre: "Inconnu", avgWatchHour: "00:00", lastMovieTitle: "Inconnu", activityHistory: [], watchedHistory: [] } 
        },
      ];
      this.saveUsers();
    }

    if (storedRooms) {
      this.rooms = JSON.parse(storedRooms);
    } else {
      this.rooms = [
        {
          id: 'room-1',
          name: 'The Mega Watchroom',
          ownerId: '1',
          isVisible: true,
          playlist: [
            { 
                id: 'p1', 
                title: 'Big Buck Bunny', 
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
                thumbnail: 'https://picsum.photos/seed/bunny/400/225', 
                addedBy: 'AdminUser' 
            },
            { 
                id: 'p2', 
                title: 'Elephants Dream', 
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 
                thumbnail: 'https://picsum.photos/seed/ele/400/225', 
                addedBy: 'AdminUser' 
            },
          ],
          currentVideoIndex: 0,
          playbackState: { isPlaying: false, currentTime: 0, lastUpdated: Date.now() },
          hasChat: true
        }
      ];
      this.saveRooms();
    }
  }

  private saveUsers() { localStorage.setItem('ss_users', JSON.stringify(this.users)); }
  private saveRooms() { localStorage.setItem('ss_rooms', JSON.stringify(this.rooms)); }

  getCurrentUser() {
    const session = localStorage.getItem('ss_session');
    if (session) {
      this.currentUser = JSON.parse(session);
      return this.currentUser;
    }
    return null;
  }

  login(username: string): User | null {
    const user = this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      this.currentUser = user;
      localStorage.setItem('ss_session', JSON.stringify(user));
      return user;
    }
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      role: { id: 'viewer', name: 'Spectateur', color: '#6b7280', permissions: [] },
      roleId: 'viewer',
      avatar: `https://picsum.photos/seed/${username}/200`,
      // Ajout des propriétés manquantes avgWatchHour et lastMovieTitle pour respecter l'interface UserStats
      stats: { totalMinutes: 0, filmsFinished: 0, roomsCreated: 0, messagesSent: 0, abandonRate: 0, favoriteGenre: "Inconnu", avgWatchHour: "00:00", lastMovieTitle: "Inconnu", activityHistory: [], watchedHistory: [] }
    };
    this.users.push(newUser);
    this.saveUsers();
    this.currentUser = newUser;
    localStorage.setItem('ss_session', JSON.stringify(newUser));
    return newUser;
  }

  getRooms() { return this.rooms; }

  getRoom(id: string) { return this.rooms.find(r => r.id === id); }

  createRoom(name: string, ownerId: string) {
    const newRoom: Room = {
      id: `room-${Math.random().toString(36).substr(2, 5)}`,
      name,
      ownerId,
      isVisible: true,
      playlist: [],
      currentVideoIndex: 0,
      playbackState: { isPlaying: false, currentTime: 0, lastUpdated: Date.now() },
      hasChat: true
    };
    this.rooms.push(newRoom);
    this.saveRooms();
    return newRoom;
  }

  updateRoomState(roomId: string, newState: Partial<Room['playbackState']>) {
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      room.playbackState = { ...room.playbackState, ...newState, lastUpdated: Date.now() };
      this.saveRooms();
    }
  }

  addToPlaylist(roomId: string, item: Omit<PlaylistItem, 'id'>) {
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      const newItem: PlaylistItem = { ...item, id: Math.random().toString(36).substr(2, 5) };
      room.playlist.push(newItem);
      this.saveRooms();
      return newItem;
    }
    return null;
  }

  getAllUsers() { return this.users; }

  banUser(userId: string) {
    this.users = this.users.filter(u => u.id !== userId);
    this.saveUsers();
  }

  deleteRoom(roomId: string) {
    this.rooms = this.rooms.filter(r => r.id !== roomId);
    this.saveRooms();
  }
}

export const MockBackendService = new MockBackend();
// --- End of services/mockBackend.ts ---
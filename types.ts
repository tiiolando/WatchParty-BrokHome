// Author: SyncStream Engineer
// OS support: Cross-platform
// Description: Types pour SyncStream avec support gamification, stats et titres personnalisés

export enum Permission {
  MANAGE_ROLES = 'MANAGE_ROLES',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_ROOMS = 'MANAGE_ROOMS',
  MANAGE_PATHS = 'MANAGE_PATHS',
  KICK_MEMBERS = 'KICK_MEMBERS',
  ADD_TO_PLAYLIST = 'ADD_TO_PLAYLIST',
  VIEW_STATS = 'VIEW_STATS',
  BYPASS_PASSWORD = 'BYPASS_PASSWORD',
  VIEW_PERFORMANCE = 'VIEW_PERFORMANCE'
}

export interface Role {
  id: string;
  name: string;
  color: string;
  permissions: Permission[];
}

export interface UserStats {
  totalMinutes: number;
  filmsFinished: number;
  roomsCreated: number;
  messagesSent: number;
  abandonRate: number;
  favoriteGenre: string;
  avgWatchHour: string;
  lastMovieTitle: string;
  activityHistory: { date: number; action: string; details?: string }[];
  watchedHistory: { title: string; timestamp: number }[];
}

export interface User {
  id: string;
  username: string;
  role: Role;
  roleId?: string;
  avatar: string;
  title?: string;
  customBadges?: string[];
  stats: UserStats;
  isPremium?: boolean;
  kofiUsername?: string;
  lastPlayback?: {
    video: PlaylistItem;
    currentTime: number;
    timestamp: number;
    roomId?: string;
  } | null;
}

export interface PlaylistItem {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  addedBy: string;
  userId?: string;
  isLocal?: boolean;
  localPath?: string;
  duration?: number;
}

export interface VideoPath {
  path: string;
  isPremium: boolean;
}

export interface LocalFile {
  name: string;
  path: string;
  isDirectory: boolean;
  rootPath?: string;
  isPremium?: boolean;
}

export interface Room {
  id: string;
  name: string;
  ownerId: string;
  password?: string;
  isPremium?: boolean;
  isVisible: boolean;
  hasChat: boolean;
  playlist: PlaylistItem[];
  currentVideoIndex: number;
  memberCount?: number;
  playbackState: {
    isPlaying: boolean;
    currentTime: number;
    lastUpdated: number;
  };
}

export interface Suggestion {
  id: string;
  userId: string;
  username: string;
  type: 'movie' | 'feature';
  content: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string | null;
  stats: UserStats;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStats {
  totalMatches: number;
  bestWPM: number;
  avgWPM: number;
  avgAccuracy: number;
  totalTimeTyped: number;
}

export interface Room {
  _id: string;
  roomCode: string;
  hostId: string;
  players: Player[];
  status: RoomStatus;
  settings: RoomSettings;
  passageId?: string;
  createdAt: string;
}

export type RoomStatus = 'WAITING' | 'COUNTDOWN' | 'IN_PROGRESS' | 'FINISHED';

export interface RoomSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  category: string;
}

export interface Player {
  userId: string;
  username: string;
  avatar?: string | null;
  ready: boolean;
  stats?: UserStats;
  progress?: number;
  wpm?: number;
}

export interface Passage {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  wordCount: number;
  charCount: number;
}

export interface PlayerResult {
  userId: string;
  username: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  time: number;
  rank: number;
  wpmTimeline: WPMDataPoint[];
  status: 'FINISHED' | 'DNF';
}

export interface WPMDataPoint {
  time: number;
  wpm: number;
}

export interface Match {
  _id: string;
  roomId: string;
  passageId: string;
  players: PlayerResult[];
  duration: number;
  difficulty: string;
  createdAt: string;
}

export interface TypedChar {
  char: string;
  correct: boolean;
}

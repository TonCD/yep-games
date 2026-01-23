// Spy Game Types for Firebase Firestore

export type SpyRoomStatus = 'waiting' | 'playing' | 'ended';
export type PlayerRole = 'civilian' | 'spy';
export type PlayerStatus = 'alive' | 'eliminated';

export interface SpyPlayer {
  id: string;
  name: string;
  role: PlayerRole | null; // null before game starts
  status: PlayerStatus;
  joinedAt: number;
  eliminatedAt?: number;
}

export interface SpySettings {
  spyCount: number;
  civilianKeyword: string;
  spyKeyword: string;
}

export interface SpyRoom {
  id: string;
  code: string;
  hostId: string;
  createdAt: number;
  autoDeleteAt: number; // 12 hours after creation
  status: SpyRoomStatus;
  settings: SpySettings | null; // null until game starts
  players: SpyPlayer[];
  eliminatedOrder: string[]; // Player IDs in elimination order
}

// Helper function to generate random room code (reuse from room.ts logic)
export const generateSpyRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper function to generate unique player ID
export const generatePlayerId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

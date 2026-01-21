// Room and Scoring Types for Firebase Firestore

export interface Judge {
  id: string;
  name: string;
  token: string;
  avatar: string;
  joinedAt: number;
}

export interface Performance {
  id: string;
  name: string;
  order: number;
  createdAt: number;
}

export interface Score {
  judgeId: string;
  performanceId: string;
  score: number;
  submittedAt: number;
}

export interface Room {
  id: string;
  code: string;
  hostName: string;
  createdAt: number;
  expiresAt: number;
  isCompleted: boolean;
  judges: Judge[];
  performances: Performance[];
  scores: Score[];
}

// Helper function to generate random room code
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper function to generate unique judge token
export const generateJudgeToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Calculate 12-hour expiration time
export const getExpirationTime = (): number => {
  return Date.now() + (12 * 60 * 60 * 1000); // 12 hours from now
};

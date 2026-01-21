export interface Submission {
  deviceId: string;
  name: string;
  photoURL: string;
  message: string;
  submittedAt: Date;
}

export interface Vote {
  deviceId: string;
  votedFor: string[]; // Array of deviceIds (max 3)
  votedAt: Date;
}

export interface DressCodeRoom {
  roomCode: string;
  hostName: string;
  createdAt: Date;
  expiresAt: Date;
  isCompleted: boolean;
  submissions: Submission[];
  votes: Vote[];
}

// Helper function to generate 6-character room code
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper function to generate device ID (using localStorage + random)
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('dresscode-device-id');
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('dresscode-device-id', deviceId);
  }
  return deviceId;
};

// Helper function to set 12-hour expiration
export const getExpirationTime = (): Date => {
  const now = new Date();
  now.setHours(now.getHours() + 12);
  return now;
};

// Calculate vote counts for each submission
export interface VoteResult {
  deviceId: string;
  name: string;
  photoURL: string;
  message: string;
  voteCount: number;
}

export const calculateVoteResults = (room: DressCodeRoom): VoteResult[] => {
  const voteCounts = new Map<string, number>();
  
  // Initialize all submissions with 0 votes
  room.submissions.forEach(sub => {
    voteCounts.set(sub.deviceId, 0);
  });
  
  // Count votes
  room.votes.forEach(vote => {
    vote.votedFor.forEach(deviceId => {
      voteCounts.set(deviceId, (voteCounts.get(deviceId) || 0) + 1);
    });
  });
  
  // Create results with submission info
  const results: VoteResult[] = room.submissions.map(sub => ({
    deviceId: sub.deviceId,
    name: sub.name,
    photoURL: sub.photoURL,
    message: sub.message,
    voteCount: voteCounts.get(sub.deviceId) || 0,
  }));
  
  // Sort by vote count (descending)
  results.sort((a, b) => b.voteCount - a.voteCount);
  
  return results;
};

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import type { 
  Room, 
  Judge, 
  Performance, 
  Score
} from '../types/room';
import { 
  generateRoomCode, 
  generateJudgeToken,
  getExpirationTime 
} from '../types/room';

// Create a new scoring room
export const createRoom = async (hostName: string): Promise<{ roomId: string; roomCode: string }> => {
  const roomCode = generateRoomCode();
  const roomId = doc(collection(db, 'rooms')).id;
  
  const roomData: Room = {
    id: roomId,
    code: roomCode,
    hostName,
    createdAt: Date.now(),
    expiresAt: getExpirationTime(),
    isCompleted: false,
    judges: [],
    performances: [],
    scores: []
  };
  
  await setDoc(doc(db, 'rooms', roomId), roomData);
  return { roomId, roomCode };
};

// Join room with room code
export const joinRoomByCode = async (roomCode: string): Promise<string | null> => {
  const roomsRef = collection(db, 'rooms');
  const q = query(roomsRef, where('code', '==', roomCode.toUpperCase()));
  
  return new Promise((resolve) => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      unsubscribe();
      if (!snapshot.empty) {
        const roomDoc = snapshot.docs[0];
        const room = roomDoc.data() as Room;
        
        // Check if room is expired
        if (room.expiresAt < Date.now()) {
          resolve(null); // Room expired
        } else if (room.isCompleted) {
          resolve(null); // Room already completed
        } else {
          resolve(roomDoc.id);
        }
      } else {
        resolve(null); // Room not found
      }
    });
  });
};

// Add judge to room
export const addJudge = async (roomId: string, judgeName: string): Promise<Judge> => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const room = roomSnap.data() as Room;
  const judgeToken = generateJudgeToken();
  
  const newJudge: Judge = {
    id: `judge-${Date.now()}-${Math.random()}`,
    name: judgeName,
    token: judgeToken,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${judgeName}`,
    joinedAt: Date.now()
  };
  
  await updateDoc(roomRef, {
    judges: [...room.judges, newJudge]
  });
  
  return newJudge;
};

// Add performance to room
export const addPerformance = async (roomId: string, performanceName: string): Promise<Performance> => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const room = roomSnap.data() as Room;
  
  const newPerformance: Performance = {
    id: `perf-${Date.now()}-${Math.random()}`,
    name: performanceName,
    order: room.performances.length + 1,
    createdAt: Date.now()
  };
  
  await updateDoc(roomRef, {
    performances: [...room.performances, newPerformance]
  });
  
  return newPerformance;
};

// Submit score
export const submitScore = async (
  roomId: string, 
  judgeId: string, 
  performanceId: string, 
  score: number
): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const room = roomSnap.data() as Room;
  
  // Remove existing score if any
  const filteredScores = room.scores.filter(
    s => !(s.judgeId === judgeId && s.performanceId === performanceId)
  );
  
  const newScore: Score = {
    judgeId,
    performanceId,
    score,
    submittedAt: Date.now()
  };
  
  await updateDoc(roomRef, {
    scores: [...filteredScores, newScore]
  });
};

// Remove judge from room
export const removeJudge = async (roomId: string, judgeId: string): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const room = roomSnap.data() as Room;
  
  // Remove judge
  const updatedJudges = room.judges.filter(j => j.id !== judgeId);
  
  // Remove all scores from this judge
  const updatedScores = room.scores.filter(s => s.judgeId !== judgeId);
  
  await updateDoc(roomRef, {
    judges: updatedJudges,
    scores: updatedScores
  });
};

// Mark room as completed
export const completeRoom = async (roomId: string): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    isCompleted: true
  });
};

// Subscribe to room updates (realtime sync)
export const subscribeToRoom = (
  roomId: string, 
  callback: (room: Room | null) => void
): (() => void) => {
  const roomRef = doc(db, 'rooms', roomId);
  
  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      const room = snapshot.data() as Room;
      
      // Check if expired
      if (room.expiresAt < Date.now()) {
        callback(null);
      } else {
        callback(room);
      }
    } else {
      callback(null);
    }
  });
};

// Calculate ranking from scores
export const calculateRanking = (room: Room): Array<{
  performance: Performance;
  totalScore: number;
  averageScore: number;
  judgeCount: number;
  rank: number;
}> => {
  const performanceScores = room.performances.map(perf => {
    const perfScores = room.scores.filter(s => s.performanceId === perf.id);
    const total = perfScores.reduce((sum, s) => sum + s.score, 0);
    const count = perfScores.length;
    const average = count > 0 ? total / count : 0;
    
    return {
      performance: perf,
      totalScore: total,
      averageScore: average,
      judgeCount: count,
      rank: 0
    };
  });
  
  // Sort by average score descending
  performanceScores.sort((a, b) => b.averageScore - a.averageScore);
  
  // Assign ranks
  performanceScores.forEach((item, index) => {
    item.rank = index + 1;
  });
  
  return performanceScores;
};

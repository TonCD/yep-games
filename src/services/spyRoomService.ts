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
  SpyRoom, 
  SpyPlayer, 
  SpySettings,
  PlayerStatus
} from '../types/spy';
import { 
  generateSpyRoomCode, 
  generatePlayerId 
} from '../types/spy';

// Create a new spy room
export const createSpyRoom = async (): Promise<{ roomId: string; roomCode: string }> => {
  const roomCode = generateSpyRoomCode();
  const roomId = doc(collection(db, 'spyRooms')).id;
  
  const now = Date.now();
  const autoDeleteAt = now + (12 * 60 * 60 * 1000); // 12 hours from now
  
  const roomData: SpyRoom = {
    id: roomId,
    code: roomCode,
    hostId: generatePlayerId(), // Host gets a unique ID
    createdAt: now,
    autoDeleteAt,
    status: 'waiting',
    settings: null,
    players: [],
    eliminatedOrder: []
  };
  
  await setDoc(doc(db, 'spyRooms', roomId), roomData);
  return { roomId, roomCode };
};

// Join room with room code
export const joinSpyRoomByCode = async (roomCode: string): Promise<string | null> => {
  const roomsRef = collection(db, 'spyRooms');
  const q = query(roomsRef, where('code', '==', roomCode.toUpperCase()));
  
  return new Promise((resolve) => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      unsubscribe();
      if (!snapshot.empty) {
        const roomDoc = snapshot.docs[0];
        const room = roomDoc.data() as SpyRoom;
        
        // Check if room is expired
        if (room.autoDeleteAt < Date.now()) {
          resolve(null); // Room expired
        } else if (room.status === 'ended') {
          resolve(null); // Room already ended
        } else {
          resolve(roomDoc.id);
        }
      } else {
        resolve(null); // Room not found
      }
    });
  });
};

// Add player to room
export const addPlayerToSpyRoom = async (roomId: string, playerName: string): Promise<SpyPlayer> => {
  const roomRef = doc(db, 'spyRooms', roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const room = roomSnap.data() as SpyRoom;
  
  // Check if player name already exists
  const existingPlayer = room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
  if (existingPlayer) {
    throw new Error('Player name already taken');
  }
  
  const newPlayer: SpyPlayer = {
    id: generatePlayerId(),
    name: playerName,
    role: null, // Role assigned when game starts
    status: 'alive',
    joinedAt: Date.now(),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(playerName)}`
  };
  
  await updateDoc(roomRef, {
    players: [...room.players, newPlayer]
  });
  
  return newPlayer;
};

// Start game with settings
export const startSpyGame = async (
  roomId: string, 
  spyCount: number,
  civilianKeyword: string,
  spyKeyword: string
): Promise<void> => {
  const roomRef = doc(db, 'spyRooms', roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const room = roomSnap.data() as SpyRoom;
  
  if (room.players.length < 3) {
    throw new Error('Need at least 3 players to start');
  }
  
  if (spyCount >= room.players.length) {
    throw new Error('Spy count must be less than total players');
  }
  
  // Randomly assign spy roles
  const playerIndices = room.players.map((_, i) => i);
  const shuffled = playerIndices.sort(() => Math.random() - 0.5);
  const spyIndices = new Set(shuffled.slice(0, spyCount));
  
  const updatedPlayers = room.players.map((player, index) => ({
    ...player,
    role: spyIndices.has(index) ? 'spy' as const : 'civilian' as const
  }));
  
  const settings: SpySettings = {
    spyCount,
    civilianKeyword,
    spyKeyword
  };
  
  await updateDoc(roomRef, {
    status: 'playing',
    settings,
    players: updatedPlayers
  });
};

// Eliminate player
export const eliminatePlayer = async (roomId: string, playerId: string): Promise<void> => {
  const roomRef = doc(db, 'spyRooms', roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const room = roomSnap.data() as SpyRoom;
  
  const updatedPlayers = room.players.map(player => 
    player.id === playerId 
      ? { ...player, status: 'eliminated' as PlayerStatus, eliminatedAt: Date.now() }
      : player
  );
  
  await updateDoc(roomRef, {
    players: updatedPlayers,
    eliminatedOrder: [...room.eliminatedOrder, playerId]
  });
};

// Remove player from room (before game starts)
export const removePlayerFromSpyRoom = async (roomId: string, playerId: string): Promise<void> => {
  const roomRef = doc(db, 'spyRooms', roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const room = roomSnap.data() as SpyRoom;
  
  const updatedPlayers = room.players.filter(player => player.id !== playerId);
  
  await updateDoc(roomRef, {
    players: updatedPlayers
  });
};

// End game
export const endSpyGame = async (roomId: string): Promise<void> => {
  const roomRef = doc(db, 'spyRooms', roomId);
  
  await updateDoc(roomRef, {
    status: 'ended'
  });
};

// Subscribe to room updates
export const subscribeToSpyRoom = (
  roomId: string, 
  callback: (room: SpyRoom | null) => void
): (() => void) => {
  const roomRef = doc(db, 'spyRooms', roomId);
  
  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as SpyRoom);
    } else {
      callback(null);
    }
  });
};

// Get room by ID
export const getSpyRoom = async (roomId: string): Promise<SpyRoom | null> => {
  const roomRef = doc(db, 'spyRooms', roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    return null;
  }
  
  return roomSnap.data() as SpyRoom;
};

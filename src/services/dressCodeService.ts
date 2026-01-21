import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  DressCodeRoom,
  Submission,
  Vote,
  VoteResult,
} from '../types/dressCode';
import {
  generateRoomCode,
  getExpirationTime,
  calculateVoteResults,
} from '../types/dressCode';

const COLLECTION_NAME = 'dressCodeRooms';

/**
 * Compress and convert image to base64
 */
const compressAndConvertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Cannot get canvas context'));
          return;
        }

        // Calculate new dimensions (max 800px width/height)
        let width = img.width;
        let height = img.height;
        const maxSize = 800;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        resolve(base64);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Convert Firestore timestamps to Date objects
const convertFirestoreRoom = (data: any): DressCodeRoom => ({
  ...data,
  createdAt: data.createdAt?.toDate?.() || data.createdAt,
  expiresAt: data.expiresAt?.toDate?.() || data.expiresAt,
  submissions: (data.submissions || []).map((sub: any) => ({
    ...sub,
    submittedAt: sub.submittedAt?.toDate?.() || sub.submittedAt,
  })),
  votes: (data.votes || []).map((vote: any) => ({
    ...vote,
    votedAt: vote.votedAt?.toDate?.() || vote.votedAt,
  })),
});

/**
 * Create a new dress code voting room
 */
export const createRoom = async (hostName: string): Promise<{ roomCode: string; roomId: string }> => {
  let roomCode = generateRoomCode();
  let attempts = 0;
  const maxAttempts = 10;

  // Ensure unique room code
  while (attempts < maxAttempts) {
    const existing = await getRoomByCode(roomCode);
    if (!existing) break;
    roomCode = generateRoomCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Không thể tạo mã room duy nhất. Vui lòng thử lại.');
  }

  const roomId = `dresscode-${Date.now()}`;
  const roomRef = doc(db, COLLECTION_NAME, roomId);

  const newRoom: DressCodeRoom = {
    roomCode,
    hostName,
    createdAt: new Date(),
    expiresAt: getExpirationTime(),
    isCompleted: false,
    submissions: [],
    votes: [],
  };

  await setDoc(roomRef, {
    ...newRoom,
    createdAt: Timestamp.fromDate(newRoom.createdAt),
    expiresAt: Timestamp.fromDate(newRoom.expiresAt),
  });

  return { roomCode, roomId };
};

/**
 * Get room by code
 */
export const getRoomByCode = async (roomCode: string): Promise<DressCodeRoom | null> => {
  const q = query(collection(db, COLLECTION_NAME), where('roomCode', '==', roomCode));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const data = snapshot.docs[0].data();
  return convertFirestoreRoom(data);
};

/**
 * Get room by ID
 */
export const getRoomById = async (roomId: string): Promise<DressCodeRoom | null> => {
  const roomRef = doc(db, COLLECTION_NAME, roomId);
  const snapshot = await getDoc(roomRef);

  if (!snapshot.exists()) return null;

  return convertFirestoreRoom(snapshot.data());
};

/**
 * Convert photo to base64 (no need for Firebase Storage)
 */
export const uploadPhoto = async (file: File): Promise<string> => {
  // Validate file size (10MB max before compression)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('Ảnh quá lớn! Vui lòng chọn ảnh dưới 10MB.');
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Chỉ chấp nhận file ảnh!');
  }

  // Compress and convert to base64
  const base64 = await compressAndConvertToBase64(file);
  return base64;
};

/**
 * Submit entry (name, photo, message) to room
 */
export const submitEntry = async (
  roomCode: string,
  deviceId: string,
  name: string,
  photoURL: string,
  message: string
): Promise<void> => {
  const room = await getRoomByCode(roomCode);
  if (!room) {
    throw new Error('Không tìm thấy room!');
  }

  if (room.isCompleted) {
    throw new Error('Room đã kết thúc!');
  }

  // Find room document
  const q = query(collection(db, COLLECTION_NAME), where('roomCode', '==', roomCode));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error('Không tìm thấy room!');
  }

  const roomRef = snapshot.docs[0].ref;

  // Check if device already submitted
  const existingSubmission = room.submissions.find((sub) => sub.deviceId === deviceId);
  if (existingSubmission) {
    // Update existing submission
    const updatedSubmissions = room.submissions.map((sub) =>
      sub.deviceId === deviceId
        ? { deviceId, name, photoURL, message, submittedAt: new Date() }
        : sub
    );
    await updateDoc(roomRef, {
      submissions: updatedSubmissions.map((sub) => ({
        ...sub,
        submittedAt: Timestamp.fromDate(sub.submittedAt),
      })),
    });
  } else {
    // Add new submission
    const newSubmission: Submission = {
      deviceId,
      name,
      photoURL,
      message,
      submittedAt: new Date(),
    };
    await updateDoc(roomRef, {
      submissions: arrayUnion({
        ...newSubmission,
        submittedAt: Timestamp.fromDate(newSubmission.submittedAt),
      }),
    });
  }
};

/**
 * Submit votes (max 3 people, cannot vote for self)
 */
export const submitVotes = async (
  roomCode: string,
  deviceId: string,
  votedFor: string[]
): Promise<void> => {
  if (votedFor.length > 3) {
    throw new Error('Chỉ được vote tối đa 3 người!');
  }

  if (votedFor.includes(deviceId)) {
    throw new Error('Không được vote cho chính mình!');
  }

  const room = await getRoomByCode(roomCode);
  if (!room) {
    throw new Error('Không tìm thấy room!');
  }

  if (room.isCompleted) {
    throw new Error('Room đã kết thúc!');
  }

  // Find room document
  const q = query(collection(db, COLLECTION_NAME), where('roomCode', '==', roomCode));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error('Không tìm thấy room!');
  }

  const roomRef = snapshot.docs[0].ref;

  // Check if device already voted
  const existingVote = room.votes.find((vote) => vote.deviceId === deviceId);
  if (existingVote) {
    throw new Error('Bạn đã vote rồi! Không thể vote lại.');
  }

  // Add new vote
  const newVote: Vote = {
    deviceId,
    votedFor,
    votedAt: new Date(),
  };

  await updateDoc(roomRef, {
    votes: arrayUnion({
      ...newVote,
      votedAt: Timestamp.fromDate(newVote.votedAt),
    }),
  });
};

/**
 * Complete the room (show results)
 */
export const completeRoom = async (roomCode: string): Promise<VoteResult[]> => {
  const room = await getRoomByCode(roomCode);
  if (!room) {
    throw new Error('Không tìm thấy room!');
  }

  // Find room document
  const q = query(collection(db, COLLECTION_NAME), where('roomCode', '==', roomCode));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error('Không tìm thấy room!');
  }

  const roomRef = snapshot.docs[0].ref;

  await updateDoc(roomRef, {
    isCompleted: true,
  });

  return calculateVoteResults(room);
};

/**
 * Subscribe to room updates (realtime)
 */
export const subscribeToRoom = (
  roomCode: string,
  callback: (room: DressCodeRoom | null) => void
): (() => void) => {
  const q = query(collection(db, COLLECTION_NAME), where('roomCode', '==', roomCode));

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
      return;
    }

    const data = snapshot.docs[0].data();
    callback(convertFirestoreRoom(data));
  });
};

/**
 * Get current user's submission and vote status
 */
export const getUserStatus = (room: DressCodeRoom, deviceId: string) => {
  const hasSubmitted = room.submissions.some((sub) => sub.deviceId === deviceId);
  const hasVoted = room.votes.some((vote) => vote.deviceId === deviceId);
  const submission = room.submissions.find((sub) => sub.deviceId === deviceId);

  return { hasSubmitted, hasVoted, submission };
};

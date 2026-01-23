import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { joinSpyRoomByCode, addPlayerToSpyRoom } from '../services/spyRoomService';

const SpyJoinPage = () => {
  const navigate = useNavigate();
  const { roomId: urlRoomId } = useParams<{ roomId?: string }>();
  
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'code' | 'name'>('code');
  const [foundRoomId, setFoundRoomId] = useState<string | null>(null);

  // If URL has roomId, skip to name step
  useState(() => {
    if (urlRoomId) {
      setFoundRoomId(urlRoomId);
      setStep('name');
    }
  });

  const handleFindRoom = async () => {
    if (!roomCode.trim()) {
      setError('Vui lòng nhập mã phòng!');
      return;
    }

    try {
      setIsJoining(true);
      setError('');
      
      const roomId = await joinSpyRoomByCode(roomCode);
      
      if (!roomId) {
        setError('Không tìm thấy phòng hoặc phòng đã hết hạn!');
        return;
      }

      setFoundRoomId(roomId);
      setStep('name');
    } catch (error: any) {
      setError(error.message || 'Có lỗi xảy ra!');
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Vui lòng nhập tên của bạn!');
      return;
    }

    if (!foundRoomId) {
      setError('Không tìm thấy phòng!');
      return;
    }

    try {
      setIsJoining(true);
      setError('');
      
      const player = await addPlayerToSpyRoom(foundRoomId, playerName.trim());
      
      // Save player info to localStorage
      localStorage.setItem('spyPlayerId', player.id);
      localStorage.setItem('spyPlayerName', player.name);
      localStorage.setItem('spyRoomId', foundRoomId);
      
      // Navigate to player page
      navigate(`/spy/room/${foundRoomId}`);
    } catch (error: any) {
      if (error.message.includes('already taken')) {
        setError('Tên này đã có người dùng! Vui lòng chọn tên khác.');
      } else {
        setError(error.message || 'Không thể tham gia phòng!');
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Tham Gia Phòng
          </h1>
          <p className="text-white/70 text-lg">加入房间</p>
        </div>

        {/* Step 1: Enter Room Code */}
        {step === 'code' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6">
              <label className="text-white font-semibold block mb-2">
                Nhập mã phòng (6 ký tự):
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleFindRoom()}
                placeholder="ABC123"
                maxLength={6}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-4 text-white text-center text-2xl font-mono placeholder-white/40 focus:outline-none focus:border-purple-500"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4"
              >
                <p className="text-red-200 text-sm text-center">⚠️ {error}</p>
              </motion.div>
            )}

            <button
              onClick={handleFindRoom}
              disabled={isJoining || !roomCode}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isJoining ? '🔍 Đang tìm phòng...' : '➡️ TIẾP TỤC'}
            </button>
          </motion.div>
        )}

        {/* Step 2: Enter Name */}
        {step === 'name' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6">
              <label className="text-white font-semibold block mb-2">
                Nhập tên của bạn:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                placeholder="Nguyễn Văn A"
                maxLength={30}
                autoFocus
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-4 text-white text-center text-xl placeholder-white/40 focus:outline-none focus:border-purple-500"
              />
              <p className="text-white/50 text-xs mt-2 text-center">
                Tên này sẽ hiển thị cho mọi người trong game
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4"
              >
                <p className="text-red-200 text-sm text-center">⚠️ {error}</p>
              </motion.div>
            )}

            <button
              onClick={handleJoinRoom}
              disabled={isJoining || !playerName}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isJoining ? '⏳ Đang tham gia...' : '✅ THAM GIA NGAY'}
            </button>

            {/* Back button */}
            {!urlRoomId && (
              <button
                onClick={() => {
                  setStep('code');
                  setFoundRoomId(null);
                  setError('');
                }}
                className="w-full mt-3 text-white/60 hover:text-white transition-colors"
              >
                ← Quay lại nhập mã
              </button>
            )}
          </motion.div>
        )}

        {/* Create Room Option */}
        <div className="mt-8 text-center">
          <p className="text-white/60 mb-3">Chưa có phòng?</p>
          <button
            onClick={() => navigate('/spy/create')}
            className="text-white/80 hover:text-white underline transition-colors"
          >
            Tạo phòng mới →
          </button>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            ← Quay lại trang chủ
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SpyJoinPage;

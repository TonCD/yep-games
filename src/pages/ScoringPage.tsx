import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createRoom, joinRoomByCode } from '../services/roomService';

const ScoringPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [hostName, setHostName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [judgeName, setJudgeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create room as host
  const handleCreateRoom = async () => {
    if (!hostName.trim()) {
      setError('Vui lòng nhập tên host');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { roomId, roomCode: code } = await createRoom(hostName.trim());
      navigate(`/scoring/room/${roomId}`, { state: { roomCode: code, isHost: true } });
    } catch (err) {
      setError('Không thể tạo phòng. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Join room as judge
  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !judgeName.trim()) {
      setError('Vui lòng nhập đầy đủ mã phòng và tên giám khảo');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const roomId = await joinRoomByCode(roomCode.trim());
      
      if (!roomId) {
        setError('Không tìm thấy phòng hoặc phòng đã hết hạn');
        setLoading(false);
        return;
      }
      
      // Navigate to judge page - will add judge there
      navigate(`/scoring/judge/${roomId}/join`, { state: { judgeName: judgeName.trim() } });
    } catch (err) {
      setError('Không thể tham gia phòng. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-white hover:text-white/80 transition-colors flex items-center gap-2"
          >
            <span className="text-2xl">←</span>
            <span className="font-semibold">Trang chủ</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            🎭 Chấm Điểm Tiết Mục
          </h1>
          <div className="w-24"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          {mode === 'select' && (
            <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                Chọn vai trò
              </h2>
              
              <button
                onClick={() => setMode('create')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                🎯 Tạo phòng (Host)
              </button>
              
              <button
                onClick={() => setMode('join')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                ⭐ Tham gia (Giám khảo)
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Tạo phòng chấm điểm
                </h2>
                <button
                  onClick={() => setMode('select')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên Host
                </label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-bold transition-all"
              >
                {loading ? 'Đang tạo phòng...' : 'Tạo phòng'}
              </button>

              <p className="text-sm text-gray-600 text-center">
                💡 Phòng sẽ tự động hết hạn sau 12 giờ
              </p>
            </div>
          )}

          {mode === 'join' && (
            <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Tham gia phòng
                </h2>
                <button
                  onClick={() => setMode('select')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mã phòng
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã 6 ký tự (VD: ABC123)"
                  maxLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none uppercase text-center text-2xl font-bold tracking-wider"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên giám khảo
                </label>
                <input
                  type="text"
                  value={judgeName}
                  onChange={(e) => setJudgeName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleJoinRoom}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-bold transition-all"
              >
                {loading ? 'Đang tham gia...' : 'Tham gia'}
              </button>

              <p className="text-sm text-gray-600 text-center">
                🔑 Nhận mã phòng từ host để tham gia
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ScoringPage;

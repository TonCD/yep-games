import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../services/dressCodeService';

export default function DressCodeVotingPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [hostName, setHostName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!hostName.trim()) {
      setError('Vui lòng nhập tên của bạn!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { roomCode, roomId } = await createRoom(hostName.trim());
      // Navigate to host room page
      navigate(`/dresscode/room/${roomCode}`, { state: { roomId } });
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      setError('Vui lòng nhập mã room!');
      return;
    }

    // Navigate to participant page
    navigate(`/dresscode/join/${roomCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4">
            👗 Dresscode Vote
          </h1>
          <p className="text-gray-600 text-lg">
            Bình chọn trang phục đẹp nhất!
          </p>
        </div>

        {mode === 'menu' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🎨 Tạo Phòng Bình Chọn (Host)
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              📱 Tham Gia Bình Chọn
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => {
                setMode('menu');
                setError('');
                setHostName('');
              }}
              className="text-gray-600 hover:text-gray-800 mb-6 flex items-center gap-2"
            >
              ← Quay lại
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Tạo Phòng Bình Chọn
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Tên của bạn (Host)
                </label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                  placeholder="Nhập tên của bạn..."
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tạo...' : '🚀 Tạo Phòng'}
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => {
                setMode('menu');
                setError('');
                setRoomCode('');
              }}
              className="text-gray-600 hover:text-gray-800 mb-6 flex items-center gap-2"
            >
              ← Quay lại
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Tham Gia Bình Chọn
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Mã Room (6 ký tự)
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center text-2xl font-mono tracking-wider"
                  placeholder="ABC123"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleJoinRoom}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                📱 Tham Gia
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

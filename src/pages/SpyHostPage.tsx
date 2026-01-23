import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  subscribeToSpyRoom, 
  startSpyGame, 
  eliminatePlayer,
  removePlayerFromSpyRoom,
  endSpyGame 
} from '../services/spyRoomService';
import type { SpyRoom } from '../types/spy';

const SpyHostPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState<SpyRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [revealedRoles, setRevealedRoles] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'civilian' | 'spy'>('all');
  
  // Setup form state
  const [spyCount, setSpyCount] = useState(3);
  const [civilianKeyword, setCivilianKeyword] = useState('');
  const [spyKeyword, setSpyKeyword] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/spy/create');
      return;
    }

    const unsubscribe = subscribeToSpyRoom(roomId, (roomData) => {
      if (roomData) {
        setRoom(roomData);
        setLoading(false);
      } else {
        alert('Phòng không tồn tại hoặc đã hết hạn!');
        navigate('/spy/create');
      }
    });

    return () => unsubscribe();
  }, [roomId, navigate]);

  const copyRoomLink = () => {
    const link = `${window.location.origin}/spy/room/${roomId}`;
    navigator.clipboard.writeText(link);
    alert('Đã copy link phòng! 📋');
  };

  const handleStartGame = async () => {
    if (!roomId || !room) return;
    
    if (!civilianKeyword.trim() || !spyKeyword.trim()) {
      alert('Vui lòng nhập đầy đủ từ khóa!');
      return;
    }

    if (room.players.length < 3) {
      alert('Cần ít nhất 3 người chơi để bắt đầu!');
      return;
    }

    if (spyCount < 1 || spyCount >= room.players.length) {
      alert(`Số gián điệp phải từ 1 đến ${room.players.length - 1}!`);
      return;
    }

    try {
      setIsStarting(true);
      await startSpyGame(roomId, spyCount, civilianKeyword, spyKeyword);
      setShowSetupModal(false);
    } catch (error: any) {
      alert(error.message || 'Không thể bắt đầu game!');
    } finally {
      setIsStarting(false);
    }
  };

  const handleEliminatePlayer = async (playerId: string, playerName: string) => {
    if (!roomId) return;
    
    const confirm = window.confirm(`Loại ${playerName} khỏi game?`);
    if (!confirm) return;

    try {
      await eliminatePlayer(roomId, playerId);
    } catch (error) {
      alert('Không thể loại người chơi!');
    }
  };

  const handleRemovePlayer = async (playerId: string, playerName: string) => {
    if (!roomId || !room) return;
    
    const confirm = window.confirm(`Xóa ${playerName} khỏi phòng?`);
    if (!confirm) return;

    try {
      await removePlayerFromSpyRoom(roomId, playerId);
    } catch (error) {
      alert('Không thể xóa người chơi!');
    }
  };

  const toggleRoleVisibility = (playerId: string) => {
    setRevealedRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const handleEndGame = async () => {
    if (!roomId) return;
    
    const confirm = window.confirm('Kết thúc game và tạo phòng mới?');
    if (!confirm) return;

    try {
      await endSpyGame(roomId);
      navigate('/spy/create');
    } catch (error) {
      alert('Không thể kết thúc game!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">⏳ Đang tải...</div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  const alivePlayers = room.players.filter(p => p.status === 'alive');
  const eliminatedPlayers = room.players.filter(p => p.status === 'eliminated');
  
  const filteredAlivePlayers = filter === 'all' 
    ? alivePlayers 
    : alivePlayers.filter(p => p.role === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                🕵️ PHÒNG GIÁN ĐIỆP
              </h1>
              <p className="text-white/70">间谍游戏房间</p>
            </div>
            <div className="text-right">
              <div className="text-white/70 text-sm">Mã phòng</div>
              <div className="text-2xl font-bold text-white">{room.code}</div>
            </div>
          </div>

          {/* Room Link */}
          <div className="flex gap-2">
            <input
              type="text"
              value={`${window.location.origin}/spy/room/${roomId}`}
              readOnly
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm"
            />
            <button
              onClick={copyRoomLink}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              📋 Copy
            </button>
          </div>

          {/* Game Info */}
          {room.status === 'playing' && room.settings && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30">
                <div className="text-green-200 text-xs mb-1">Từ Dân Thường</div>
                <div className="text-white font-bold">{room.settings.civilianKeyword}</div>
              </div>
              <div className="bg-red-500/20 rounded-lg p-3 border border-red-500/30">
                <div className="text-red-200 text-xs mb-1">Từ Gián Điệp</div>
                <div className="text-white font-bold">{room.settings.spyKeyword}</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Players Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          {/* Status Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white">
                NGƯỜI CHƠI ({room.players.length})
              </h2>
              {room.status === 'waiting' && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-200 rounded-full text-sm">
                  ⏳ Đang chờ
                </span>
              )}
              {room.status === 'playing' && (
                <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm">
                  🎮 Đang chơi
                </span>
              )}
            </div>

            {/* Start Button */}
            {room.status === 'waiting' && (
              <button
                onClick={() => setShowSetupModal(true)}
                disabled={room.players.length < 3}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎮 BẮT ĐẦU GAME
              </button>
            )}

            {room.status === 'playing' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSetupModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                >
                  🔄 GAME MỚI
                </button>
                <button
                  onClick={handleEndGame}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                >
                  🏁 KẾT THÚC
                </button>
              </div>
            )}
          </div>

          {/* Filter (Only when playing) */}
          {room.status === 'playing' && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'all' 
                    ? 'bg-white text-purple-900' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter('civilian')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'civilian' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                🟢 Dân
              </button>
              <button
                onClick={() => setFilter('spy')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'spy' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                🔴 Gián điệp
              </button>
            </div>
          )}

          {/* Alive Players */}
          {alivePlayers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">
                ĐANG CHƠI ({filteredAlivePlayers.length})
              </h3>
              <div className="space-y-2">
                {filteredAlivePlayers.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-white/50 font-mono text-sm">#{index + 1}</div>
                      
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex-shrink-0">
                        <img 
                          src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="text-white font-semibold">{player.name}</div>
                      
                      {/* Role Badge (revealed) */}
                      {room.status === 'playing' && revealedRoles.has(player.id) && (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          player.role === 'spy' 
                            ? 'bg-red-500/20 text-red-200' 
                            : 'bg-green-500/20 text-green-200'
                        }`}>
                          {player.role === 'spy' ? '🔴 Gián điệp' : '🟢 Dân'}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {/* Toggle Role Visibility */}
                      {room.status === 'playing' && (
                        <button
                          onClick={() => toggleRoleVisibility(player.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Xem/ẩn role"
                        >
                          <span className="text-xl">{revealedRoles.has(player.id) ? '👁️' : '🙈'}</span>
                        </button>
                      )}

                      {/* Eliminate/Remove Button */}
                      {room.status === 'playing' ? (
                        <button
                          onClick={() => handleEliminatePlayer(player.id, player.name)}
                          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg text-sm font-semibold transition-colors"
                        >
                          🗑️ Loại
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemovePlayer(player.id, player.name)}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Eliminated Players */}
          {eliminatedPlayers.length > 0 && (
            <div>
              <h3 className="text-white/70 font-semibold mb-3">
                ĐÃ BỊ LOẠI ({eliminatedPlayers.length})
              </h3>
              <div className="space-y-2">
                {eliminatedPlayers.map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center justify-between opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">❌</span>
                      
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex-shrink-0">
                        <img 
                          src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
                          alt={player.name}
                          className="w-full h-full object-cover grayscale"
                        />
                      </div>
                      
                      <span className="text-white line-through">{player.name}</span>
                      {player.role && (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          player.role === 'spy' 
                            ? 'bg-red-500/20 text-red-200' 
                            : 'bg-green-500/20 text-green-200'
                        }`}>
                          {player.role === 'spy' ? 'Gián điệp' : 'Dân'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {room.players.length === 0 && (
            <div className="text-center py-12 text-white/50">
              <div className="text-6xl mb-4">👥</div>
              <p>Chưa có người chơi nào</p>
              <p className="text-sm mt-2">Chia sẻ link để mời người chơi!</p>
            </div>
          )}
        </motion.div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white transition-colors"
          >
            ← Quay lại trang chủ
          </button>
        </div>
      </div>

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowSetupModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-900 to-gray-900 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                ⚙️ THIẾT LẬP GAME
              </h2>

              {/* Player Count */}
              <div className="mb-4 text-center">
                <p className="text-white/70 mb-2">
                  Số người chơi hiện tại: <span className="text-white font-bold text-xl">{room.players.length}</span>
                </p>
              </div>

              {/* Spy Count */}
              <div className="mb-4">
                <label className="text-white font-semibold block mb-2">
                  Số lượng gián điệp:
                </label>
                <input
                  type="number"
                  min="1"
                  max={room.players.length - 1}
                  value={spyCount}
                  onChange={(e) => setSpyCount(Math.min(Math.max(1, Number(e.target.value)), room.players.length - 1))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-center text-xl font-bold"
                />
                <p className="text-white/50 text-xs mt-1">
                  Tối đa: {room.players.length - 1} | Khuyên dùng: {Math.max(1, Math.floor(room.players.length / 5))} - {Math.max(2, Math.floor(room.players.length / 4))} gián điệp
                </p>
              </div>

              {/* Civilian Keyword */}
              <div className="mb-4">
                <label className="text-white font-semibold block mb-2">
                  Từ khóa DÂN THƯỜNG:
                </label>
                <input
                  type="text"
                  value={civilianKeyword}
                  onChange={(e) => setCivilianKeyword(e.target.value)}
                  placeholder='Ví dụ: "Táo"'
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40"
                />
              </div>

              {/* Spy Keyword */}
              <div className="mb-6">
                <label className="text-white font-semibold block mb-2">
                  Từ khóa GIÁN ĐIỆP:
                </label>
                <input
                  type="text"
                  value={spyKeyword}
                  onChange={(e) => setSpyKeyword(e.target.value)}
                  placeholder='Ví dụ: "Trái cây"'
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  ❌ Hủy
                </button>
                <button
                  onClick={handleStartGame}
                  disabled={isStarting || !civilianKeyword || !spyKeyword}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStarting ? '⏳ Đang bắt đầu...' : '✅ PHÁT TỪ KHÓA'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpyHostPage;

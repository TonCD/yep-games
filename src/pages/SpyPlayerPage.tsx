import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToSpyRoom } from '../services/spyRoomService';
import type { SpyRoom, SpyPlayer } from '../types/spy';

const SpyPlayerPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState<SpyRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<SpyPlayer | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/spy/join');
      return;
    }

    // Get player info from localStorage
    const playerId = localStorage.getItem('spyPlayerId');
    const storedRoomId = localStorage.getItem('spyRoomId');

    if (!playerId || storedRoomId !== roomId) {
      // Player not registered, redirect to join
      navigate(`/spy/join/${roomId}`);
      return;
    }

    const unsubscribe = subscribeToSpyRoom(roomId, (roomData) => {
      if (roomData) {
        setRoom(roomData);
        
        // Find current player
        const player = roomData.players.find(p => p.id === playerId);
        if (player) {
          setCurrentPlayer(player);
        } else {
          // Player was removed
          alert('Bạn đã bị xóa khỏi phòng!');
          localStorage.removeItem('spyPlayerId');
          localStorage.removeItem('spyPlayerName');
          localStorage.removeItem('spyRoomId');
          navigate('/spy/join');
        }
        
        setLoading(false);
      } else {
        alert('Phòng không tồn tại hoặc đã hết hạn!');
        navigate('/spy/join');
      }
    });

    return () => unsubscribe();
  }, [roomId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">⏳ Đang tải...</div>
      </div>
    );
  }

  if (!room || !currentPlayer) {
    return null;
  }

  const isEliminated = currentPlayer.status === 'eliminated';
  const keyword = currentPlayer.role === 'spy' 
    ? room.settings?.spyKeyword 
    : room.settings?.civilianKeyword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="container mx-auto max-w-2xl">
        
        {/* WAITING STATUS */}
        {room.status === 'waiting' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center"
          >
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-3xl font-bold text-white mb-2">ĐANG CHỜ...</h1>
            <p className="text-white/70 mb-6">等待中...</p>
            
            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <div className="text-white/70 text-sm mb-2">Phòng</div>
              <div className="text-3xl font-bold text-white mb-4">#{room.code}</div>
              
              <div className="text-white/70 text-sm mb-2">Bạn</div>
              <div className="text-xl font-semibold text-white">{currentPlayer.name}</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <h3 className="text-white font-semibold mb-3">
                Người chơi khác ({room.players.length - 1}):
              </h3>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {room.players
                  .filter(p => p.id !== currentPlayer.id)
                  .map(player => (
                    <div key={player.id} className="text-white/70 text-sm">
                      • {player.name}
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-yellow-200">
              <div className="animate-pulse">⏰</div>
              <p>Đang chờ Host bắt đầu game...</p>
            </div>
          </motion.div>
        )}

        {/* PLAYING STATUS - ALIVE */}
        {room.status === 'playing' && !isEliminated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Keyword Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 mb-6 border-4 border-white/30 shadow-2xl text-center"
            >
              <div className="text-white/80 text-sm mb-2">TỪ KHÓA CỦA BẠN</div>
              <div className="text-5xl font-bold text-white mb-4 break-words">
                🔑 {keyword || '???'}
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2 inline-block">
                <p className="text-white text-xs font-semibold">
                  ⚠️ HÃY GHI NHỚ - KHÔNG NÓI TRỰC TIẾP!
                </p>
              </div>
            </motion.div>

            {/* Instructions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">📖 HƯỚNG DẪN CHƠI</h2>
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {showInstructions ? '🔼' : '🔽'}
                </button>
              </div>

              <AnimatePresence>
                {showInstructions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 text-white/80 text-sm">
                      <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                        <h3 className="font-bold text-green-200 mb-2">🎯 MỤC TIÊU:</h3>
                        <ul className="space-y-1 pl-4">
                          <li>• <strong>Nếu bạn là DÂN:</strong> Tìm ra gián điệp</li>
                          <li>• <strong>Nếu bạn là GIÁN ĐIỆP:</strong> Tránh bị phát hiện và đoán ra từ khóa gốc</li>
                        </ul>
                      </div>

                      <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
                        <h3 className="font-bold text-blue-200 mb-2">📝 CÁCH CHƠI:</h3>
                        <ol className="space-y-1 pl-4 list-decimal">
                          <li>Theo chiều kim đồng hồ, mỗi người nói 1 từ MÔ TẢ liên quan từ khóa</li>
                          <li><strong>Gián điệp:</strong> Nói chung chung để MÒ từ khóa</li>
                          <li><strong>Dân thường:</strong> Nói vừa đủ cụ thể, đừng quá dễ</li>
                          <li>Sau 1 vòng → Vote loại 1 người (ngoài đời)</li>
                          <li>Host sẽ loại người bị vote nhiều nhất</li>
                        </ol>
                      </div>

                      <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/30">
                        <h3 className="font-bold text-red-200 mb-2">⚠️ LƯU Ý:</h3>
                        <ul className="space-y-1 pl-4">
                          <li>• <strong>KHÔNG</strong> được nói trực tiếp từ khóa!</li>
                          <li>• Quan sát kỹ ai nói khác lạ!</li>
                          <li>• Gián điệp cũng phải tham gia vote</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-white/70 text-sm">Trạng thái</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🟢</span>
                    <span className="text-white font-bold text-xl">ĐANG CHƠI</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/70 text-sm">Phòng</div>
                  <div className="text-white font-bold text-xl">#{room.code}</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-white/70 text-sm mb-2">Người chơi còn lại</div>
                <div className="text-3xl font-bold text-white">
                  {room.players.filter(p => p.status === 'alive').length} / {room.players.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* PLAYING STATUS - ELIMINATED */}
        {room.status === 'playing' && isEliminated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center"
          >
            <div className="text-8xl mb-6">❌</div>
            <h1 className="text-4xl font-bold text-white mb-2">BẠN ĐÃ BỊ LOẠI!</h1>
            <p className="text-white/70 text-xl mb-8">你被淘汰了！</p>

            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <div className="text-white/70 text-sm mb-2">Bạn</div>
              <div className="text-2xl font-bold text-white mb-4">{currentPlayer.name}</div>
              
              <div className="text-white/70 text-sm mb-2">Role thật của bạn</div>
              <div className={`inline-block px-4 py-2 rounded-full font-bold text-lg ${
                currentPlayer.role === 'spy' 
                  ? 'bg-red-500/20 text-red-200' 
                  : 'bg-green-500/20 text-green-200'
              }`}>
                {currentPlayer.role === 'spy' ? '🔴 GIÁN ĐIỆP' : '🟢 DÂN THƯỜNG'}
              </div>

              {currentPlayer.role && (
                <div className="mt-4 text-white/70">
                  Từ khóa của bạn: <span className="text-white font-bold">{keyword}</span>
                </div>
              )}
            </div>

            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-200 text-sm">
                👀 Theo dõi game tiếp tục ngoài đời...
              </p>
            </div>

            <div className="text-white/60 text-sm">
              Người chơi còn lại: {room.players.filter(p => p.status === 'alive').length} / {room.players.length}
            </div>
          </motion.div>
        )}

        {/* ENDED STATUS */}
        {room.status === 'ended' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center"
          >
            <div className="text-6xl mb-4">🏁</div>
            <h1 className="text-3xl font-bold text-white mb-2">GAME ĐÃ KẾT THÚC</h1>
            <p className="text-white/70 mb-8">游戏已结束</p>

            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <div className="text-white/70 mb-4">Cảm ơn đã tham gia!</div>
              {currentPlayer.role && (
                <div>
                  <div className="text-white/70 text-sm mb-2">Role của bạn</div>
                  <div className={`inline-block px-4 py-2 rounded-full font-bold ${
                    currentPlayer.role === 'spy' 
                      ? 'bg-red-500/20 text-red-200' 
                      : 'bg-green-500/20 text-green-200'
                  }`}>
                    {currentPlayer.role === 'spy' ? '🔴 GIÁN ĐIỆP' : '🟢 DÂN THƯỜNG'}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('spyPlayerId');
                localStorage.removeItem('spyPlayerName');
                localStorage.removeItem('spyRoomId');
                navigate('/spy/join');
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              🎮 CHƠI PHÒNG MỚI
            </button>
          </motion.div>
        )}

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn rời phòng?')) {
                localStorage.removeItem('spyPlayerId');
                localStorage.removeItem('spyPlayerName');
                localStorage.removeItem('spyRoomId');
                navigate('/');
              }
            }}
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            ← Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpyPlayerPage;

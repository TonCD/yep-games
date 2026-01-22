import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSound, SOUNDS } from '../hooks/useSound';
import { subscribeToRoom, addJudge, addPerformance, removeJudge, completeRoom, calculateRanking } from '../services/roomService';
import type { Room } from '../types/room';

const ScoringRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const roomCode = location.state?.roomCode || '';
  
  const [room, setRoom] = useState<Room | null>(null);
  const [judgeName, setJudgeName] = useState('');
  const [performanceName, setPerformanceName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedJudgeId, setCopiedJudgeId] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedRanks, setRevealedRanks] = useState<number[]>([]);
  const [showQuestion, setShowQuestion] = useState(false);
  const { play } = useSound();

  // Countdown reveal animation
  const triggerCountdownReveal = async (ranking: any[]) => {
    // First show question for 3 seconds
    setShowQuestion(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setShowQuestion(false);
    
    setIsRevealing(true);
    const topCount = Math.min(5, ranking.length);
    
    // Reveal from bottom to top (top 5 → top 1)
    for (let i = topCount - 1; i >= 0; i--) {
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s delay between each
      setRevealedRanks(prev => [...prev, i]);
      
      // Confetti for top 1
      if (i === 0) {
        setTimeout(() => {
          triggerConfetti();
          // Play applause sound for winner
          play(SOUNDS.applause, { volume: 0.4 });
        }, 500);
      }
    }
    
    // Reveal all remaining after top 5
    setTimeout(() => {
      const remainingRanks = ranking.map((_, idx) => idx).filter(idx => idx >= topCount);
      setRevealedRanks(prev => [...prev, ...remainingRanks]);
    }, 2000);
  };

  // Confetti animation for winner
  const triggerConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      if (updatedRoom === null) {
        setError('Phòng đã hết hạn hoặc không tồn tại');
        setRoom(null);
      } else {
        setRoom(updatedRoom);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleAddJudge = async () => {
    if (!judgeName.trim() || !roomId) return;
    
    try {
      const newJudge = await addJudge(roomId, judgeName.trim());
      setJudgeName('');
      // Auto copy link
      const judgeLink = `${window.location.origin}/scoring/judge/${roomId}/${newJudge.token}`;
      navigator.clipboard.writeText(judgeLink);
      setCopiedJudgeId(newJudge.id);
      setTimeout(() => setCopiedJudgeId(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Không thể thêm giám khảo');
    }
  };

  const handleAddPerformance = async () => {
    if (!performanceName.trim() || !roomId) return;
    
    try {
      await addPerformance(roomId, performanceName.trim());
      setPerformanceName('');
    } catch (err) {
      console.error(err);
      alert('Không thể thêm tiết mục');
    }
  };

  const handleRemoveJudge = async (judgeId: string) => {
    if (!roomId || !window.confirm('Xóa giám khảo này? Tất cả điểm của họ sẽ bị xóa.')) return;
    
    try {
      await removeJudge(roomId, judgeId);
    } catch (err) {
      console.error(err);
      alert('Không thể xóa giám khảo');
    }
  };

  const handleCompleteRoom = async () => {
    if (!roomId || !room) return;
    
    const ranking = calculateRanking(room);
    const allComplete = ranking.every(r => r.judgeCount === room.judges.length);
    
    // Always confirm before completing
    let confirmMessage = 'Bạn có chắc chắn muốn KẾT THÚC và xem kết quả?\n\n';
    if (!allComplete) {
      confirmMessage += '⚠️ Chưa tất cả giám khảo chấm xong!\n\n';
    }
    confirmMessage += '✓ Kết quả sẽ được công bố ngay lập tức\n✓ Không thể thay đổi sau khi kết thúc';
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      await completeRoom(roomId);
      // Start countdown reveal
      await triggerCountdownReveal(ranking);
    } catch (err) {
      console.error(err);
      alert('Không thể kết thúc phòng');
    }
  };

  const copyJudgeLink = (judgeId: string, token: string) => {
    const judgeLink = `${window.location.origin}/scoring/judge/${roomId}/${token}`;
    navigator.clipboard.writeText(judgeLink);
    setCopiedJudgeId(judgeId);
    setTimeout(() => setCopiedJudgeId(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Đang tải...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
          <p className="text-gray-700 mb-6">{error || 'Không tìm thấy phòng'}</p>
          <Link
            to="/scoring"
            className="block text-center bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-bold"
          >
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  const ranking = calculateRanking(room);
  const timeRemaining = Math.max(0, room.expiresAt - Date.now());
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 pb-12">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link
              to="/scoring"
              className="text-white hover:text-white/80 transition-colors flex items-center gap-2"
            >
              <span className="text-2xl">←</span>
              <span className="font-semibold">Quay lại</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              🎯 Host Control Panel | 主持控制面板
            </h1>
            <div className="w-24"></div>
          </div>
          
          {/* Room Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-sm opacity-80">Mã phòng:</span>
                <span className="ml-2 text-2xl font-bold tracking-wider">{roomCode}</span>
              </div>
              <div className="text-sm">
                <div className="opacity-80">Host: {room.hostName}</div>
                <div className="opacity-80">Hết hạn sau: {hoursRemaining}h {minutesRemaining}m</div>
              </div>
            </div>
            
            <div className="flex gap-4 text-sm">
              <div className="bg-white/20 px-3 py-1 rounded-lg">
                👥 {room.judges.length} giám khảo
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-lg">
                🎭 {room.performances.length} tiết mục
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Complete Button - Top Right */}
        {!room.isCompleted && (
          <div className="flex justify-end mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCompleteRoom}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-2xl"
            >
              🏁 Kết Thúc & Xem Kết Quả
            </motion.button>
          </div>
        )}

        {/* Top Section: Judges & Performances in 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Judges List */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              👥 Danh sách Giám Khảo
            </h2>
            
            {/* Add Judge Input */}
            {!room.isCompleted && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={judgeName}
                  onChange={(e) => setJudgeName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddJudge()}
                  placeholder="Thêm giám khảo..."
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={handleAddJudge}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Thêm
                </button>
              </div>
            )}
            
            {room.judges.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">Chưa có giám khảo nào</p>
                <p className="text-sm">Thêm giám khảo hoặc chia sẻ mã <span className="font-bold text-purple-600">{roomCode}</span></p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {room.judges.map((judge) => (
                  <motion.div
                    key={judge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg"
                  >
                    <img
                      src={judge.avatar}
                      alt={judge.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{judge.name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(judge.joinedAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <button
                      onClick={() => copyJudgeLink(judge.id, judge.token)}
                      className="text-blue-500 hover:text-blue-700 text-sm px-3 py-1 border border-blue-500 rounded"
                    >
                      {copiedJudgeId === judge.id ? '✓ Copied' : '📋 Link'}
                    </button>
                    {!room.isCompleted && (
                      <button
                        onClick={() => handleRemoveJudge(judge.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Performances List */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🎭 Danh sách Tiết Mục
            </h2>
            
            {/* Add Performance Input */}
            {!room.isCompleted && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={performanceName}
                  onChange={(e) => setPerformanceName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPerformance()}
                  placeholder="Thêm tiết mục..."
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                />
                <button
                  onClick={handleAddPerformance}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Thêm
                </button>
              </div>
            )}

            {room.performances.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">Chưa có tiết mục nào</p>
                <p className="text-sm mt-2">Thêm tiết mục để bắt đầu</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {room.performances.map((perf, index) => {
                  const perfScores = room.scores.filter(s => s.performanceId === perf.id);
                  const judgedCount = perfScores.length;
                  const isComplete = judgedCount === room.judges.length && room.judges.length > 0;
                  
                  return (
                    <motion.div
                      key={perf.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-pink-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-800">
                          #{index + 1} - {perf.name}
                        </div>
                        <div className={`text-sm px-2 py-1 rounded ${
                          isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {judgedCount}/{room.judges.length || 0}
                          {isComplete && ' ✓'}
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isComplete ? 'bg-green-500' : 'bg-pink-400'
                          }`}
                          style={{ width: `${room.judges.length > 0 ? (judgedCount / room.judges.length) * 100 : 0}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Results Section - Hidden until completed */}
        {room.isCompleted && (
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            {showQuestion ? (
              // Question screen before reveal
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
                  Tiết mục nào sẽ giành chiến thắng?
                </h2>
                <p className="text-2xl md:text-3xl text-gray-600">
                  哪个节目会获胜？
                </p>
              </motion.div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                  🏆 KẾT QUẢ CHÍNH THỨC
                </h2>

            {ranking.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Không có tiết mục nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {ranking.map((item, index) => {
                    const isRevealed = revealedRanks.includes(index);
                    const allJudgesScored = item.judgeCount === room.judges.length;
                    const bgClass = 
                      index === 0 && allJudgesScored
                        ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600'
                        : index === 1 && allJudgesScored
                        ? 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500'
                        : index === 2 && allJudgesScored
                        ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600'
                        : 'bg-gray-100';

                    if (!isRevealed && isRevealing) return null;

                    return (
                      <motion.div
                        key={item.performance.id}
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          scale: index === 0 && isRevealed ? 1.05 : 1 
                        }}
                        transition={{ 
                          type: "spring",
                          stiffness: 200,
                          damping: 20
                        }}
                        className={`p-6 rounded-xl ${bgClass} ${
                          index < 3 && allJudgesScored ? 'text-white' : 'text-gray-800'
                        } ${index === 0 && isRevealed ? 'ring-4 ring-yellow-300 shadow-2xl' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-5xl font-bold">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                            <div>
                              <div className="font-bold text-2xl">
                                {item.performance.name}
                              </div>
                              <div className={`text-sm ${index < 3 && allJudgesScored ? 'text-white/80' : 'text-gray-600'}`}>
                                {item.judgeCount}/{room.judges.length} giám khảo đã chấm
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-5xl font-bold">
                              {item.averageScore.toFixed(2)}
                            </div>
                            <div className={`text-sm ${index < 3 && allJudgesScored ? 'text-white/80' : 'text-gray-600'}`}>
                              Tổng: {item.totalScore}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
              </>
            )}
          </div>
        )}

        {/* Status before completion */}
        {!room.isCompleted && ranking.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4">📊 Trạng thái chấm điểm</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ranking.slice(0, 3).map((item, idx) => (
                <div key={item.performance.id} className="text-center">
                  <div className="text-3xl mb-1">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className="text-sm opacity-80">{item.performance.name}</div>
                  <div className="text-xs opacity-60">
                    {item.judgeCount}/{room.judges.length}
                  </div>
                </div>
              ))}
              <div className="text-center">
                <div className="text-3xl mb-1">📝</div>
                <div className="text-sm opacity-80">Tổng tiết mục</div>
                <div className="text-2xl font-bold">{room.performances.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoringRoomPage;

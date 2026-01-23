import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSound, SOUNDS } from '../hooks/useSound';
import type { DressCodeRoom, VoteResult } from '../types/dressCode';
import { calculateVoteResults } from '../types/dressCode';
import { subscribeToRoom, completeRoom, getRoomByCode } from '../services/dressCodeService';
import { useAlert } from '../contexts/AlertContext';

export default function DressCodeRoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();
  const [room, setRoom] = useState<DressCodeRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [revealedRanks, setRevealedRanks] = useState<number[]>([]);
  const [results, setResults] = useState<VoteResult[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showPodium, setShowPodium] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const { play } = useSound();

  useEffect(() => {
    if (!roomCode) {
      navigate('/dresscode/create');
      return;
    }

    // Check if room exists
    getRoomByCode(roomCode)
      .then((foundRoom) => {
        if (!foundRoom) {
          setError('Không tìm thấy room!');
          setLoading(false);
          return;
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Có lỗi xảy ra!');
        setLoading(false);
      });

    // Subscribe to real-time updates
    const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
      if (updatedRoom) {
        setRoom(updatedRoom);
        if (updatedRoom.isCompleted && !showResults) {
          const voteResults = calculateVoteResults(updatedRoom);
          setResults(voteResults);
          setShowResults(true);
          startCountdownAnimation(voteResults);
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode, navigate]);

  const startCountdownAnimation = (voteResults: VoteResult[]) => {
    if (voteResults.length < 3) {
      setRevealedRanks([0, 1, 2]);
      setShowPodium(true);
      return;
    }

    // First show question for 3 seconds
    setShowQuestion(true);
    setTimeout(() => {
      setShowQuestion(false);
      setIsRevealing(true);

    // Reveal from bottom to top: rank 3 → 2 → 1
    setTimeout(() => {
      play(SOUNDS.swoosh, { volume: 0.3 });
      setRevealedRanks([2]); // Show rank 3
    }, 500);

    setTimeout(() => {
      play(SOUNDS.swoosh, { volume: 0.3 });
      setRevealedRanks([1, 2]); // Show rank 2
    }, 2000);

    setTimeout(() => {
      play(SOUNDS.swoosh, { volume: 0.3 });
      setRevealedRanks([0, 1, 2]); // Show rank 1 (winner)
      setIsRevealing(false);
      
      // Play confetti sound
      play(SOUNDS.confetti, { volume: 0.4 });
      
      // Trigger confetti for winner
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);

      // Show podium after confetti
    }, 3000); // End of question timeout
      setTimeout(() => {
        setShowPodium(true);
      }, 1500);
    }, 3500);
  };

  const handleCompleteRoom = async () => {
    if (!room) return;

    const totalSubmissions = room.submissions.length;
    const totalVotes = room.votes.length;
    const allVoted = totalSubmissions > 0 && totalVotes === totalSubmissions;

    let confirmMessage = 'Bạn có chắc chắn muốn KẾT THÚC và xem kết quả?\n\n';
    if (!allVoted && totalSubmissions > 0) {
      confirmMessage += `⚠️ Chỉ ${totalVotes}/${totalSubmissions} người đã vote!\n\n`;
    }
    confirmMessage += '✓ Kết quả sẽ được công bố ngay lập tức\n✓ Không thể thay đổi sau khi kết thúc';

    if (!window.confirm(confirmMessage)) return;

    try {
      const voteResults = await completeRoom(roomCode!);
      setResults(voteResults);
      setShowResults(true);
      startCountdownAnimation(voteResults);
    } catch (err: any) {
      showError(err.message || 'Có lỗi xảy ra!');
    }
  };

  const copyParticipantLink = () => {
    const link = `${window.location.origin}/dresscode/join/${roomCode}`;
    navigator.clipboard.writeText(link);
    showSuccess('✅ Đã copy link! Gửi cho mọi người nhé!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-purple-600">Đang tải...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Không tìm thấy room'}</h2>
          <button
            onClick={() => navigate('/dresscode/create')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-6 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const totalSubmissions = room.submissions.length;
  const totalVotes = room.votes.length;
  const allVoted = totalSubmissions > 0 && totalVotes === totalSubmissions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-2">
                👗 Dresscode Vote - Host | 服装投票 - 主持人
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Room Code:</span>
                <span className="text-3xl font-mono font-bold text-purple-600">{roomCode}</span>
              </div>
            </div>
            <button
              onClick={copyParticipantLink}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-2 px-6 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              📋 Copy Link Cho Mọi Người
            </button>
          </div>
        </div>

        {/* Complete Button */}
        {!room.isCompleted && (
          <div className="flex justify-end mb-6">
            <button
              onClick={handleCompleteRoom}
              disabled={totalSubmissions === 0}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-8 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🏆 Kết Thúc & Xem Kết Quả
            </button>
          </div>
        )}

        {/* Progress Stats with Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Submissions Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Người tham gia</div>
              <div className="text-3xl font-bold text-purple-600">{totalSubmissions}</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalSubmissions > 0 ? 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Votes Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Đã vote</div>
              <div className="text-3xl font-bold text-blue-600">{totalVotes}/{totalSubmissions}</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  allVoted ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}
                style={{ width: `${totalSubmissions > 0 ? (totalVotes / totalSubmissions) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Progress Percentage */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Tiến độ</div>
              <div className={`text-3xl font-bold ${allVoted ? 'text-green-600' : 'text-orange-600'}`}>
                {totalSubmissions > 0 ? Math.round((totalVotes / totalSubmissions) * 100) : 0}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  allVoted ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'
                }`}
                style={{ width: `${totalSubmissions > 0 ? (totalVotes / totalSubmissions) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Submissions List */}
        {!showResults && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh Sách Tham Gia</h2>
            {totalSubmissions === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Chưa có ai tham gia. Share link để mọi người tham gia nhé!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {room.submissions.map((sub) => {
                  const hasVoted = room.votes.some((v) => v.deviceId === sub.deviceId);
                  return (
                    <div
                      key={sub.deviceId}
                      className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-400 transition-all"
                    >
                      <img
                        src={sub.photoURL}
                        alt={sub.name}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-bold text-lg text-gray-800 mb-1">{sub.name}</h3>
                      <p className="text-gray-600 text-sm mb-2 italic">"{sub.message}"</p>
                      <div className="flex items-center gap-2">
                        {hasVoted ? (
                          <span className="text-green-600 font-semibold">✅ Đã vote</span>
                        ) : (
                          <span className="text-orange-600 font-semibold">⏳ Chưa vote</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Results - Podium First, Then Rankings */}
        {showResults && results.length >= 3 && (
          <div className="space-y-6">
            {/* Question Screen before reveal */}
            {showQuestion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-12 text-center"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-6">
                  Ai sẽ là công chúa đẹp nhất trong đêm nayyy? 👑
                </h2>
                <p className="text-2xl md:text-3xl text-gray-600">
                  谁将成为今晚最美的公主？
                </p>
              </motion.div>
            )}

            {/* Podium Display - Show after all revealed */}
            {showPodium && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h3 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-8">
                  🏆 Bục Vinh Danh 🏆
                </h3>
                <div className="flex items-end justify-center gap-6 px-4">
                  {/* Rank 2 (Left - Silver) */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-4">
                      <img
                        src={results[1].photoURL}
                        alt={results[1].name}
                        className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-4 border-gray-400 shadow-xl"
                      />
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-bold">
                        🥈 {results[1].voteCount}
                      </div>
                    </div>
                    <div className="text-center mb-3">
                      <div className="font-bold text-sm md:text-base">{results[1].name}</div>
                    </div>
                    <div 
                      className="w-32 md:w-40 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-2xl flex flex-col items-center justify-center text-white shadow-xl"
                      style={{ height: '120px' }}
                    >
                      <div className="text-5xl font-bold">2</div>
                      <div className="text-xs opacity-80 mt-1">Á Quân</div>
                    </div>
                  </motion.div>

                  {/* Rank 1 (Center - Gold, Highest) */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-4">
                      <img
                        src={results[0].photoURL}
                        alt={results[0].name}
                        className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-yellow-400 shadow-2xl ring-4 ring-yellow-200"
                      />
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full font-bold shadow-lg">
                        👑 {results[0].voteCount}
                      </div>
                    </div>
                    <div className="text-center mb-3">
                      <div className="font-bold text-lg md:text-xl">{results[0].name}</div>
                    </div>
                    <div 
                      className="w-36 md:w-44 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-2xl flex flex-col items-center justify-center text-white shadow-2xl"
                      style={{ height: '160px' }}
                    >
                      <div className="text-6xl font-bold">1</div>
                      <div className="text-sm opacity-90 mt-1">Quán Quân</div>
                    </div>
                  </motion.div>

                  {/* Rank 3 (Right - Bronze) */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-4">
                      <img
                        src={results[2].photoURL}
                        alt={results[2].name}
                        className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-full border-4 border-orange-400 shadow-xl"
                      />
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        🥉 {results[2].voteCount}
                      </div>
                    </div>
                    <div className="text-center mb-3">
                      <div className="font-bold text-sm md:text-base">{results[2].name}</div>
                    </div>
                    <div 
                      className="w-32 md:w-40 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-2xl flex flex-col items-center justify-center text-white shadow-xl"
                      style={{ height: '80px' }}
                    >
                      <div className="text-4xl font-bold">3</div>
                      <div className="text-xs opacity-80 mt-1">Hạng Ba</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Ranking List with Fade-up Animation */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-8">
                🏆 KẾT QUẢ BÌNH CHỌN DRESSCODE 🏆
              </h2>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {results.map((result, index) => {
                    const isRevealed = revealedRanks.includes(index);
                    const bgClass = 
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white'
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 text-white'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white'
                        : 'bg-gray-100 text-gray-800';

                    if (!isRevealed && isRevealing) return null;

                    return (
                      <motion.div
                        key={result.deviceId}
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
                          index === 0 && isRevealed ? 'ring-4 ring-yellow-300 shadow-2xl' : 'shadow-lg'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-5xl font-bold min-w-[60px]">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                          <img
                            src={result.photoURL}
                            alt={result.name}
                            className="w-20 h-20 object-cover rounded-full border-4 border-white shadow-lg"
                          />
                          <div className="flex-1">
                            <div className="text-2xl font-bold mb-1">{result.name}</div>
                            <div className={`text-sm italic ${index < 3 ? 'opacity-90' : 'text-gray-600'}`}>
                              "{result.message}"
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-bold">{result.voteCount}</div>
                            <div className={`text-sm ${index < 3 ? 'opacity-90' : 'text-gray-600'}`}>votes</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* Results with less than 3 people */}
        {showResults && results.length < 3 && results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-8">
              🏆 Kết Quả Bình Chọn 🏆
            </h2>
            <div className="space-y-4">
              <AnimatePresence>
                {results.map((result, index) => (
                  <motion.div
                    key={result.deviceId}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-lg"
                  >
                    <div className="text-4xl font-bold w-12">#{index + 1}</div>
                    <img
                      src={result.photoURL}
                      alt={result.name}
                      className="w-16 h-16 object-cover rounded-full border-4 border-white shadow-lg"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-xl">{result.name}</div>
                      <div className="text-sm text-gray-700 italic">"{result.message}"</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">{result.voteCount}</div>
                      <div className="text-sm text-gray-600">votes</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

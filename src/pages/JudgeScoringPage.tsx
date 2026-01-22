import { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { subscribeToRoom, addJudge, submitScore } from '../services/roomService';
import type { Room, Judge as JudgeType } from '../types/room';

const JudgeScoringPage = () => {
  const { roomId, judgeToken } = useParams<{ roomId: string; judgeToken: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [currentJudge, setCurrentJudge] = useState<JudgeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // If coming from join page, add judge first
    if (judgeToken === 'join' && location.state?.judgeName) {
      const judgeName = location.state.judgeName;
      addJudge(roomId, judgeName)
        .then((newJudge) => {
          setCurrentJudge(newJudge);
          // Replace URL to use real token
          navigate(`/scoring/judge/${roomId}/${newJudge.token}`, { replace: true });
        })
        .catch((err) => {
          console.error(err);
          setError('Không thể tham gia phòng');
          setLoading(false);
        });
    }

    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      if (updatedRoom === null) {
        setError('Phòng đã hết hạn hoặc không tồn tại');
        setRoom(null);
      } else {
        setRoom(updatedRoom);
        
        // Find current judge by token
        if (judgeToken && judgeToken !== 'join') {
          const judge = updatedRoom.judges.find((j) => j.token === judgeToken);
          if (judge) {
            setCurrentJudge(judge);
          } else {
            setError('Bạn không còn trong phòng này');
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId, judgeToken, location.state, navigate]);

  const handleSubmitScore = async (performanceId: string, score: number) => {
    if (!roomId || !currentJudge) return;
    
    try {
      await submitScore(roomId, currentJudge.id, performanceId, score);
    } catch (err) {
      console.error(err);
      alert('Không thể gửi điểm');
    }
  };

  const getMyScore = (performanceId: string): number | null => {
    if (!room || !currentJudge) return null;
    const score = room.scores.find(
      (s) => s.performanceId === performanceId && s.judgeId === currentJudge.id
    );
    return score ? score.score : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Đang tải...</div>
      </div>
    );
  }

  if (error || !room || !currentJudge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
          <p className="text-gray-700 mb-6">{error || 'Không thể tải phòng'}</p>
          <Link
            to="/scoring"
            className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-bold"
          >
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link
              to="/scoring"
              className="text-white hover:text-white/80 transition-colors flex items-center gap-2"
            >
              <span className="text-2xl">←</span>
              <span className="font-semibold">Rời phòng</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              ⭐ Chấm Điểm | 评分
            </h1>
            <div className="w-24"></div>
          </div>
          
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <img
                src={currentJudge.avatar}
                alt={currentJudge.name}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div>
                <div className="font-bold">{currentJudge.name}</div>
                <div className="text-sm opacity-80">Giám khảo</div>
              </div>
            </div>
            
            <div className="text-sm text-right">
              <div className="opacity-80">Host: {room.hostName}</div>
              <div className="opacity-80">
                {room.performances.length} tiết mục
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {room.isCompleted ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Chấm điểm hoàn tất!
            </h2>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã tham gia chấm điểm!
            </p>
            <Link
              to="/scoring"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-bold"
            >
              Quay lại trang chủ
            </Link>
          </div>
        ) : room.performances.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Đang chờ tiết mục...
            </h2>
            <p className="text-gray-600">
              Host đang chuẩn bị các tiết mục. Vui lòng đợi!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {room.performances.map((performance) => {
              const myScore = getMyScore(performance.id);
              const isSelected = selectedPerformanceId === performance.id;
              
              return (
                <motion.div
                  key={performance.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-white rounded-2xl shadow-2xl p-6 transition-all ${
                    isSelected ? 'ring-4 ring-blue-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {performance.name}
                    </h3>
                    {myScore !== null && (
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                        ✓ Đã chấm: {myScore}
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    Tiết mục #{performance.order}
                  </div>

                  {/* Score Buttons */}
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        onClick={() => {
                          setSelectedPerformanceId(performance.id);
                          handleSubmitScore(performance.id, score);
                        }}
                        className={`py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-110 ${
                          myScore === score
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>

                  {myScore !== null && (
                    <div className="mt-4 text-center text-sm text-gray-600">
                      Nhấn điểm khác để thay đổi
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Judge's Score Summary */}
        {!room.isCompleted && room.performances.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              📊 Tổng quan điểm của bạn
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {room.performances.filter((p) => getMyScore(p.id) !== null).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Đã chấm</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {room.performances.filter((p) => getMyScore(p.id) === null).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Chưa chấm</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">
                  {room.performances.length > 0
                    ? Math.round(
                        (room.performances.filter((p) => getMyScore(p.id) !== null).length /
                          room.performances.length) *
                          100
                      )
                    : 0}
                  %
                </div>
                <div className="text-sm text-gray-600 mt-1">Hoàn thành</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {room.performances.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Tổng tiết mục</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgeScoringPage;

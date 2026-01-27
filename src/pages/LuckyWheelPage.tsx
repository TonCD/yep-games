import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound, SOUNDS } from '../hooks/useSound';

interface Participant {
  id: number;
  name: string;
  isRemoved: boolean;
}

interface WinnerHistory {
  name: string;
  time: string;
}

const LuckyWheelPage = () => {
  const [inputText, setInputText] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [history, setHistory] = useState<WinnerHistory[]>([]);
  const [rotation, setRotation] = useState(0);
  const { play } = useSound();

  // Real-time update: Khi gõ text, tự động parse và update participants
  useEffect(() => {
    const names = inputText
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (names.length === 0) {
      // Nếu xóa hết text → xóa hết participants
      setParticipants([]);
      return;
    }

    // Tạo participants mới từ text hiện tại
    const newParticipants: Participant[] = names.map((name, index) => {
      // Tìm xem người này đã tồn tại chưa (để giữ trạng thái isRemoved)
      const existing = participants.find((p) => p.name === name);
      return existing || {
        id: Date.now() + Math.random() * 10000 + index,
        name,
        isRemoved: false,
      };
    });

    // Xóa những người không còn trong text
    setParticipants(newParticipants);
  }, [inputText]); // Chạy mỗi khi inputText thay đổi

  const spinWheel = () => {
    const activeParticipants = participants.filter((p) => !p.isRemoved);
    if (activeParticipants.length === 0) {
      alert('Vui lòng thêm người tham gia!');
      return;
    }

    setIsSpinning(true);
    
    // Play spinning sound (loop automatically for 6 seconds)
    const spinAudio = play(SOUNDS.wheelSpin, { volume: 0.3, loop: true });
    
    // Chọn người thắng TRƯỚC
    const randomIndex = Math.floor(Math.random() * activeParticipants.length);
    const winnerName = activeParticipants[randomIndex].name;
    
    // Tính góc để mũi tên (ở trên = 0°) chỉ vào giữa phần của winner
    const segmentAngle = 360 / activeParticipants.length;
    const targetAngle = randomIndex * segmentAngle + segmentAngle / 2;
    
    // Random số vòng quay (5-8 vòng)
    const spins = 5 + Math.floor(Math.random() * 4);
    
    // Tính rotation cuối cùng: nhiều vòng + góc để mũi tên chỉ đúng winner
    // Mũi tên ở trên (0°), nên cần quay đến (360 - targetAngle) để winner về vị trí mũi tên
    const finalRotation = 360 * spins + (360 - targetAngle);
    
    setRotation(rotation + finalRotation);

    // Hiển thị kết quả sau 6 giây
    setTimeout(() => {
      // Stop spinning sound
      if (spinAudio) {
        spinAudio.pause();
      }
      
      setWinner(winnerName);
      setWinnerId(activeParticipants[randomIndex].id);
      setIsSpinning(false);
      setShowModal(true);
      
      // Play winner sound
      play(SOUNDS.wheelWin, { volume: 0.5 });

      // Thêm vào lịch sử
      const now = new Date();
      setHistory([
        {
          name: winnerName,
          time: now.toLocaleTimeString('vi-VN'),
        },
        ...history,
      ]);
    }, 6000);
  };

  const handleRemoveWinner = () => {
    if (winnerId !== null) {
      setParticipants(
        participants.map((p) =>
          p.id === winnerId ? { ...p, isRemoved: true } : p
        )
      );
    }
    // Reset rotation về 0 để vòng quay tính toán lại vị trí màu và tên đúng
    setRotation(0);
    setShowModal(false);
    setWinner(null);
    setWinnerId(null);
  };

  const handleKeepWinner = () => {
    // Không reset rotation - giữ nguyên vị trí hiện tại
    setShowModal(false);
    setWinner(null);
    setWinnerId(null);
  };

  const resetAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả và bắt đầu lại?')) {
      setParticipants([]);
      setInputText(''); // Xóa luôn textarea
      setHistory([]);
      setWinner(null);
      setRotation(0);
    }
  };

  const activeCount = participants.filter((p) => !p.isRemoved).length;
  const activeParticipants = participants.filter((p) => !p.isRemoved);

  // Tạo màu cho vòng quay dựa trên số người
  const generateWheelColors = (count: number) => {
    if (count === 0) return [];
    const hueStep = 360 / count;
    return Array.from({ length: count }, (_, i) => {
      const hue = i * hueStep;
      // Màu đậm và rực rỡ hơn
      return `hsl(${hue}, 85%, 55%)`;
    });
  };

  const wheelColors = generateWheelColors(activeCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
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
            🎡 Vòng Quay May Mắn | 幸运转盘
          </h1>
          <button
            onClick={resetAll}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Input */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Thêm người tham gia
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                Gõ tên ngay, mỗi dòng một người (tự động cập nhật vòng quay)
              </p>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C&#10;..."
                className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
              />

              <div className="mt-6">
                <h3 className="font-bold text-gray-700 mb-2">
                  Danh sách ({activeCount} người)
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className={`p-3 rounded-lg ${
                        p.isRemoved
                          ? 'bg-gray-200 text-gray-500 line-through'
                          : 'bg-purple-50 text-gray-800'
                      }`}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center - Wheel */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center">
            <div className="relative">
              <motion.div
                key={activeParticipants.map(p => p.id).join('-')}
                animate={{ rotate: rotation }}
                transition={{
                  duration: 6,
                  ease: 'easeOut',
                }}
                className="w-80 h-80 rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background:
                    activeCount === 0
                      ? '#e5e7eb' // Màu xám nếu chưa có ai
                      : `conic-gradient(
                          ${wheelColors
                            .map((color, i) => {
                              const startAngle = (i / activeCount) * 360;
                              const endAngle = ((i + 1) / activeCount) * 360;
                              return `${color} ${startAngle}deg ${endAngle}deg`;
                            })
                            .join(', ')}
                        )`,
                }}
              >
                {/* Hiển thị tên trên vòng quay */}
                {activeCount > 0 ? (
                  <div className="absolute inset-0">
                    {activeParticipants.map((person, index) => {
                      // Tính góc giữa của mỗi phần
                      const startAngle = (index / activeCount) * 360;
                      const endAngle = ((index + 1) / activeCount) * 360;
                      const midAngle = (startAngle + endAngle) / 2;
                      const radian = ((midAngle - 90) * Math.PI) / 180; // -90 để bắt đầu từ trên
                      const radius = 110; // Khoảng cách từ tâm
                      const x = Math.cos(radian) * radius;
                      const y = Math.sin(radian) * radius;

                      return (
                        <div
                          key={person.id}
                          className="absolute text-white font-bold text-sm drop-shadow-lg pointer-events-none"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {person.name}
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {/* Center circle */}
                <div 
                  onClick={spinWheel}
                  className={`w-20 h-20 rounded-full bg-white flex items-center justify-center z-10 shadow-xl ${
                    isSpinning || activeCount === 0 
                      ? 'cursor-not-allowed' 
                      : 'cursor-pointer hover:scale-110 transition-transform'
                  }`}
                >
                  <span className="text-3xl font-bold text-gray-800">
                    {isSpinning ? '🎯' : activeCount === 0 ? '⭕' : '🎡'}
                  </span>
                </div>
              </motion.div>

              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8">
                <div 
                  className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-red-500"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 3px white)',
                  }}
                ></div>
              </div>
            </div>

            <button
              onClick={spinWheel}
              disabled={isSpinning || activeCount === 0}
              className={`mt-8 px-12 py-4 text-2xl font-bold rounded-full shadow-2xl transition-all ${
                isSpinning || activeCount === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white'
              }`}
            >
              {isSpinning ? '🌀 Đang quay...' : activeCount === 0 ? '⚠️ Chưa có người chơi' : '🎰 QUAY NGAY!'}
            </button>
          </div>

          {/* Right Panel - History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📜 Lịch sử trúng thưởng
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có ai trúng thưởng
                  </p>
                ) : (
                  history.map((h, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-orange-500"
                    >
                      <div className="font-bold text-gray-800">
                        🏆 {h.name}
                      </div>
                      <div className="text-sm text-gray-600">{h.time}</div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Winner */}
      <AnimatePresence>
        {showModal && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Chúc mừng!
              </h2>
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
                {winner}
              </p>
              <p className="text-gray-600 mb-6">Bạn có muốn xóa người này khỏi danh sách?</p>

              <div className="flex gap-4">
                <button
                  onClick={handleRemoveWinner}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition-colors"
                >
                  ✓ Xóa khỏi danh sách
                </button>
                <button
                  onClick={handleKeepWinner}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold transition-colors"
                >
                  ↻ Giữ lại
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LuckyWheelPage;

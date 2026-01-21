import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface DrawnNumber {
  number: number;
  time: string;
}

const BingoPage = () => {
  const [maxNumber, setMaxNumber] = useState<number>(90);
  const [inputMaxNumber, setInputMaxNumber] = useState<string>('90');
  const [isStarted, setIsStarted] = useState(false);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [history, setHistory] = useState<DrawnNumber[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startGame = () => {
    const num = parseInt(inputMaxNumber);
    if (isNaN(num) || num < 20 || num > 100) {
      alert('Vui lòng nhập số từ 20 đến 100!');
      return;
    }
    setMaxNumber(num);
    setIsStarted(true);
    setDrawnNumbers([]);
    setHistory([]);
    setCurrentNumber(null);
  };

  const drawNumber = () => {
    if (drawnNumbers.length >= maxNumber) {
      alert('Đã rút hết tất cả các số!');
      return;
    }

    setIsDrawing(true);

    // Animation countdown
    let count = 0;
    const interval = setInterval(() => {
      const availableNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1).filter(
        (n) => !drawnNumbers.includes(n)
      );
      const randomNum = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
      setCurrentNumber(randomNum);
      count++;

      if (count >= 20) {
        clearInterval(interval);
        // Chọn số cuối cùng
        const finalAvailableNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1).filter(
          (n) => !drawnNumbers.includes(n)
        );
        const finalNumber =
          finalAvailableNumbers[Math.floor(Math.random() * finalAvailableNumbers.length)];

        setCurrentNumber(finalNumber);
        setDrawnNumbers([...drawnNumbers, finalNumber]);

        const now = new Date();
        setHistory([
          {
            number: finalNumber,
            time: now.toLocaleTimeString('vi-VN'),
          },
          ...history,
        ]);

        setIsDrawing(false);

        // Play sound effect (optional)
        // new Audio('/ting.mp3').play();
      }
    }, 50);
  };

  const resetGame = () => {
    if (window.confirm('Bạn có chắc muốn reset và bắt đầu lại?')) {
      setIsStarted(false);
      setDrawnNumbers([]);
      setHistory([]);
      setCurrentNumber(null);
      setInputMaxNumber('90');
      setMaxNumber(90);
    }
  };

  const allNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-600">
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
          <h1 className="text-2xl md:text-3xl font-bold text-white">🎲 Lô Tô Việt Nam</h1>
          {isStarted && (
            <button
              onClick={resetGame}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!isStarted ? (
          // Setup Screen
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-6xl text-center mb-6">🎲</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Thiết lập trò chơi
              </h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Giới hạn số (20-100):
                </label>
                <input
                  type="number"
                  value={inputMaxNumber}
                  onChange={(e) => setInputMaxNumber(e.target.value)}
                  min="20"
                  max="100"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-center text-2xl font-bold"
                />
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Số sẽ được rút từ 1 đến {inputMaxNumber || '?'}
                </p>
              </div>

              <button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-lg font-bold text-xl transition-all shadow-lg"
              >
                🚀 Bắt đầu chơi
              </button>

              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">📖 Hướng dẫn:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Chọn giới hạn số (20-100)</li>
                  <li>• Nhấn "Rút số" để random số</li>
                  <li>• Số đã rút sẽ được đánh dấu</li>
                  <li>• Xem lịch sử các số đã rút</li>
                </ul>
              </div>
            </div>
          </motion.div>
        ) : (
          // Game Screen
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Side - Current Number & Draw Button */}
            <div className="lg:col-span-1 space-y-6">
              {/* Current Number Display */}
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  Số vừa rút
                </h3>
                <AnimatePresence mode="wait">
                  {currentNumber !== null && (
                    <motion.div
                      key={currentNumber}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl"
                    >
                      <span className="text-6xl font-bold text-white">
                        {currentNumber}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={drawNumber}
                  disabled={isDrawing || drawnNumbers.length >= maxNumber}
                  className={`w-full mt-6 py-4 rounded-lg font-bold text-xl transition-all ${
                    isDrawing || drawnNumbers.length >= maxNumber
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
                  }`}
                >
                  {isDrawing ? '🎲 Đang rút...' : '🎲 Rút số'}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-gray-600 font-semibold">
                    Đã rút: {drawnNumbers.length} / {maxNumber}
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${(drawnNumbers.length / maxNumber) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* History */}
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  📜 Lịch sử rút số
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {history.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Chưa rút số nào
                    </p>
                  ) : (
                    history.map((h, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                      >
                        <span className="font-bold text-orange-600">
                          #{history.length - index}
                        </span>
                        <span className="text-2xl font-bold text-gray-800">
                          {h.number}
                        </span>
                        <span className="text-sm text-gray-600">{h.time}</span>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Number Grid */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  Bảng số (1 - {maxNumber})
                </h3>
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(auto-fill, minmax(60px, 1fr))`,
                  }}
                >
                  {allNumbers.map((num) => {
                    const isDrawn = drawnNumbers.includes(num);
                    const isLatest = num === currentNumber;

                    return (
                      <motion.div
                        key={num}
                        initial={false}
                        animate={{
                          scale: isLatest ? [1, 1.2, 1] : 1,
                          backgroundColor: isDrawn
                            ? 'rgb(251, 191, 36)'
                            : 'rgb(243, 244, 246)',
                        }}
                        transition={{ duration: 0.3 }}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center font-bold text-xl
                          ${
                            isDrawn
                              ? 'text-white shadow-lg'
                              : 'text-gray-400 border-2 border-gray-200'
                          }
                          ${isLatest && isDrawn ? 'ring-4 ring-red-500' : ''}
                        `}
                      >
                        {num}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BingoPage;

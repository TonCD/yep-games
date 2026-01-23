import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createSpyRoom } from '../services/spyRoomService';

const SpyCreatePage = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async () => {
    try {
      setIsCreating(true);
      const { roomId } = await createSpyRoom();
      
      // Navigate to host page
      navigate(`/spy/host/${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Không thể tạo phòng. Vui lòng thử lại!');
    } finally {
      setIsCreating(false);
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
          <div className="text-6xl mb-4">🕵️</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Trò Chơi Gián Điệp
          </h1>
          <p className="text-white/70 text-lg">间谍游戏</p>
        </div>

        {/* Description */}
        <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
          <h2 className="text-white font-semibold mb-3 text-lg">📖 Giới thiệu</h2>
          <ul className="text-white/80 space-y-2 text-sm">
            <li>• Tìm ra gián điệp ẩn trong đám đông</li>
            <li>• Mỗi người nhận 1 từ khóa bí mật</li>
            <li>• Dân thường vs Gián điệp</li>
            <li>• Vote loại từng người theo vòng</li>
          </ul>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateRoom}
          disabled={isCreating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isCreating ? '🔄 Đang tạo phòng...' : '🎮 TẠO PHÒNG MỚI'}
        </button>

        {/* Join Option */}
        <div className="mt-6 text-center">
          <p className="text-white/60 mb-3">Hoặc</p>
          <button
            onClick={() => navigate('/spy/join')}
            className="text-white/80 hover:text-white underline transition-colors"
          >
            Tham gia phòng có sẵn →
          </button>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
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

export default SpyCreatePage;

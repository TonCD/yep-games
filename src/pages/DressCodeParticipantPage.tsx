import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { DressCodeRoom } from '../types/dressCode';
import { getDeviceId } from '../types/dressCode';
import {
  getRoomByCode,
  subscribeToRoom,
  uploadPhoto,
  submitEntry,
  submitVotes,
  getUserStatus,
} from '../services/dressCodeService';
import { useAlert } from '../contexts/AlertContext';

type Step = 'loading' | 'upload' | 'voting' | 'completed' | 'room-completed';

export default function DressCodeParticipantPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { showWarning } = useAlert();
  const [room, setRoom] = useState<DressCodeRoom | null>(null);
  const [step, setStep] = useState<Step>('loading');
  const [error, setError] = useState('');

  // Upload step
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Voting step
  const [selectedVotes, setSelectedVotes] = useState<string[]>([]);
  const [submittingVotes, setSubmittingVotes] = useState(false);

  const deviceId = getDeviceId();

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
          setStep('loading');
          return;
        }

        // Check user status
        const status = getUserStatus(foundRoom, deviceId);
        
        if (foundRoom.isCompleted) {
          setStep('room-completed');
        } else if (status.hasVoted) {
          setStep('completed');
        } else if (status.hasSubmitted) {
          setStep('voting');
        } else {
          setStep('upload');
        }
      })
      .catch(() => {
        setError('Có lỗi xảy ra!');
        setStep('loading');
      });

    // Subscribe to real-time updates
    const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
      if (updatedRoom) {
        setRoom(updatedRoom);
        
        // Update step based on room state
        if (updatedRoom.isCompleted && step !== 'room-completed') {
          setStep('room-completed');
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode, navigate, deviceId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showWarning('Ảnh quá lớn! Vui lòng chọn ảnh dưới 10MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showWarning('Chỉ chấp nhận file ảnh!');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
  };

  const handleSubmitEntry = async () => {
    if (!name.trim()) {
      showWarning('Vui lòng nhập tên của bạn!');
      return;
    }

    if (!previewUrl) {
      showWarning('Vui lòng tải lên ảnh dresscode!');
      return;
    }

    if (!message.trim()) {
      showWarning('Vui lòng nhập lời nhắn!');
      return;
    }

    if (!selectedFile) {
      showWarning('Vui lòng chọn file ảnh!');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Upload photo
      const photoURL = await uploadPhoto(selectedFile);

      // Submit entry
      await submitEntry(roomCode!, deviceId, name.trim(), photoURL, message.trim());

      // Move to voting step
      setStep('voting');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra!');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleVote = (targetDeviceId: string) => {
    if (targetDeviceId === deviceId) {
      showWarning('Không thể vote cho chính mình!');
      return;
    }

    if (selectedVotes.includes(targetDeviceId)) {
      setSelectedVotes(selectedVotes.filter((id) => id !== targetDeviceId));
    } else {
      if (selectedVotes.length >= 3) {
        showWarning('Chỉ được vote tối đa 3 người!');
        return;
      }
      setSelectedVotes([...selectedVotes, targetDeviceId]);
    }
  };

  const handleSubmitVotes = async () => {
    if (selectedVotes.length === 0) {
      showWarning('Vui lòng chọn ít nhất 1 người!');
      return;
    }

    setSubmittingVotes(true);
    setError('');

    try {
      await submitVotes(roomCode!, deviceId, selectedVotes);
      setStep('completed');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra!');
    } finally {
      setSubmittingVotes(false);
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-purple-600">
          {error || 'Đang tải...'}
        </div>
      </div>
    );
  }

  if (step === 'room-completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Room Đã Kết Thúc!</h2>
          <p className="text-gray-600 mb-6">Kết quả đã được công bố. Cảm ơn bạn đã tham gia!</p>
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

  if (step === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Bạn đã tải ảnh và vote rồi nhé!</h2>
          <p className="text-gray-600 mb-6">
            Cảm ơn bạn đã tham gia! Đợi host công bố kết quả nhé.
          </p>
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

  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-2 text-center">
              👗 Dresscode Vote | 服装投票
            </h1>
            <p className="text-gray-600 text-center mb-6">Room: {roomCode}</p>

            <div className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Nhập tên của bạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                  placeholder="Tên của bạn..."
                  disabled={uploading}
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Tải lên ảnh dresscode hôm nay <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  📸 Chụp ngay hoặc chọn từ thư viện - ảnh dresscode hôm nay mà bạn nghĩ là xênhh nhấtt
                </p>
                
                {!previewUrl ? (
                  <div className="space-y-3">
                    {/* Camera Input */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {/* Gallery Input */}
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {/* Camera Button */}
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full border-2 border-dashed border-blue-300 rounded-lg py-8 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
                    >
                      <div className="text-5xl mb-2">📷</div>
                      <div className="text-gray-700 font-medium">Chụp Ảnh Ngay</div>
                      <div className="text-sm text-gray-500">Mở camera</div>
                    </button>
                    
                    {/* Gallery Button */}
                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full border-2 border-dashed border-purple-300 rounded-lg py-8 hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50"
                    >
                      <div className="text-5xl mb-2">🖼️</div>
                      <div className="text-gray-700 font-medium">Chọn Từ Thư Viện</div>
                      <div className="text-sm text-gray-500">Max 10MB</div>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={handleRemovePhoto}
                      disabled={uploading}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all disabled:opacity-50"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Lời nhắn <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Lời nhắn của bạn..."
                  disabled={uploading}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmitEntry}
                disabled={uploading || !name.trim() || !selectedFile || !message.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Đang tải lên...' : '✅ Xác Nhận'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'voting') {
    const otherSubmissions = room?.submissions.filter((sub) => sub.deviceId !== deviceId) || [];

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-2 text-center">
              🗳️ Bình Chọn Dresscode Đẹp Nhất
            </h1>
            <p className="text-gray-600 text-center mb-2">
              Chọn tối đa 3 người (đã chọn: {selectedVotes.length}/3)
            </p>
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 mb-6">
              <p className="text-pink-700 text-sm text-center">
                💡 <span className="font-medium">Lưu ý:</span> Ảnh có thể bị mờ nên mọi người có thể ngắm ở ngoài để vote nhen {'<3'}
              </p>
            </div>

            {otherSubmissions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Chưa có ai khác tham gia. Đợi một chút nhé!
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {otherSubmissions.map((sub) => {
                    const isSelected = selectedVotes.includes(sub.deviceId);
                    return (
                      <div
                        key={sub.deviceId}
                        onClick={() => handleToggleVote(sub.deviceId)}
                        className={`cursor-pointer border-4 rounded-xl p-4 transition-all ${
                          isSelected
                            ? 'border-pink-500 bg-pink-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={sub.photoURL}
                            alt={sub.name}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                              ✓
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-1">{sub.name}</h3>
                        <p className="text-gray-600 text-sm italic">"{sub.message}"</p>
                      </div>
                    );
                  })}
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                {/* Submit Votes Button */}
                <button
                  onClick={handleSubmitVotes}
                  disabled={submittingVotes || selectedVotes.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingVotes ? 'Đang gửi...' : '✅ Xác Nhận Vote'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

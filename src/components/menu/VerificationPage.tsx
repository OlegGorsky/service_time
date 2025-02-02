import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { sendVerificationRequest } from '../../lib/telegram';
import { Camera, Upload, Loader2, X, RotateCw } from 'lucide-react';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';

interface VerificationPageProps {
  onClose: () => void;
}

export function VerificationPage({ onClose }: VerificationPageProps) {
  const { user } = useTelegramWebApp();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    checkProfileCompletion();
    checkVerificationStatus();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [user]);

  const checkVerificationStatus = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_verified, verification_status')
        .eq('telegram_id', user.id)
        .single();

      if (error) throw error;

      if (data?.is_verified) {
        setVerificationStatus('verified');
      } else if (data?.verification_status === 'pending') {
        setVerificationStatus('pending');
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setError('Ошибка при проверке статуса верификации');
    }
  };

  const checkProfileCompletion = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('phone, districts, specialization')
        .eq('telegram_id', user.id)
        .single();

      if (error) throw error;

      const isComplete = Boolean(
        data?.phone && data?.districts?.length && data?.specialization?.length
      );
      setIsProfileComplete(isComplete);
      if (!isComplete) {
        setShowProfileWarning(true);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      setIsProfileComplete(false);
      setShowProfileWarning(true);
    }
  };

  const uploadPhoto = async (file: Blob): Promise<string> => {
    if (!user?.id) throw new Error('User not found');

    const fileName = `verification/${user.id}_${Date.now()}.jpg`;
    
    const { error: uploadError } = await supabase.storage
      .from('verifications')
      .upload(fileName, file, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Ошибка при загрузке фото');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('verifications')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleVerificationSubmit = async (photoBlob: Blob) => {
    if (!user?.id) return;
    setError(null);
    setIsUploading(true);

    try {
      const photoUrl = await uploadPhoto(photoBlob);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          verification_status: 'pending',
          verification_photo: photoUrl,
          verification_requested_at: new Date().toISOString()
        })
        .eq('telegram_id', user.id);

      if (updateError) throw updateError;

      await sendVerificationRequest({
        userId: user.id,
        username: user.username,
        firstName: user.first_name,
        photoUrl: user.photo_url || '',
        verificationPhotoUrl: photoUrl
      });

      setVerificationStatus('pending');
      stopCamera();
    } catch (error) {
      console.error('Error submitting verification:', error);
      setError('Произошла ошибка при отправке фото. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsUploading(false);
    }
  };

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
      setCapturedPhoto(null);
      setError(null);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Не удалось получить доступ к камере. Пожалуйста, проверьте разрешения.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setCapturedPhoto(null);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isCameraOpen) {
      startCamera();
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(videoRef.current, 0, 0);
    
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedPhoto(dataUrl);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      setError('Произошла ошибка при создании фото. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handleSubmitCapturedPhoto = async () => {
    if (!capturedPhoto) return;

    try {
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();
      await handleVerificationSubmit(blob);
    } catch (error) {
      console.error('Error submitting captured photo:', error);
      setError('Произошла ошибка при отправке фото. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      await handleVerificationSubmit(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Произошла ошибка при загрузке файла. Пожалуйста, попробуйте еще раз.');
    }
  };

  if (!isProfileComplete && showProfileWarning) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="bg-[#2D2D2D] text-white px-6 py-4 rounded-xl shadow-lg relative z-10 max-w-md text-center">
          Прежде чем пройти верификацию, сначала расскажите о себе на вкладке «Мои данные»
        </div>
      </div>
    );
  }

  if (verificationStatus === 'verified') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="bg-[#2D2D2D] text-white px-6 py-4 rounded-xl shadow-lg relative z-10 max-w-md text-center">
          <h3 className="text-lg font-medium mb-2">✅ Вы верифицированы</h3>
          <p className="text-gray-400">Ваш аккаунт уже прошел проверку</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'pending') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="bg-[#2D2D2D] text-white px-6 py-4 rounded-xl shadow-lg relative z-10 max-w-md text-center">
          <h3 className="text-lg font-medium mb-2">⏳ Заявка на рассмотрении</h3>
          <p className="text-gray-400">Мы уведомим вас, когда проверка будет завершена</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="bg-[#1F1F1F] rounded-2xl shadow-xl">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Верификация</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#3D3D3D] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-400 mb-6">
              Чтобы пройти верификацию, отправьте фото-селфи с документом, подтверждающим вашу личность.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {isCameraOpen && !capturedPhoto && (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-black aspect-[3/4]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    onClick={switchCamera}
                    className="px-4 py-2 bg-[#2D2D2D] rounded-lg"
                    disabled={isUploading}
                  >
                    Переключить камеру
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="px-4 py-2 bg-[#6B6BF9] rounded-lg flex items-center justify-center min-w-[120px]"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      'Сделать фото'
                    )}
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 bg-[#2D2D2D] rounded-lg"
                    disabled={isUploading}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {capturedPhoto && (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-black aspect-[3/4]">
                  <img
                    src={capturedPhoto}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-[#2D2D2D] rounded-lg flex items-center gap-2"
                    disabled={isUploading}
                  >
                    <RotateCw size={16} />
                    Переснять
                  </button>
                  <button
                    onClick={handleSubmitCapturedPhoto}
                    className="px-4 py-2 bg-[#6B6BF9] rounded-lg flex items-center justify-center min-w-[120px]"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      'Отправить'
                    )}
                  </button>
                </div>
              </div>
            )}

            {!isCameraOpen && !capturedPhoto && (
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col items-center gap-2 p-4 bg-[#2D2D2D] rounded-lg cursor-pointer hover:bg-[#3D3D3D] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Upload size={24} />
                  <span className="text-sm text-center">Добавить фото</span>
                </label>

                <button
                  onClick={startCamera}
                  className="flex flex-col items-center gap-2 p-4 bg-[#2D2D2D] rounded-lg hover:bg-[#3D3D3D] transition-colors"
                  disabled={isUploading}
                >
                  <Camera size={24} />
                  <span className="text-sm text-center">Открыть камеру</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
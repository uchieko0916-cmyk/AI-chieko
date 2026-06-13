import React, { useState, useRef } from 'react';
import { TeacherVideo } from '../App';

interface Props {
  teacherVideo: TeacherVideo;
  onVideoSet: (url: string, name: string) => void;
  onBack: () => void;
}

export default function VideoUpload({ teacherVideo, onVideoSet, onBack }: Props) {
  const [uploadedVideo, setUploadedVideo] = useState<{ url: string; name: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('動画ファイルを選択してください');
      return;
    }
    const url = URL.createObjectURL(file);
    setUploadedVideo({ url, name: file.name });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleContinue = () => {
    if (!uploadedVideo) return;
    onVideoSet(uploadedVideo.url, uploadedVideo.name);
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center">
        <div className="text-6xl mb-4 float-anim inline-block">💃</div>
        <h2 className="text-3xl font-black gradient-text mb-2">あなたの動画をアップロード</h2>
        <p className="text-gray-500 text-sm">
          先生の動きを真似したあなたのダンス動画をアップロードしてください
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Teacher video preview */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>👩‍🏫</span> 先生の動画
          </h3>
          <video
            src={teacherVideo.url}
            controls
            className="w-full rounded-2xl max-h-56 object-cover"
            playsInline
          />
          <p className="text-sm text-gray-400 mt-2 truncate">{teacherVideo.name}</p>
        </div>

        {/* Student video upload */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>🎬</span> あなたの動画
          </h3>

          <div
            className={`upload-zone ${isDragging ? 'drag-over' : ''} ${uploadedVideo ? 'border-green-400 bg-green-50' : ''}`}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => !uploadedVideo && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            {uploadedVideo ? (
              <div>
                <video
                  src={uploadedVideo.url}
                  controls
                  className="w-full rounded-xl max-h-40 object-cover"
                  playsInline
                />
                <p className="text-xs text-gray-500 mt-2 truncate">{uploadedVideo.name}</p>
                <button
                  onClick={e => { e.stopPropagation(); setUploadedVideo(null); }}
                  className="mt-2 text-xs text-red-400 hover:text-red-600 underline"
                >
                  別の動画を選ぶ
                </button>
              </div>
            ) : (
              <div>
                <div className="text-5xl mb-3">📱</div>
                <p className="font-bold text-purple-600 text-sm mb-1">クリックまたはドラッグ&ドロップ</p>
                <p className="text-xs text-gray-400">MP4, MOV, WebM に対応</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="card bg-gradient-to-r from-yellow-50 to-orange-50">
        <h4 className="font-bold text-gray-700 mb-3">🌟 採点のポイント</h4>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="text-center p-3 bg-white rounded-xl shadow-sm">
            <div className="text-2xl mb-1">⏱️</div>
            <p className="font-bold text-gray-700">タイミング</p>
            <p className="text-xs text-gray-400">リズムに合わせた動き</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl shadow-sm">
            <div className="text-2xl mb-1">🤸</div>
            <p className="font-bold text-gray-700">ポーズ精度</p>
            <p className="text-xs text-gray-400">先生との動きの一致度</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl shadow-sm">
            <div className="text-2xl mb-1">🌊</div>
            <p className="font-bold text-gray-700">スムーズさ</p>
            <p className="text-xs text-gray-400">動きの流れの滑らかさ</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 justify-center">
        <button onClick={onBack} className="btn-secondary">
          ← 戻る
        </button>
        <button
          onClick={handleContinue}
          disabled={!uploadedVideo}
          className={`text-lg px-10 py-4 rounded-full font-black shadow-xl transition-all duration-300 ${
            uploadedVideo
              ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white hover:shadow-2xl hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {uploadedVideo ? 'AI採点スタート！ ⭐' : '動画をアップロードしてください'}
        </button>
      </div>
    </div>
  );
}

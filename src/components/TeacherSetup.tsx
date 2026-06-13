import React, { useState, useRef } from 'react';
import { TeacherVideo } from '../App';

interface Props {
  onVideoSet: (video: TeacherVideo) => void;
}

// Sample demo videos - using publicly accessible sample videos
const DEMO_VIDEOS = [
  {
    id: 'demo1',
    name: 'サンプル：基本ステップ',
    emoji: '🕺',
    description: 'シンプルな基本ステップのデモ動画',
    // Using a short MP4 sample (Big Buck Bunny short clip as placeholder)
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: '🎵',
  },
  {
    id: 'demo2',
    name: 'サンプル：ポップダンス',
    emoji: '💃',
    description: 'ポップなリズムに合わせたダンス',
    url: 'https://www.w3schools.com/html/movie.mp4',
    thumbnail: '🎶',
  },
];

export default function TeacherSetup({ onVideoSet }: Props) {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
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
    setSelectedDemo(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleContinue = () => {
    if (uploadedVideo) {
      onVideoSet({ url: uploadedVideo.url, name: uploadedVideo.name, isDemo: false });
    } else if (selectedDemo) {
      const demo = DEMO_VIDEOS.find(d => d.id === selectedDemo);
      if (demo) {
        onVideoSet({ url: demo.url, name: demo.name, isDemo: true });
      }
    }
  };

  const isReady = uploadedVideo !== null || selectedDemo !== null;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 float-anim inline-block">🎬</div>
        <h2 className="text-3xl font-black gradient-text mb-2">先生動画の設定</h2>
        <p className="text-gray-500 text-sm">
          参考にする先生の動画をアップロードするか、デモ動画を選んでください
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload section */}
        <div className="card card-hover">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="step-badge">1</span>
            先生動画をアップロード
          </h3>

          <div
            className={`upload-zone ${isDragging ? 'drag-over' : ''} ${uploadedVideo ? 'border-green-400 bg-green-50' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploadedVideo && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleInputChange}
              className="hidden"
            />

            {uploadedVideo ? (
              <div>
                <div className="text-4xl mb-2">✅</div>
                <p className="font-bold text-green-600 text-sm">{uploadedVideo.name}</p>
                <video
                  src={uploadedVideo.url}
                  className="w-full mt-3 rounded-xl max-h-40 object-cover"
                  muted
                  autoPlay
                  loop
                  playsInline
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedVideo(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="mt-2 text-xs text-red-400 hover:text-red-600 underline"
                >
                  別の動画を選ぶ
                </button>
              </div>
            ) : (
              <div>
                <div className="text-5xl mb-3">🎥</div>
                <p className="font-bold text-violet-600 text-sm mb-1">
                  クリックまたはドラッグ&ドロップ
                </p>
                <p className="text-xs text-gray-400">
                  MP4, MOV, WebM に対応（最大200MB）
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Demo videos */}
        <div className="card card-hover">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="step-badge">2</span>
            デモ動画を使う
          </h3>

          <div className="space-y-3">
            {DEMO_VIDEOS.map(demo => (
              <button
                key={demo.id}
                onClick={() => {
                  setSelectedDemo(demo.id);
                  setUploadedVideo(null);
                }}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                  selectedDemo === demo.id
                    ? 'border-violet-500 bg-violet-50 shadow-md scale-[1.02]'
                    : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{demo.emoji}</span>
                  <div>
                    <p className="font-bold text-sm text-gray-700">{demo.name}</p>
                    <p className="text-xs text-gray-400">{demo.description}</p>
                  </div>
                  {selectedDemo === demo.id && (
                    <span className="ml-auto text-violet-600 text-xl font-black">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {selectedDemo && (
            <div className="mt-4">
              <video
                src={DEMO_VIDEOS.find(d => d.id === selectedDemo)?.url}
                className="w-full rounded-xl max-h-40 object-cover"
                muted
                autoPlay
                loop
                playsInline
              />
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="card mt-6" style={{ background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)' }}>
        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span>💡</span> 動画撮影のコツ
        </h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="text-pink-400">•</span>
            全身が映るように撮影してください
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-400">•</span>
            明るい場所で撮影すると精度が上がります
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-400">•</span>
            カメラは正面または斜め前から固定して撮影してください
          </li>
          <li className="flex items-center gap-2">
            <span className="text-pink-400">•</span>
            動画は10〜60秒程度が最適です
          </li>
        </ul>
      </div>

      {/* Next button */}
      <div className="text-center mt-8">
        <button
          onClick={handleContinue}
          disabled={!isReady}
          style={isReady ? { background: 'linear-gradient(135deg, #7c3aed, #4338ca)' } : {}}
          className={`text-lg px-10 py-4 rounded-full font-black shadow-xl transition-all duration-300 ${
            isReady
              ? 'text-white hover:shadow-2xl hover:scale-105 pulse-ring'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isReady ? '次へ進む 💃' : '動画を選択してください'}
        </button>
      </div>
    </div>
  );
}

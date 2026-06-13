import { useState, useEffect, useRef } from 'react';
import { analyzePoses, AnalysisResult, getGradeColor, getGradeEmoji, getGradeMessage } from '../utils/poseAnalysis';
import ConfettiRain from './ConfettiRain';

interface Props {
  teacherVideoUrl: string;
  studentVideoUrl: string;
  analysisResult: AnalysisResult | null;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onShowCertificate: (name: string) => void;
  onBack: () => void;
}

type Phase = 'preview' | 'analyzing' | 'result';

export default function ScoreDisplay({
  teacherVideoUrl,
  studentVideoUrl,
  analysisResult,
  onAnalysisComplete,
  onShowCertificate,
  onBack,
}: Props) {
  const [phase, setPhase] = useState<Phase>(analysisResult ? 'result' : 'preview');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [displayedScores, setDisplayedScores] = useState({ timing: 0, pose: 0, smoothness: 0, total: 0 });
  const [studentName, setStudentName] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [nameError, setNameError] = useState('');
  const teacherVideoRef = useRef<HTMLVideoElement>(null);
  const studentVideoRef = useRef<HTMLVideoElement>(null);

  const PROGRESS_MESSAGES = [
    '🤖 AIが動画を解析中...',
    '🦴 ポーズを検出しています...',
    '📊 フレームを比較中...',
    '✨ スコアを計算しています...',
    '🎉 結果をまとめています...',
  ];

  const animateScores = (result: AnalysisResult) => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const prog = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - prog, 3);

      setDisplayedScores({
        timing: Math.round(result.timingScore * eased),
        pose: Math.round(result.poseAccuracyScore * eased),
        smoothness: Math.round(result.smoothnessScore * eased),
        total: Math.round(result.totalScore * eased),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);
  };

  const startAnalysis = async () => {
    setPhase('analyzing');
    setProgress(0);

    let msgIdx = 0;
    setProgressMessage(PROGRESS_MESSAGES[0]);

    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % PROGRESS_MESSAGES.length;
      setProgressMessage(PROGRESS_MESSAGES[msgIdx]);
    }, 600);

    try {
      const result = await analyzePoses(
        teacherVideoRef.current!,
        studentVideoRef.current!,
        (p) => setProgress(p)
      );

      clearInterval(msgInterval);
      onAnalysisComplete(result);
      setPhase('result');

      setTimeout(() => animateScores(result), 300);
      setTimeout(() => setShowConfetti(true), 800);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (err) {
      clearInterval(msgInterval);
      console.error('Analysis error:', err);
      setPhase('preview');
    }
  };

  useEffect(() => {
    if (analysisResult && phase === 'result') {
      animateScores(analysisResult);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShowCertificate = () => {
    if (!studentName.trim()) {
      setNameError('お名前を入力してください');
      return;
    }
    setNameError('');
    onShowCertificate(studentName.trim());
  };

  const scoreBarColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-emerald-400';
    if (score >= 60) return 'from-yellow-400 to-amber-400';
    if (score >= 40) return 'from-orange-400 to-red-400';
    return 'from-red-400 to-rose-500';
  };

  return (
    <div className="animate-fade-in">
      {showConfetti && <ConfettiRain />}

      {/* Hero */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-4 float-anim inline-block">
          {phase === 'analyzing' ? '🤖' : phase === 'result' ? '⭐' : '🎬'}
        </div>
        <h2 className="text-3xl font-black gradient-text mb-2">
          {phase === 'preview' && 'AI採点の準備'}
          {phase === 'analyzing' && 'AI採点中...'}
          {phase === 'result' && '採点結果'}
        </h2>
        <p className="text-gray-500 text-sm">
          {phase === 'preview' && '動画を確認してから採点を開始してください'}
          {phase === 'analyzing' && 'しばらくお待ちください...'}
          {phase === 'result' && 'お疲れ様でした！あなたのダンスの採点結果です'}
        </p>
      </div>

      {/* Video previews */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <span>🎬</span>
            <span className="font-bold text-sm text-gray-700">先生</span>
          </div>
          <video
            ref={teacherVideoRef}
            src={teacherVideoUrl}
            className="w-full rounded-xl"
            style={{ maxHeight: '200px', objectFit: 'cover' }}
            controls={phase === 'preview'}
            muted={phase !== 'preview'}
            playsInline
          />
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <span>💃</span>
            <span className="font-bold text-sm text-gray-700">あなた</span>
          </div>
          <video
            ref={studentVideoRef}
            src={studentVideoUrl}
            className="w-full rounded-xl"
            style={{ maxHeight: '200px', objectFit: 'cover' }}
            controls={phase === 'preview'}
            muted={phase !== 'preview'}
            playsInline
          />
        </div>
      </div>

      {/* Analyzing phase */}
      {phase === 'analyzing' && (
        <div className="card text-center animate-fade-in">
          <div className="text-5xl mb-4 animate-spin-slow inline-block">⚙️</div>
          <p className="font-bold text-purple-600 mb-4 text-lg">{progressMessage}</p>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-300 shimmer"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">{Math.round(progress)}%</p>
          <div className="flex justify-center gap-2 mt-6">
            {['🎵', '💃', '🤸', '✨', '⭐'].map((emoji, i) => (
              <span
                key={i}
                className="text-2xl animate-bounce-slow"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Preview phase - start button */}
      {phase === 'preview' && (
        <div className="text-center">
          <div className="card mb-6 bg-gradient-to-r from-pink-50 to-purple-50">
            <h4 className="font-bold text-gray-700 mb-4">採点の仕組み</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'タイミング', weight: '30%', emoji: '🎵' },
                { label: 'ポーズ精度', weight: '40%', emoji: '💃' },
                { label: 'スムーズさ', weight: '30%', emoji: '✨' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-2xl mb-1">{item.emoji}</div>
                  <div className="font-bold text-sm text-gray-700">{item.label}</div>
                  <div className="text-xs text-purple-500 font-bold">{item.weight}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button onClick={onBack} className="btn-secondary">
              ← 戻る
            </button>
            <button
              onClick={startAnalysis}
              className="text-lg px-10 py-4 rounded-full font-black bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 pulse-ring"
            >
              🤖 AI採点スタート！
            </button>
          </div>
        </div>
      )}

      {/* Result phase */}
      {phase === 'result' && analysisResult && (
        <div className="animate-slide-up space-y-6">
          {/* Total score & Grade */}
          <div className="card text-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
            <div className="flex items-center justify-center gap-6 mb-4 flex-wrap">
              <div className={`grade-badge bg-gradient-to-br ${getGradeColor(analysisResult.grade)} text-white`}>
                {analysisResult.grade}
              </div>
              <div>
                <div className="text-7xl font-black gradient-text leading-none">
                  {displayedScores.total}
                </div>
                <div className="text-gray-500 text-sm font-bold">/ 100点</div>
              </div>
              <div className="text-5xl float-anim">
                {getGradeEmoji(analysisResult.grade)}
              </div>
            </div>
            <p className="text-xl font-black text-gray-700">
              {getGradeMessage(analysisResult.grade)}
            </p>
          </div>

          {/* Score breakdown */}
          <div className="card">
            <h3 className="font-bold text-gray-700 mb-4 text-lg">スコア詳細</h3>
            <div className="space-y-4">
              {[
                { label: 'タイミング', emoji: '🎵', score: displayedScores.timing, actual: analysisResult.timingScore, weight: '30%' },
                { label: 'ポーズ精度', emoji: '💃', score: displayedScores.pose, actual: analysisResult.poseAccuracyScore, weight: '40%' },
                { label: 'スムーズさ', emoji: '✨', score: displayedScores.smoothness, actual: analysisResult.smoothnessScore, weight: '30%' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{item.emoji}</span>
                      <span className="font-bold text-sm text-gray-700">{item.label}</span>
                      <span className="text-xs text-gray-400">({item.weight})</span>
                    </div>
                    <span className="font-black text-lg text-gray-700">
                      {item.score}<span className="text-sm text-gray-400">点</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${scoreBarColor(item.actual)} rounded-full score-bar-fill`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="card bg-gradient-to-br from-yellow-50 to-orange-50">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>💬</span> AIからのフィードバック
            </h3>
            <ul className="space-y-2">
              {analysisResult.feedback.map((msg, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-600 bg-white bg-opacity-60 rounded-xl p-3"
                >
                  <span className="mt-0.5 flex-shrink-0">→</span>
                  <span>{msg}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Certificate section */}
          <div className="card bg-gradient-to-br from-purple-50 to-pink-50">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>🏆</span> 修了証を作成する
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              あなたのお名前を入力して、かわいい修了証を発行しましょう！
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    setNameError('');
                  }}
                  placeholder="お名前を入力（例：田中さくら）"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 font-bold text-gray-700 placeholder-gray-300 focus:border-purple-400 transition-colors"
                  maxLength={20}
                  onKeyDown={(e) => e.key === 'Enter' && handleShowCertificate()}
                />
                {nameError && (
                  <p className="text-red-400 text-xs mt-1 ml-2">{nameError}</p>
                )}
              </div>
              <button
                onClick={handleShowCertificate}
                className="btn-primary whitespace-nowrap"
              >
                🏆 修了証を作る
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between flex-wrap gap-3">
            <button onClick={onBack} className="btn-secondary">
              ← 戻る
            </button>
            <button
              onClick={startAnalysis}
              className="px-6 py-3 bg-white text-gray-500 rounded-full border-2 border-gray-200 font-bold hover:bg-gray-50 transition-all"
            >
              🔄 もう一度採点
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

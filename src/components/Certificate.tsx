import { useEffect, useRef, useState } from 'react';
import { AnalysisResult, getGradeEmoji, getGradeMessage } from '../utils/poseAnalysis';

interface Props {
  result: AnalysisResult;
  studentName: string;
  onRestart: () => void;
  onBack: () => void;
}

export default function Certificate({ result, studentName, onRestart, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [confetti, setConfetti] = useState<Array<{ x: number; y: number; color: string; size: number; speed: number; angle: number }>>([]);
  const animRef = useRef<number>(0);

  // Generate confetti
  useEffect(() => {
    const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#fb923c'];
    const pieces = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      speed: 2 + Math.random() * 3,
      angle: Math.random() * 360,
    }));
    setConfetti(pieces);
  }, []);

  // Draw certificate on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 560;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#fce4ec');
    bg.addColorStop(0.3, '#f3e5f5');
    bg.addColorStop(0.6, '#e8eaf6');
    bg.addColorStop(1, '#fce4ec');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Decorative border
    ctx.strokeStyle = '#f9a8d4';
    ctx.lineWidth = 3;
    ctx.roundRect(12, 12, W - 24, H - 24, 20);
    ctx.stroke();

    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth = 1.5;
    ctx.roundRect(20, 20, W - 40, H - 40, 16);
    ctx.stroke();

    // Corner decorations
    const corners = [[40, 40], [W - 40, 40], [40, H - 40], [W - 40, H - 40]];
    corners.forEach(([x, y]) => {
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✿', x, y);
    });

    // Title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // "AI Chieko" logo
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('💃 AI Chieko', W / 2, 55);

    // Main title
    ctx.font = 'bold 42px sans-serif';
    const titleGrad = ctx.createLinearGradient(W / 2 - 150, 0, W / 2 + 150, 0);
    titleGrad.addColorStop(0, '#f472b6');
    titleGrad.addColorStop(0.5, '#a78bfa');
    titleGrad.addColorStop(1, '#60a5fa');
    ctx.fillStyle = titleGrad;
    ctx.fillText('ダンス修了証', W / 2, 110);

    // Subtitle
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Dance Completion Certificate', W / 2, 140);

    // Divider
    const divGrad = ctx.createLinearGradient(100, 0, W - 100, 0);
    divGrad.addColorStop(0, 'transparent');
    divGrad.addColorStop(0.5, '#f9a8d4');
    divGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 160);
    ctx.lineTo(W - 100, 160);
    ctx.stroke();

    // Name section
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('以下の方がダンスチャレンジを修了したことを証明します', W / 2, 190);

    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = '#374151';
    ctx.fillText(studentName || 'ダンサー', W / 2, 245);

    // Underline for name
    const nameWidth = ctx.measureText(studentName || 'ダンサー').width;
    ctx.strokeStyle = '#f9a8d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - nameWidth / 2, 265);
    ctx.lineTo(W / 2 + nameWidth / 2, 265);
    ctx.stroke();

    // Score section
    const scoreX = W / 2 - 120;
    const scoreY = 310;

    // Score circle
    const scoreGrad = ctx.createRadialGradient(scoreX, scoreY, 0, scoreX, scoreY, 55);
    if (result.grade === 'S') {
      scoreGrad.addColorStop(0, '#fde68a');
      scoreGrad.addColorStop(1, '#f59e0b');
    } else if (result.grade === 'A') {
      scoreGrad.addColorStop(0, '#fbcfe8');
      scoreGrad.addColorStop(1, '#ec4899');
    } else {
      scoreGrad.addColorStop(0, '#ddd6fe');
      scoreGrad.addColorStop(1, '#8b5cf6');
    }
    ctx.beginPath();
    ctx.arc(scoreX, scoreY, 55, 0, Math.PI * 2);
    ctx.fillStyle = scoreGrad;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${result.totalScore}`, scoreX, scoreY - 8);
    ctx.font = '13px sans-serif';
    ctx.fillText('点', scoreX, scoreY + 18);

    // Grade
    const gradeX = W / 2 + 30;
    ctx.font = '56px serif';
    ctx.textAlign = 'center';
    ctx.fillText(getGradeEmoji(result.grade), gradeX, scoreY - 5);

    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#374151';
    ctx.fillText(`ランク ${result.grade}`, gradeX + 60, scoreY - 15);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(getGradeMessage(result.grade), gradeX + 60, scoreY + 12);

    // Subscores
    const subScores = [
      { label: 'タイミング', score: result.timingScore, emoji: '🎵' },
      { label: 'ポーズ', score: result.poseAccuracyScore, emoji: '💃' },
      { label: 'スムーズさ', score: result.smoothnessScore, emoji: '🌊' },
    ];
    const subY = 395;
    const spacing = (W - 160) / 3;
    subScores.forEach((sub, i) => {
      const x = 80 + spacing * i + spacing / 2;
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.fillText(sub.emoji, x, subY);
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#374151';
      ctx.fillText(`${sub.score}点`, x, subY + 24);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(sub.label, x, subY + 42);
    });

    // Footer
    const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    ctx.fillText(`認定日: ${today}`, W / 2, 460);

    // Signature
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('AI Chieko 認定', W / 2, 490);

    // Stars decoration
    ['⭐', '⭐', '⭐', '⭐', '⭐'].forEach((star, i) => {
      ctx.font = '18px serif';
      ctx.fillText(star, 280 + i * 52, 516);
    });

    setImageUrl(canvas.toDataURL('image/png'));
  }, [result, studentName]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `dance-certificate-${studentName || 'dancer'}.png`;
    a.click();
  };

  const handleTwitterShare = () => {
    const grade = result.grade;
    const score = result.totalScore;
    const text = encodeURIComponent(
      `🎉 AI Chiekoのダンスチャレンジで${score}点・ランク${grade}を獲得しました！\n${getGradeEmoji(grade)} ${getGradeMessage(grade)}\n\n#AIChieko #ダンスチャレンジ #ダンス練習`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleLineShare = () => {
    const text = encodeURIComponent(
      `🎉 AI Chiekoのダンスチャレンジで${result.totalScore}点・ランク${result.grade}を獲得しました！${getGradeEmoji(result.grade)}`
    );
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${text}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Confetti */}
      {confetti.map((c, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${c.x}px`,
            backgroundColor: c.color,
            width: `${c.size}px`,
            height: `${c.size}px`,
            animationDuration: `${3 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Hero */}
      <div className="text-center">
        <div className="text-6xl mb-4 float-anim inline-block">🏆</div>
        <h2 className="text-3xl font-black gradient-text mb-2">修了証が完成しました！</h2>
        <p className="text-gray-500">ダウンロードしてSNSでシェアしよう✨</p>
      </div>

      {/* Certificate preview */}
      <div className="card overflow-hidden p-2">
        <canvas ref={canvasRef} className="hidden" />
        {imageUrl && (
          <img
            src={imageUrl}
            alt="修了証"
            className="w-full rounded-2xl shadow-inner"
          />
        )}
      </div>

      {/* Share buttons */}
      <div className="card">
        <h3 className="font-bold text-gray-700 mb-4 text-center text-lg">シェアして自慢しよう！</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-400 to-teal-400 text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            <span>⬇️</span>
            <span>ダウンロード</span>
          </button>
          <button
            onClick={handleTwitterShare}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            <span className="text-lg">𝕏</span>
            <span>X（Twitter）</span>
          </button>
          <button
            onClick={handleLineShare}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            <span>💬</span>
            <span>LINEでシェア</span>
          </button>
        </div>
      </div>

      {/* Score summary */}
      <div className="card bg-gradient-to-r from-pink-50 to-purple-50 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-5xl">{getGradeEmoji(result.grade)}</span>
          <div>
            <p className="text-4xl font-black text-gray-800">{result.totalScore}点</p>
            <p className="text-purple-600 font-bold">ランク {result.grade} - {getGradeMessage(result.grade)}</p>
          </div>
        </div>
        <div className="flex justify-center gap-6 text-sm text-gray-500">
          <span>🎵 タイミング {result.timingScore}点</span>
          <span>💃 ポーズ {result.poseAccuracyScore}点</span>
          <span>🌊 スムーズ {result.smoothnessScore}点</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center flex-wrap">
        <button onClick={onBack} className="btn-secondary">
          ← 結果に戻る
        </button>
        <button
          onClick={onRestart}
          className="bg-gradient-to-r from-pink-400 to-purple-500 text-white font-black px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          もう一度チャレンジ！ 💃
        </button>
      </div>
    </div>
  );
}

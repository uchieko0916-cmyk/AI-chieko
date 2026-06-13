import { useEffect, useRef, useState } from 'react';
import { AnalysisResult, getGradeEmoji, getGradeMessage } from '../utils/poseAnalysis';

interface Props {
  result: AnalysisResult;
  studentName: string;
  capturedFrame: string;
  onRestart: () => void;
  onBack: () => void;
}

interface ConfettiPiece {
  x: number;
  y: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
}

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function Certificate({ result, studentName, capturedFrame, onRestart, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const colors = ['#fbbf24', '#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#c4b5fd'];
    const pieces: ConfettiPiece[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
    setConfetti(pieces);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 900;
    const H = 600;
    canvas.width = W;
    canvas.height = H;

    // Background: deep navy → purple gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#1e1b4b');
    bg.addColorStop(0.5, '#312e81');
    bg.addColorStop(1, '#4c1d95');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Dot pattern overlay
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let x = 20; x < W; x += 30) {
      for (let y = 20; y < H; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Outer border (gold)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    drawRoundRect(ctx, 12, 12, W - 24, H - 24, 20);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(251,191,36,0.4)';
    ctx.lineWidth = 1;
    drawRoundRect(ctx, 20, 20, W - 40, H - 40, 16);
    ctx.stroke();

    // Corner stars
    const corners: [number, number][] = [[44, 44], [W - 44, 44], [44, H - 44], [W - 44, H - 44]];
    corners.forEach(([x, y]) => {
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('★', x, y);
    });

    // EVOKE header
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold italic 20px sans-serif';
    ctx.fillStyle = '#c4b5fd';
    ctx.fillText('EVOKE', W / 2 - 32, 52);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('for kids', W / 2 + 22, 52);

    // Title
    ctx.font = 'bold 44px sans-serif';
    const titleGrad = ctx.createLinearGradient(W / 2 - 180, 0, W / 2 + 180, 0);
    titleGrad.addColorStop(0, '#fbbf24');
    titleGrad.addColorStop(0.5, '#fde68a');
    titleGrad.addColorStop(1, '#fbbf24');
    ctx.fillStyle = titleGrad;
    ctx.fillText('チアダンス修了証', W / 2, 105);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'rgba(196,181,253,0.8)';
    ctx.fillText('Cheer Dance Completion Certificate', W / 2, 132);

    // Divider
    const divGrad = ctx.createLinearGradient(60, 0, W - 60, 0);
    divGrad.addColorStop(0, 'transparent');
    divGrad.addColorStop(0.3, '#fbbf24');
    divGrad.addColorStop(0.7, '#fbbf24');
    divGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, 150);
    ctx.lineTo(W - 60, 150);
    ctx.stroke();

    // Left side: Video frame area
    const frameX = 50;
    const frameY = 165;
    const frameW = 280;
    const frameH = 200;
    const frameR = 16;

    function drawRightSide() {
      if (!ctx) return;

      // "Good job!" badge
      ctx.fillStyle = '#fbbf24';
      drawRoundRect(ctx, frameX + frameW - 80, frameY - 14, 76, 26, 13);
      ctx.fill();
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#1e1b4b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Good Job! 🌟', frameX + frameW - 42, frameY - 1);

      ctx.font = '28px serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('🎀', frameX - 10, frameY + 30);
      ctx.fillText('🎀', frameX + frameW + 10, frameY + 30);

      // Right: Score area
      const rightCenterX = 370 + (W - 370 - 50) / 2;

      ctx.font = '13px sans-serif';
      ctx.fillStyle = 'rgba(196,181,253,0.9)';
      ctx.textAlign = 'center';
      ctx.fillText('以下の方がチアダンスを修了したことを証明します', rightCenterX, 175);

      // Student name
      ctx.font = 'bold 42px sans-serif';
      ctx.fillStyle = '#ffffff';
      const displayName = studentName || 'ダンサー';
      ctx.fillText(displayName, rightCenterX, 225);

      // Name underline
      const nameW = Math.min(ctx.measureText(displayName).width + 20, 380);
      const ulGrad = ctx.createLinearGradient(rightCenterX - nameW / 2, 0, rightCenterX + nameW / 2, 0);
      ulGrad.addColorStop(0, 'transparent');
      ulGrad.addColorStop(0.3, '#fbbf24');
      ulGrad.addColorStop(0.7, '#fbbf24');
      ulGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = ulGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rightCenterX - nameW / 2, 243);
      ctx.lineTo(rightCenterX + nameW / 2, 243);
      ctx.stroke();

      // Score circle
      const scoreX = rightCenterX - 60;
      const scoreY = 310;
      const scoreR = 52;
      const glowGrad = ctx.createRadialGradient(scoreX, scoreY, 0, scoreX, scoreY, scoreR + 15);
      glowGrad.addColorStop(0, 'rgba(251,191,36,0.4)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(scoreX, scoreY, scoreR + 15, 0, Math.PI * 2);
      ctx.fill();

      const circleGrad = ctx.createRadialGradient(scoreX - 15, scoreY - 15, 0, scoreX, scoreY, scoreR);
      circleGrad.addColorStop(0, '#fde68a');
      circleGrad.addColorStop(1, '#f59e0b');
      ctx.beginPath();
      ctx.arc(scoreX, scoreY, scoreR, 0, Math.PI * 2);
      ctx.fillStyle = circleGrad;
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = 'bold 36px sans-serif';
      ctx.fillStyle = '#1e1b4b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${result.totalScore}`, scoreX, scoreY - 8);
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('点', scoreX, scoreY + 18);

      // Grade emoji
      ctx.font = '56px serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(getGradeEmoji(result.grade), rightCenterX + 60, scoreY - 8);

      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#fde68a';
      ctx.fillText(`ランク ${result.grade}`, rightCenterX + 60, scoreY + 30);

      ctx.font = '13px sans-serif';
      ctx.fillStyle = 'rgba(196,181,253,0.9)';
      ctx.fillText(getGradeMessage(result.grade), rightCenterX, scoreY + 60);

      // Stars
      const starScore = Math.ceil(result.totalScore / 20);
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i < starScore ? '#fbbf24' : 'rgba(251,191,36,0.2)';
        ctx.font = '20px serif';
        ctx.fillText('★', rightCenterX - 50 + i * 26, 390);
      }

      // Sub-scores
      ctx.strokeStyle = 'rgba(196,181,253,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 430);
      ctx.lineTo(W - 60, 430);
      ctx.stroke();

      const subScores = [
        { label: 'タイミング', score: result.timingScore, emoji: '🎵' },
        { label: 'ポーズ精度', score: result.poseAccuracyScore, emoji: '💃' },
        { label: 'スムーズさ', score: result.smoothnessScore, emoji: '🌊' },
      ];
      const spacing = (W - 120) / 3;
      subScores.forEach((sub, i) => {
        const x = 60 + spacing * i + spacing / 2;
        ctx.font = '20px serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(sub.emoji, x, 450);
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#fde68a';
        ctx.fillText(`${sub.score}点`, x, 476);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = 'rgba(196,181,253,0.8)';
        ctx.fillText(sub.label, x, 494);
      });

      // Footer
      const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
      ctx.font = '12px sans-serif';
      ctx.fillStyle = 'rgba(196,181,253,0.6)';
      ctx.textAlign = 'center';
      ctx.fillText(`認定日: ${today}`, W / 2, 522);
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('★ EVOKE for kids × AI Chieko 認定 ★', W / 2, 548);
      ctx.font = '16px serif';
      ctx.fillStyle = 'rgba(251,191,36,0.7)';
      ctx.fillText('🎀 💃 ⭐ 💃 🎀', W / 2, 575);

      setImageUrl(canvas!.toDataURL('image/png'));
    }

    if (capturedFrame) {
      const img = new Image();
      img.onload = () => {
        // Draw video frame clipped to rounded rect
        ctx.save();
        drawRoundRect(ctx, frameX, frameY, frameW, frameH, frameR);
        ctx.clip();
        const imgAspect = img.width / img.height;
        const fAspect = frameW / frameH;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (imgAspect > fAspect) {
          sw = img.height * fAspect;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / fAspect;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, frameX, frameY, frameW, frameH);
        ctx.restore();

        // Gold frame border
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        drawRoundRect(ctx, frameX, frameY, frameW, frameH, frameR);
        ctx.stroke();

        drawRightSide();
      };
      img.src = capturedFrame;
    } else {
      // Placeholder
      ctx.fillStyle = 'rgba(124,58,237,0.3)';
      drawRoundRect(ctx, frameX, frameY, frameW, frameH, frameR);
      ctx.fill();
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 2;
      drawRoundRect(ctx, frameX, frameY, frameW, frameH, frameR);
      ctx.stroke();
      ctx.font = '48px serif';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💃', frameX + frameW / 2, frameY + frameH / 2);
      drawRightSide();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, studentName, capturedFrame]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `evoke-cheer-certificate-${studentName || 'dancer'}.png`;
    a.click();
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `🎀 EVOKEチアダンスで${result.totalScore}点・ランク${result.grade}を獲得しました！\n${getGradeEmoji(result.grade)} ${getGradeMessage(result.grade)}\n\n#EVOKE #チアダンス #EVOKEforkids`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleLineShare = () => {
    const text = encodeURIComponent(
      `🎀 EVOKEチアダンスで${result.totalScore}点・ランク${result.grade}を獲得！${getGradeEmoji(result.grade)}`
    );
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${text}`, '_blank');
  };

  const handleInstagramShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], 'evoke-certificate.png', { type: 'image/png' });
        await navigator.share({ files: [file], title: 'チアダンス修了証' });
      } catch {
        handleDownload();
      }
    } else {
      handleDownload();
    }
  };

  return (
    <div className="space-y-8">
      {confetti.map((c, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${c.x}px`,
            backgroundColor: c.color,
            width: `${c.size}px`,
            height: `${c.size}px`,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      <div className="text-center">
        <div className="text-6xl mb-4 float-anim inline-block">🏆</div>
        <h2 className="text-3xl font-black gradient-text mb-2">修了証が完成しました！</h2>
        <p className="text-gray-500">ダウンロードしてInstagram・LINEでシェアしよう🎀</p>
      </div>

      <div className="card overflow-hidden p-2">
        <canvas ref={canvasRef} className="hidden" />
        {imageUrl ? (
          <img src={imageUrl} alt="チアダンス修了証" className="w-full rounded-2xl shadow-inner" />
        ) : (
          <div className="flex items-center justify-center h-48 rounded-2xl" style={{ background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)' }}>
            <p className="text-violet-300 font-bold">🎨 修了証を作成中...</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-700 mb-4 text-center text-lg">シェアして自慢しよう！🎉</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={handleDownload}
            disabled={!imageUrl}
            className="flex items-center justify-center gap-2 px-4 py-3 text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
          >
            <span>⬇️</span><span>保存</span>
          </button>
          <button
            onClick={handleInstagramShare}
            disabled={!imageUrl}
            className="flex items-center justify-center gap-2 px-4 py-3 text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #e1306c, #833ab4)' }}
          >
            <span>📸</span><span>Instagram</span>
          </button>
          <button
            onClick={handleTwitterShare}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            <span className="font-bold text-lg">𝕏</span><span>Twitter</span>
          </button>
          <button
            onClick={handleLineShare}
            className="flex items-center justify-center gap-2 px-4 py-3 text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
            style={{ background: '#06C755' }}
          >
            <span>💬</span><span>LINE</span>
          </button>
        </div>
      </div>

      <div className="card text-center" style={{ background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)', color: 'white' }}>
        <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
          <span className="text-5xl">{getGradeEmoji(result.grade)}</span>
          <div>
            <p className="text-4xl font-black text-yellow-300">{result.totalScore}点</p>
            <p className="text-violet-300 font-bold">ランク {result.grade} - {getGradeMessage(result.grade)}</p>
          </div>
        </div>
        <div className="flex justify-center gap-4 text-sm text-violet-300 flex-wrap">
          <span>🎵 タイミング {result.timingScore}点</span>
          <span>💃 ポーズ {result.poseAccuracyScore}点</span>
          <span>🌊 スムーズ {result.smoothnessScore}点</span>
        </div>
        <div className="flex justify-center gap-1 mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-xl ${i < Math.ceil(result.totalScore / 20) ? 'text-yellow-300' : 'text-indigo-800'}`}>★</span>
          ))}
        </div>
      </div>

      <div className="card border-2 border-violet-300 text-center" style={{ background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)' }}>
        <p className="text-lg font-black text-violet-800 mb-1">🎀 EVOKEのレッスンに来てみよう！</p>
        <p className="text-sm text-gray-500">1.5時間で、自信とマナーが身につく。1回完結型チアダンス・ワークショップ</p>
        <p className="text-xs text-violet-400 mt-2">世田谷区で開催 | 年少〜小学校低学年 | 単発参加OK</p>
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <button onClick={onBack} className="btn-secondary">
          ← 結果に戻る
        </button>
        <button
          onClick={onRestart}
          className="text-white font-black px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4338ca)' }}
        >
          もう一度チャレンジ！ 💃
        </button>
      </div>
    </div>
  );
}

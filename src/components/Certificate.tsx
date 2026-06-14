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
  x: number; y: number; color: string; size: number; duration: number; delay: number;
}

// Cross-browser rounded rect
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const W = 800;
const H = 560;

function drawCertificate(
  canvas: HTMLCanvasElement,
  result: AnalysisResult,
  studentName: string,
  frameImg: HTMLImageElement | null,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = W;
  canvas.height = H;

  // ── Background ──────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1e1b4b');
  bg.addColorStop(0.55, '#312e81');
  bg.addColorStop(1, '#4c1d95');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Dot texture
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  for (let x = 25; x < W; x += 32)
    for (let y = 25; y < H; y += 32) {
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
    }

  // ── Border ──────────────────────────────────────────────────
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
  rr(ctx, 10, 10, W - 20, H - 20, 18); ctx.stroke();
  ctx.strokeStyle = 'rgba(251,191,36,0.35)'; ctx.lineWidth = 1;
  rr(ctx, 18, 18, W - 36, H - 36, 13); ctx.stroke();

  // Corner stars
  ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fbbf24';
  [[38, 38], [W - 38, 38], [38, H - 38], [W - 38, H - 38]].forEach(([x, y]) => ctx.fillText('★', x, y));

  // ── Header ──────────────────────────────────────────────────
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

  // EVOKE logo
  ctx.font = 'bold italic 17px Arial, sans-serif'; ctx.fillStyle = '#c4b5fd';
  ctx.fillText('EVOKE', W / 2 - 28, 46);
  ctx.font = 'bold 11px Arial, sans-serif'; ctx.fillStyle = '#a78bfa';
  ctx.fillText('for kids', W / 2 + 24, 46);

  // Title
  ctx.font = 'bold 38px Arial, sans-serif';
  const tg = ctx.createLinearGradient(W / 2 - 160, 0, W / 2 + 160, 0);
  tg.addColorStop(0, '#fbbf24'); tg.addColorStop(0.5, '#fef3c7'); tg.addColorStop(1, '#fbbf24');
  ctx.fillStyle = tg;
  ctx.fillText('チアダンス修了証', W / 2, 94);

  ctx.font = '13px Arial, sans-serif'; ctx.fillStyle = 'rgba(196,181,253,0.75)';
  ctx.fillText('Cheer Dance Completion Certificate', W / 2, 118);

  // Divider
  const dg = ctx.createLinearGradient(60, 0, W - 60, 0);
  dg.addColorStop(0, 'transparent'); dg.addColorStop(0.3, '#fbbf24'); dg.addColorStop(0.7, '#fbbf24'); dg.addColorStop(1, 'transparent');
  ctx.strokeStyle = dg; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(60, 136); ctx.lineTo(W - 60, 136); ctx.stroke();

  // ── Left: Video frame ────────────────────────────────────────
  const FX = 44, FY = 152, FW = 246, FH = 188, FR = 14;

  if (frameImg) {
    ctx.save();
    rr(ctx, FX, FY, FW, FH, FR); ctx.clip();
    // cover-fit
    const ia = frameImg.width / frameImg.height, fa = FW / FH;
    let sx = 0, sy = 0, sw = frameImg.width, sh = frameImg.height;
    if (ia > fa) { sw = sh * fa; sx = (frameImg.width - sw) / 2; }
    else { sh = sw / fa; sy = (frameImg.height - sh) / 2; }
    ctx.drawImage(frameImg, sx, sy, sw, sh, FX, FY, FW, FH);
    ctx.restore();
  } else {
    ctx.fillStyle = 'rgba(109,40,217,0.35)';
    rr(ctx, FX, FY, FW, FH, FR); ctx.fill();
    ctx.font = '52px serif'; ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillText('💃', FX + FW / 2, FY + FH / 2);
  }

  // Gold frame border
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5;
  rr(ctx, FX, FY, FW, FH, FR); ctx.stroke();

  // "Good Job!" badge
  ctx.fillStyle = '#fbbf24';
  rr(ctx, FX + FW - 74, FY - 13, 70, 24, 12); ctx.fill();
  ctx.font = 'bold 11px Arial, sans-serif'; ctx.fillStyle = '#1e1b4b';
  ctx.fillText('Good Job! ★', FX + FW - 39, FY - 1);

  // Pom-pom accents
  ctx.font = '22px serif'; ctx.fillStyle = 'rgba(251,191,36,0.7)';
  ctx.fillText('🎀', FX + 18, FY + FH + 20);
  ctx.fillText('🎀', FX + FW - 18, FY + FH + 20);

  // ── Right: Score area ────────────────────────────────────────
  const RCX = 310 + (W - 310 - 36) / 2; // center of right region

  ctx.font = '12px Arial, sans-serif'; ctx.fillStyle = 'rgba(196,181,253,0.85)';
  ctx.fillText('以下の方がチアダンスを修了したことを証明します', RCX, 162);

  // Student name
  const name = studentName || 'ダンサー';
  ctx.font = 'bold 38px Arial, sans-serif'; ctx.fillStyle = '#ffffff';
  // Clamp font size if name is long
  let fontSize = 38;
  while (ctx.measureText(name).width > 340 && fontSize > 18) {
    fontSize -= 2; ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  }
  ctx.fillText(name, RCX, 210);

  // Underline
  const nw = Math.min(ctx.measureText(name).width + 16, 320);
  const ug = ctx.createLinearGradient(RCX - nw / 2, 0, RCX + nw / 2, 0);
  ug.addColorStop(0, 'transparent'); ug.addColorStop(0.3, '#fbbf24'); ug.addColorStop(0.7, '#fbbf24'); ug.addColorStop(1, 'transparent');
  ctx.strokeStyle = ug; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(RCX - nw / 2, 228); ctx.lineTo(RCX + nw / 2, 228); ctx.stroke();

  // Score circle
  const SCX = RCX - 54, SCY = 300, SCR = 48;

  const glow = ctx.createRadialGradient(SCX, SCY, 0, SCX, SCY, SCR + 12);
  glow.addColorStop(0, 'rgba(251,191,36,0.35)'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(SCX, SCY, SCR + 12, 0, Math.PI * 2); ctx.fill();

  const cg = ctx.createRadialGradient(SCX - 12, SCY - 12, 0, SCX, SCY, SCR);
  cg.addColorStop(0, '#fde68a'); cg.addColorStop(1, '#f59e0b');
  ctx.beginPath(); ctx.arc(SCX, SCY, SCR, 0, Math.PI * 2);
  ctx.fillStyle = cg; ctx.fill();
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5; ctx.stroke();

  ctx.font = 'bold 32px Arial, sans-serif'; ctx.fillStyle = '#1e1b4b';
  ctx.fillText(`${result.totalScore}`, SCX, SCY - 7);
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('点', SCX, SCY + 17);

  // Grade emoji + rank
  ctx.font = '48px serif'; ctx.fillStyle = '#fff';
  ctx.fillText(getGradeEmoji(result.grade), RCX + 54, SCY - 8);
  ctx.font = 'bold 24px Arial, sans-serif'; ctx.fillStyle = '#fde68a';
  ctx.fillText(`ランク ${result.grade}`, RCX + 54, SCY + 28);
  ctx.font = '12px Arial, sans-serif'; ctx.fillStyle = 'rgba(196,181,253,0.9)';
  ctx.fillText(getGradeMessage(result.grade), RCX, SCY + 54);

  // Stars
  const stars = Math.ceil(result.totalScore / 20);
  ctx.font = '18px serif';
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < stars ? '#fbbf24' : 'rgba(251,191,36,0.15)';
    ctx.fillText('★', RCX - 44 + i * 23, 376);
  }

  // ── Sub-score row ────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(196,181,253,0.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(54, 408); ctx.lineTo(W - 54, 408); ctx.stroke();

  const subs = [
    { label: 'タイミング', score: result.timingScore, emoji: '🎵' },
    { label: 'ポーズ精度', score: result.poseAccuracyScore, emoji: '💃' },
    { label: 'スムーズさ', score: result.smoothnessScore, emoji: '🌊' },
  ];
  const sp = (W - 108) / 3;
  subs.forEach((s, i) => {
    const x = 54 + sp * i + sp / 2;
    ctx.font = '18px serif'; ctx.fillStyle = '#fff'; ctx.fillText(s.emoji, x, 428);
    ctx.font = 'bold 16px Arial, sans-serif'; ctx.fillStyle = '#fde68a'; ctx.fillText(`${s.score}点`, x, 452);
    ctx.font = '10px Arial, sans-serif'; ctx.fillStyle = 'rgba(196,181,253,0.75)'; ctx.fillText(s.label, x, 468);
  });

  // ── Footer ───────────────────────────────────────────────────
  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.font = '11px Arial, sans-serif'; ctx.fillStyle = 'rgba(196,181,253,0.5)';
  ctx.fillText(`認定日: ${today}`, W / 2, 494);
  ctx.font = 'bold 13px Arial, sans-serif'; ctx.fillStyle = '#a78bfa';
  ctx.fillText('★  EVOKE for kids × AI Chieko 認定  ★', W / 2, 516);
  ctx.font = '14px serif'; ctx.fillStyle = 'rgba(251,191,36,0.6)';
  ctx.fillText('🎀  💃  ⭐  💃  🎀', W / 2, 540);
}

export default function Certificate({ result, studentName, capturedFrame, onRestart, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const colors = ['#fbbf24', '#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#c4b5fd'];
    setConfetti(Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
    })));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const render = (img: HTMLImageElement | null) => {
      drawCertificate(canvas, result, studentName, img);
      setImageUrl(canvas.toDataURL('image/png'));
    };

    if (capturedFrame) {
      const img = new Image();
      img.onload = () => render(img);
      img.onerror = () => render(null);
      img.src = capturedFrame;
    } else {
      render(null);
    }
  }, [result, studentName, capturedFrame]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `evoke-certificate-${studentName || 'dancer'}.png`;
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
    if (typeof navigator.share === 'function') {
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], 'evoke-certificate.png', { type: 'image/png' });
        await navigator.share({ files: [file], title: 'チアダンス修了証' });
        return;
      } catch { /* fallback */ }
    }
    handleDownload();
  };

  return (
    <div className="space-y-8">
      {confetti.map((c, i) => (
        <div key={i} className="confetti-piece" style={{
          left: `${c.x}px`, backgroundColor: c.color,
          width: `${c.size}px`, height: `${c.size}px`,
          animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s`,
        }} />
      ))}

      <div className="text-center">
        <div className="text-6xl mb-3 float-anim inline-block">🏆</div>
        <h2 className="text-3xl font-black gradient-text mb-1">修了証が完成しました！</h2>
        <p className="text-gray-500 text-sm">ダウンロードしてInstagram・LINEでシェアしよう🎀</p>
      </div>

      {/* Certificate preview */}
      <div className="card overflow-hidden p-2">
        <canvas ref={canvasRef} className="hidden" />
        {imageUrl ? (
          <img src={imageUrl} alt="チアダンス修了証" className="w-full rounded-2xl" />
        ) : (
          <div className="flex items-center justify-center h-44 rounded-2xl" style={{ background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)' }}>
            <p className="text-violet-300 font-bold animate-pulse">🎨 修了証を作成中...</p>
          </div>
        )}
      </div>

      {/* Share buttons */}
      <div className="card">
        <h3 className="font-bold text-gray-700 mb-3 text-center">シェアして自慢しよう！🎉</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button onClick={handleDownload} disabled={!imageUrl}
            className="flex items-center justify-center gap-2 py-3 text-white font-bold rounded-2xl shadow hover:scale-105 transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
            <span>⬇️</span><span>保存</span>
          </button>
          <button onClick={handleInstagramShare} disabled={!imageUrl}
            className="flex items-center justify-center gap-2 py-3 text-white font-bold rounded-2xl shadow hover:scale-105 transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#e1306c,#833ab4)' }}>
            <span>📸</span><span>Instagram</span>
          </button>
          <button onClick={handleTwitterShare}
            className="flex items-center justify-center gap-2 py-3 bg-black text-white font-bold rounded-2xl shadow hover:scale-105 transition-all">
            <span className="font-bold">𝕏</span><span>Twitter</span>
          </button>
          <button onClick={handleLineShare}
            className="flex items-center justify-center gap-2 py-3 text-white font-bold rounded-2xl shadow hover:scale-105 transition-all"
            style={{ background: '#06C755' }}>
            <span>💬</span><span>LINE</span>
          </button>
        </div>
      </div>

      {/* Score summary */}
      <div className="card text-center" style={{ background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', color: 'white' }}>
        <div className="flex items-center justify-center gap-4 mb-3 flex-wrap">
          <span className="text-5xl">{getGradeEmoji(result.grade)}</span>
          <div>
            <p className="text-4xl font-black text-yellow-300">{result.totalScore}点</p>
            <p className="text-violet-300 font-bold text-sm">ランク {result.grade} — {getGradeMessage(result.grade)}</p>
          </div>
        </div>
        <div className="flex justify-center gap-4 text-sm text-violet-300 flex-wrap">
          <span>🎵 {result.timingScore}点</span>
          <span>💃 {result.poseAccuracyScore}点</span>
          <span>🌊 {result.smoothnessScore}点</span>
        </div>
        <div className="flex justify-center gap-1 mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-xl ${i < Math.ceil(result.totalScore / 20) ? 'text-yellow-300' : 'text-indigo-900'}`}>★</span>
          ))}
        </div>
      </div>

      {/* EVOKE CTA */}
      <div className="card border-2 border-violet-200 text-center" style={{ background: 'linear-gradient(135deg,#f5f3ff,#eef2ff)' }}>
        <p className="text-base font-black text-indigo-900 mb-1">🎀 EVOKEのレッスンに来てみよう！</p>
        <p className="text-sm text-gray-500">1.5時間で、自信とマナーが身につく。1回完結型チアダンス・ワークショップ</p>
        <p className="text-xs text-violet-400 mt-1">世田谷区で開催 ｜ 年少〜小学校低学年 ｜ 単発参加OK</p>
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <button onClick={onBack} className="btn-secondary">← 結果に戻る</button>
        <button onClick={onRestart}
          className="text-white font-black px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4338ca)' }}>
          もう一度チャレンジ！ 💃
        </button>
      </div>
    </div>
  );
}

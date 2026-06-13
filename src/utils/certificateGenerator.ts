import { AnalysisResult } from './poseAnalysis';

export interface CertificateOptions {
  studentName: string;
  result: AnalysisResult;
  date: string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.3);
  ctx.bezierCurveTo(cx, cy, cx - size, cy, cx - size, cy - size * 0.3);
  ctx.bezierCurveTo(cx - size, cy - size * 0.8, cx, cy - size * 0.8, cx, cy - size * 0.4);
  ctx.bezierCurveTo(cx, cy - size * 0.8, cx + size, cy - size * 0.8, cx + size, cy - size * 0.3);
  ctx.bezierCurveTo(cx + size, cy, cx, cy, cx, cy + size * 0.3);
  ctx.closePath();
}

function getGradeColors(grade: string): { primary: string; secondary: string } {
  switch (grade) {
    case 'S': return { primary: '#FFD700', secondary: '#FFA500' };
    case 'A': return { primary: '#FF69B4', secondary: '#FF1493' };
    case 'B': return { primary: '#9B59B6', secondary: '#6C3483' };
    case 'C': return { primary: '#3498DB', secondary: '#1A5276' };
    default: return { primary: '#95A5A6', secondary: '#717D7E' };
  }
}

export function generateCertificate(
  canvas: HTMLCanvasElement,
  options: CertificateOptions
): void {
  const { studentName, result, date } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // ===== Background =====
  const bgGradient = ctx.createLinearGradient(0, 0, W, H);
  bgGradient.addColorStop(0, '#FFF0F5');
  bgGradient.addColorStop(0.3, '#F8F0FF');
  bgGradient.addColorStop(0.6, '#F0F0FF');
  bgGradient.addColorStop(1, '#F0F8FF');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, W, H);

  // ===== Decorative background circles =====
  const circleData = [
    { x: 0.08, y: 0.1, r: 0.12, color: 'rgba(255, 182, 213, 0.3)' },
    { x: 0.92, y: 0.15, r: 0.10, color: 'rgba(201, 177, 255, 0.3)' },
    { x: 0.05, y: 0.85, r: 0.09, color: 'rgba(255, 230, 128, 0.3)' },
    { x: 0.95, y: 0.80, r: 0.11, color: 'rgba(179, 229, 252, 0.3)' },
    { x: 0.5, y: 0.05, r: 0.06, color: 'rgba(181, 234, 215, 0.3)' },
  ];

  circleData.forEach(({ x, y, r, color }) => {
    ctx.beginPath();
    ctx.arc(x * W, y * H, r * W, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // ===== Outer border =====
  ctx.save();
  drawRoundedRect(ctx, 20, 20, W - 40, H - 40, 30);
  ctx.strokeStyle = 'rgba(201, 177, 255, 0.6)';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  // ===== Inner border (double border effect) =====
  ctx.save();
  drawRoundedRect(ctx, 30, 30, W - 60, H - 60, 24);
  ctx.strokeStyle = 'rgba(255, 182, 213, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // ===== Corner decorations - Stars =====
  const cornerStars = [
    { x: 0.08, y: 0.07 },
    { x: 0.92, y: 0.07 },
    { x: 0.08, y: 0.93 },
    { x: 0.92, y: 0.93 },
  ];
  cornerStars.forEach(({ x, y }) => {
    drawStar(ctx, x * W, y * H, 22, 10, 5);
    const starGrad = ctx.createRadialGradient(x * W, y * H, 0, x * W, y * H, 22);
    starGrad.addColorStop(0, '#FFE57A');
    starGrad.addColorStop(1, '#FFB300');
    ctx.fillStyle = starGrad;
    ctx.fill();
    ctx.strokeStyle = '#FFA000';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // ===== Header area =====
  // Dance emoji large
  ctx.font = '72px serif';
  ctx.textAlign = 'center';
  ctx.fillText('💃', W / 2, 110);

  // Title "修了証"
  ctx.font = `bold 52px 'M PLUS Rounded 1c', 'Hiragino Kaku Gothic Pro', sans-serif`;
  ctx.textAlign = 'center';
  const titleGrad = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0);
  titleGrad.addColorStop(0, '#FF69B4');
  titleGrad.addColorStop(0.5, '#9B59B6');
  titleGrad.addColorStop(1, '#3498DB');
  ctx.fillStyle = titleGrad;
  ctx.fillText('ダンス修了証', W / 2, 175);

  // Subtitle
  ctx.font = `16px 'M PLUS Rounded 1c', sans-serif`;
  ctx.fillStyle = '#999';
  ctx.fillText('DANCE COMPLETION CERTIFICATE', W / 2, 200);

  // ===== Divider line with hearts =====
  ctx.save();
  ctx.strokeStyle = 'rgba(201, 177, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(60, 218);
  ctx.lineTo(W - 60, 218);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Hearts on divider
  [0.25, 0.5, 0.75].forEach((pct) => {
    ctx.save();
    drawHeart(ctx, pct * W, 218, 8);
    ctx.fillStyle = '#FFB7D5';
    ctx.fill();
    ctx.restore();
  });

  // ===== "This certifies that" text =====
  ctx.font = `18px 'M PLUS Rounded 1c', sans-serif`;
  ctx.fillStyle = '#888';
  ctx.textAlign = 'center';
  ctx.fillText('以下の者が優秀な成績でダンスを修了したことを証明します', W / 2, 255);

  // ===== Student name =====
  ctx.font = `bold 44px 'M PLUS Rounded 1c', 'Hiragino Kaku Gothic Pro', sans-serif`;
  const nameGrad = ctx.createLinearGradient(W * 0.3, 0, W * 0.7, 0);
  nameGrad.addColorStop(0, '#E91E8C');
  nameGrad.addColorStop(1, '#7B2FBE');
  ctx.fillStyle = nameGrad;
  ctx.textAlign = 'center';
  ctx.fillText(studentName + ' さん', W / 2, 315);

  // Underline for name
  const nameWidth = ctx.measureText(studentName + ' さん').width;
  ctx.save();
  ctx.strokeStyle = 'rgba(233, 30, 140, 0.3)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - nameWidth / 2, 325);
  ctx.lineTo(W / 2 + nameWidth / 2, 325);
  ctx.stroke();
  ctx.restore();

  // ===== Score section background =====
  ctx.save();
  drawRoundedRect(ctx, 50, 345, W - 100, 160, 20);
  const scoreBgGrad = ctx.createLinearGradient(50, 345, W - 50, 505);
  scoreBgGrad.addColorStop(0, 'rgba(255, 240, 245, 0.8)');
  scoreBgGrad.addColorStop(1, 'rgba(248, 240, 255, 0.8)');
  ctx.fillStyle = scoreBgGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(201, 177, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // ===== Grade badge =====
  const gradeColors = getGradeColors(result.grade);
  const gradeBadgeCenterX = W / 2 - 120;
  const gradeBadgeCenterY = 420;

  ctx.save();
  ctx.beginPath();
  ctx.arc(gradeBadgeCenterX, gradeBadgeCenterY, 45, 0, Math.PI * 2);
  const badgeGrad = ctx.createRadialGradient(
    gradeBadgeCenterX - 10, gradeBadgeCenterY - 10, 5,
    gradeBadgeCenterX, gradeBadgeCenterY, 45
  );
  badgeGrad.addColorStop(0, gradeColors.primary);
  badgeGrad.addColorStop(1, gradeColors.secondary);
  ctx.fillStyle = badgeGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // Grade letter
  ctx.font = `bold 48px 'M PLUS Rounded 1c', sans-serif`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(result.grade, gradeBadgeCenterX, gradeBadgeCenterY);
  ctx.textBaseline = 'alphabetic';

  // ===== Total score =====
  const scoreCenterX = W / 2 + 30;
  ctx.font = `bold 72px 'M PLUS Rounded 1c', sans-serif`;
  const scoreGrad = ctx.createLinearGradient(scoreCenterX - 60, 0, scoreCenterX + 60, 0);
  scoreGrad.addColorStop(0, '#FF69B4');
  scoreGrad.addColorStop(1, '#9B59B6');
  ctx.fillStyle = scoreGrad;
  ctx.textAlign = 'center';
  ctx.fillText(`${result.totalScore}`, scoreCenterX, 430);

  ctx.font = `20px 'M PLUS Rounded 1c', sans-serif`;
  ctx.fillStyle = '#999';
  ctx.fillText('点 / 100点満点', scoreCenterX, 458);

  // Score sub-details
  const subScores = [
    { label: 'タイミング', score: result.timingScore, emoji: '🎵' },
    { label: 'ポーズ', score: result.poseAccuracyScore, emoji: '💃' },
    { label: 'スムーズ', score: result.smoothnessScore, emoji: '✨' },
  ];

  const subW = (W - 100) / 3;
  subScores.forEach((item, i) => {
    const subX = 50 + subW * i + subW / 2;
    const subY = 490;

    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.emoji, subX, subY - 10);

    ctx.font = `bold 16px 'M PLUS Rounded 1c', sans-serif`;
    ctx.fillStyle = '#666';
    ctx.fillText(`${item.label}: ${item.score}点`, subX, subY + 8);
  });

  // ===== Star rating =====
  const maxStars = 5;
  const filledStars = Math.round((result.totalScore / 100) * maxStars);
  const starY = 535;
  const starSpacing = 40;
  const starStartX = W / 2 - (maxStars - 1) * starSpacing / 2;

  for (let i = 0; i < maxStars; i++) {
    const sx = starStartX + i * starSpacing;
    drawStar(ctx, sx, starY, 16, 7, 5);

    if (i < filledStars) {
      const sg = ctx.createRadialGradient(sx, starY, 0, sx, starY, 16);
      sg.addColorStop(0, '#FFE57A');
      sg.addColorStop(1, '#FFB300');
      ctx.fillStyle = sg;
    } else {
      ctx.fillStyle = '#E0E0E0';
    }
    ctx.fill();
    ctx.strokeStyle = i < filledStars ? '#FFA000' : '#BDBDBD';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ===== Decorative floating elements =====
  const floatingEmojis = ['✨', '🌟', '💫', '⭐', '🎵', '🎶', '🎀', '🌸'];
  const floatingPositions = [
    { x: 0.12, y: 0.42 }, { x: 0.88, y: 0.38 },
    { x: 0.15, y: 0.65 }, { x: 0.85, y: 0.62 },
    { x: 0.10, y: 0.55 }, { x: 0.90, y: 0.52 },
    { x: 0.13, y: 0.78 }, { x: 0.87, y: 0.75 },
  ];

  ctx.font = '20px serif';
  floatingEmojis.forEach((emoji, i) => {
    const pos = floatingPositions[i];
    if (pos) {
      ctx.fillText(emoji, pos.x * W, pos.y * H);
    }
  });

  // ===== Footer divider =====
  ctx.save();
  ctx.strokeStyle = 'rgba(201, 177, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(60, 570);
  ctx.lineTo(W - 60, 570);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // ===== Date and signature =====
  ctx.font = `16px 'M PLUS Rounded 1c', sans-serif`;
  ctx.fillStyle = '#AAA';
  ctx.textAlign = 'left';
  ctx.fillText(`発行日：${date}`, 70, 600);

  ctx.textAlign = 'right';
  ctx.fillText('Certified by AI Chieko 💃', W - 70, 600);

  // Signature underline
  const sigText = 'Certified by AI Chieko 💃';
  const sigWidth = ctx.measureText(sigText).width;
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 182, 213, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W - 70 - sigWidth, 604);
  ctx.lineTo(W - 70, 604);
  ctx.stroke();
  ctx.restore();

  // ===== Bottom confetti dots =====
  const dotColors = ['#FFB7D5', '#C9B1FF', '#FFE680', '#B3E5FC', '#B5EAD7'];
  for (let i = 0; i < 20; i++) {
    const dotX = 60 + (W - 120) * (i / 19);
    const dotY = 625 + Math.sin(i * 0.8) * 8;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
    ctx.fillStyle = dotColors[i % dotColors.length];
    ctx.fill();
  }

  // ===== App watermark =====
  ctx.font = `12px 'M PLUS Rounded 1c', sans-serif`;
  ctx.fillStyle = 'rgba(180, 180, 180, 0.6)';
  ctx.textAlign = 'center';
  ctx.fillText('AI Chieko Dance Scorer', W / 2, H - 20);
}

export function downloadCertificate(canvas: HTMLCanvasElement, studentName: string): void {
  const link = document.createElement('a');
  link.download = `dance-certificate-${studentName}-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

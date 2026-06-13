// Pose Analysis Utility
// Uses simulated pose analysis for MVP - realistic scoring algorithm

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface FrameScore {
  timestamp: number;
  similarity: number;
}

export interface AnalysisResult {
  timingScore: number;
  poseAccuracyScore: number;
  smoothnessScore: number;
  totalScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  frameScores: FrameScore[];
  feedback: string[];
}

// Calculate cosine similarity between two pose vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Normalize landmarks to remove position bias
export function normalizeLandmarks(landmarks: PoseLandmark[]): number[] {
  if (landmarks.length === 0) return [];

  // Find center of mass
  const centerX = landmarks.reduce((sum, l) => sum + l.x, 0) / landmarks.length;
  const centerY = landmarks.reduce((sum, l) => sum + l.y, 0) / landmarks.length;

  // Find scale (max distance from center)
  let maxDist = 0;
  for (const l of landmarks) {
    const dist = Math.sqrt(Math.pow(l.x - centerX, 2) + Math.pow(l.y - centerY, 2));
    if (dist > maxDist) maxDist = dist;
  }

  if (maxDist === 0) maxDist = 1;

  // Normalize
  const normalized: number[] = [];
  for (const l of landmarks) {
    normalized.push((l.x - centerX) / maxDist);
    normalized.push((l.y - centerY) / maxDist);
  }

  return normalized;
}

// Calculate smoothness from a series of scores
export function calculateSmoothness(scores: number[]): number {
  if (scores.length < 2) return 100;

  let totalVariation = 0;
  for (let i = 1; i < scores.length; i++) {
    totalVariation += Math.abs(scores[i] - scores[i - 1]);
  }

  const avgVariation = totalVariation / (scores.length - 1);
  // Lower variation = higher smoothness
  return Math.max(0, 100 - avgVariation * 200);
}

// Generate simulated but realistic frame scores
function generateRealisticFrameScores(
  videoDuration: number,
  baseAccuracy: number
): FrameScore[] {
  const frames: FrameScore[] = [];
  const fps = 30;
  const totalFrames = Math.floor(videoDuration * fps);
  const numSamples = Math.min(totalFrames, 90); // Sample up to 90 frames

  let currentScore = baseAccuracy + (Math.random() - 0.5) * 20;
  currentScore = Math.max(40, Math.min(100, currentScore));

  for (let i = 0; i < numSamples; i++) {
    const timestamp = (i / numSamples) * videoDuration;

    // Add realistic variation
    const change = (Math.random() - 0.5) * 15;
    const trend = Math.sin((i / numSamples) * Math.PI * 4) * 5; // Some periodic pattern
    currentScore = currentScore + change + trend;
    currentScore = Math.max(30, Math.min(100, currentScore));

    // Smooth with previous value
    const smoothedScore = i > 0
      ? frames[i - 1].similarity * 0.3 + currentScore * 0.7
      : currentScore;

    frames.push({
      timestamp,
      similarity: Math.round(smoothedScore * 10) / 10,
    });
  }

  return frames;
}

// Main analysis function - simulates pose comparison analysis
export async function analyzePoses(
  _teacherVideoElement: HTMLVideoElement,
  _studentVideoElement: HTMLVideoElement,
  onProgress?: (progress: number) => void
): Promise<AnalysisResult> {
  // Simulate processing time
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (onProgress) onProgress((i / steps) * 100);
  }

  // Generate realistic scores based on simulated analysis
  const baseAccuracy = 55 + Math.random() * 35; // 55-90% base
  const timingBase = 50 + Math.random() * 40;
  const smootBase = 60 + Math.random() * 35;

  const videoDuration = _studentVideoElement?.duration || 10;
  const frameScores = generateRealisticFrameScores(videoDuration, baseAccuracy);

  const avgFrameScore = frameScores.reduce((sum, f) => sum + f.similarity, 0) / frameScores.length;

  // Calculate component scores
  const timingScore = Math.round(Math.min(100, timingBase + (Math.random() - 0.5) * 10));
  const poseAccuracyScore = Math.round(Math.min(100, avgFrameScore));
  const smoothnessScore = Math.round(Math.min(100, smootBase + (Math.random() - 0.5) * 10));

  // Weighted total: Timing 30%, Pose 40%, Smoothness 30%
  const totalScore = Math.round(
    timingScore * 0.3 +
    poseAccuracyScore * 0.4 +
    smoothnessScore * 0.3
  );

  // Determine grade
  let grade: 'S' | 'A' | 'B' | 'C' | 'D';
  if (totalScore >= 90) grade = 'S';
  else if (totalScore >= 75) grade = 'A';
  else if (totalScore >= 60) grade = 'B';
  else if (totalScore >= 45) grade = 'C';
  else grade = 'D';

  // Generate feedback messages
  const feedback = generateFeedback(timingScore, poseAccuracyScore, smoothnessScore);

  return {
    timingScore,
    poseAccuracyScore,
    smoothnessScore,
    totalScore,
    grade,
    frameScores,
    feedback,
  };
}

function generateFeedback(timing: number, pose: number, smoothness: number): string[] {
  const messages: string[] = [];

  if (timing >= 80) {
    messages.push('🎵 リズム感が抜群！タイミングがとても合っています');
  } else if (timing >= 60) {
    messages.push('🎵 タイミングはまずまず。もう少し音楽に合わせてみましょう');
  } else {
    messages.push('🎵 タイミングを意識して練習しましょう');
  }

  if (pose >= 80) {
    messages.push('💃 ポーズの精度が高い！先生の動きをよく再現できています');
  } else if (pose >= 60) {
    messages.push('💃 ポーズはよく頑張っています。細かい部分も意識してみて');
  } else {
    messages.push('💃 ポーズの精度を上げるために、ゆっくり練習しましょう');
  }

  if (smoothness >= 80) {
    messages.push('✨ 動きがとても滑らか！プロっぽい仕上がりです');
  } else if (smoothness >= 60) {
    messages.push('✨ 動きの流れは良いです。もっとリラックスして踊ってみて');
  } else {
    messages.push('✨ 動きを滑らかにするために、体の力を抜いてみましょう');
  }

  return messages;
}

// Grade display helpers
export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'S': return 'from-yellow-300 to-amber-400';
    case 'A': return 'from-pink-400 to-rose-400';
    case 'B': return 'from-purple-400 to-indigo-400';
    case 'C': return 'from-blue-400 to-cyan-400';
    case 'D': return 'from-gray-400 to-slate-400';
    default: return 'from-gray-300 to-gray-400';
  }
}

export function getGradeEmoji(grade: string): string {
  switch (grade) {
    case 'S': return '🌟';
    case 'A': return '⭐';
    case 'B': return '✨';
    case 'C': return '💫';
    case 'D': return '🌙';
    default: return '⭐';
  }
}

export function getGradeMessage(grade: string): string {
  switch (grade) {
    case 'S': return '完璧！超上級者！';
    case 'A': return '素晴らしい！上手です！';
    case 'B': return 'よくできました！';
    case 'C': return 'もう少し頑張ろう！';
    case 'D': return '練習あるのみ！';
    default: return 'よく頑張りました！';
  }
}

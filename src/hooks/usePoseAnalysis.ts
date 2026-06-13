import { useState, useCallback } from 'react';
import { analyzePoses, AnalysisResult } from '../utils/poseAnalysis';

interface UsePoseAnalysisReturn {
  isAnalyzing: boolean;
  progress: number;
  result: AnalysisResult | null;
  error: string | null;
  startAnalysis: (
    teacherVideo: HTMLVideoElement,
    studentVideo: HTMLVideoElement
  ) => Promise<void>;
  reset: () => void;
}

export function usePoseAnalysis(): UsePoseAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = useCallback(async (
    teacherVideo: HTMLVideoElement,
    studentVideo: HTMLVideoElement
  ) => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzePoses(
        teacherVideo,
        studentVideo,
        (p) => setProgress(p)
      );
      setResult(analysisResult);
    } catch (err) {
      console.error('Pose analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsAnalyzing(false);
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    progress,
    result,
    error,
    startAnalysis,
    reset,
  };
}

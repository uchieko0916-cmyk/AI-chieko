import React, { useState } from 'react';
import TeacherSetup from './components/TeacherSetup';
import VideoUpload from './components/VideoUpload';
import ScoreDisplay from './components/ScoreDisplay';
import Certificate from './components/Certificate';
import { AnalysisResult } from './utils/poseAnalysis';

export type AppStep = 'teacher' | 'student' | 'scoring' | 'certificate';

export interface TeacherVideo {
  url: string;
  name: string;
  isDemo: boolean;
}

const STEPS: { key: AppStep; label: string; emoji: string }[] = [
  { key: 'teacher', label: '先生動画', emoji: '🎬' },
  { key: 'student', label: '自分の動画', emoji: '💃' },
  { key: 'scoring', label: 'AI採点', emoji: '⭐' },
  { key: 'certificate', label: '修了証', emoji: '🏆' },
];

export default function App() {
  const [step, setStep] = useState<AppStep>('teacher');
  const [teacherVideo, setTeacherVideo] = useState<TeacherVideo | null>(null);
  const [studentVideo, setStudentVideo] = useState<{ url: string; name: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [studentName, setStudentName] = useState('');
  const [capturedFrame, setCapturedFrame] = useState<string>('');

  const stepIndex = STEPS.findIndex(s => s.key === step);

  const handleTeacherSet = (video: TeacherVideo) => {
    setTeacherVideo(video);
    setStep('student');
  };

  const handleStudentSet = (url: string, name: string) => {
    setStudentVideo({ url, name });
    setStep('scoring');
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
  };

  const handleShowCertificate = (name: string, frame: string) => {
    setStudentName(name);
    setCapturedFrame(frame);
    setStep('certificate');
  };

  const handleRestart = () => {
    setStep('teacher');
    setTeacherVideo(null);
    setStudentVideo(null);
    setAnalysisResult(null);
    setStudentName('');
    setCapturedFrame('');
  };

  const handleStepClick = (targetStep: AppStep) => {
    const targetIndex = STEPS.findIndex(s => s.key === targetStep);
    if (targetIndex < stepIndex) {
      setStep(targetStep);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 shadow-md" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl float-anim">🎀</span>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-white font-black text-base tracking-wide" style={{ fontStyle: 'italic' }}>EVOKE</span>
                <span className="text-violet-300 text-xs font-bold">for kids</span>
              </div>
              <p className="text-violet-300 text-xs font-bold tracking-wider">AI ダンス採点</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.key}>
                <button
                  onClick={() => handleStepClick(s.key)}
                  className={`flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                    s.key === step
                      ? 'bg-white text-violet-700 shadow-md scale-105'
                      : i < stepIndex
                      ? 'bg-violet-700 text-violet-100 cursor-pointer hover:bg-violet-600'
                      : 'bg-violet-900 text-violet-500 cursor-not-allowed'
                  }`}
                >
                  <span>{s.emoji}</span>
                  <span className="hidden md:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <span className={`text-xs mx-0.5 ${i < stepIndex ? 'text-violet-300' : 'text-violet-700'}`}>›</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Star decoration bar */}
        <div className="flex justify-center gap-3 pb-1.5 text-xs text-yellow-300 opacity-70">
          {'★ ☆ ★ ☆ ★ ☆ ★ ☆ ★ ☆ ★ ☆ ★ ☆ ★'.split(' ').map((star, i) => (
            <span key={i}>{star}</span>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {step === 'teacher' && (
          <TeacherSetup onVideoSet={handleTeacherSet} />
        )}

        {step === 'student' && teacherVideo && (
          <VideoUpload
            teacherVideo={teacherVideo}
            onVideoSet={handleStudentSet}
            onBack={() => setStep('teacher')}
          />
        )}

        {step === 'scoring' && teacherVideo && studentVideo && (
          <ScoreDisplay
            teacherVideoUrl={teacherVideo.url}
            studentVideoUrl={studentVideo.url}
            analysisResult={analysisResult}
            onAnalysisComplete={handleAnalysisComplete}
            onShowCertificate={handleShowCertificate}
            onBack={() => setStep('student')}
          />
        )}

        {step === 'certificate' && analysisResult && (
          <Certificate
            result={analysisResult}
            studentName={studentName}
            capturedFrame={capturedFrame}
            onRestart={handleRestart}
            onBack={() => setStep('scoring')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-violet-400 font-bold">
        <p>⭐ EVOKE for kids × AI Chieko ⭐</p>
        <p className="text-xs text-violet-300 mt-1">1.5時間で、自信とマナーが身につく。</p>
      </footer>
    </div>
  );
}

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
      {/* Header — EVOKE スタイル（白ベース） */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

          {/* Logo */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xl">🎀</span>
            <div className="leading-none">
              <div className="flex items-baseline gap-1">
                <span className="font-black text-base tracking-wide text-indigo-950" style={{ fontStyle: 'italic' }}>EVOKE</span>
                <span className="text-indigo-400 text-xs font-bold">for kids</span>
              </div>
              <span className="text-indigo-300 text-[10px] font-bold tracking-widest">AI DANCE</span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.key}>
                <button
                  onClick={() => handleStepClick(s.key)}
                  className={`flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    s.key === step
                      ? 'text-white shadow-md scale-105'
                      : i < stepIndex
                      ? 'bg-indigo-50 text-indigo-600 cursor-pointer hover:bg-indigo-100'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  style={s.key === step ? { background: 'linear-gradient(135deg, #4338ca, #7c3aed)' } : {}}
                >
                  <span>{s.emoji}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <span className={`text-xs ${i < stepIndex ? 'text-indigo-300' : 'text-gray-200'}`}>›</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* CTA button */}
          <a
            href="https://v0-cheer-dance-school-ui.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-indigo-900 text-indigo-900 text-xs font-black hover:bg-indigo-900 hover:text-white transition-all shrink-0"
          >
            <span>📅</span>
            <span>体験予約</span>
          </a>
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

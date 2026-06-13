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
  { key: 'student', label: '生徒動画', emoji: '💃' },
  { key: 'scoring', label: 'AI採点', emoji: '⭐' },
  { key: 'certificate', label: '修了証', emoji: '🏆' },
];

export default function App() {
  const [step, setStep] = useState<AppStep>('teacher');
  const [teacherVideo, setTeacherVideo] = useState<TeacherVideo | null>(null);
  const [studentVideo, setStudentVideo] = useState<{ url: string; name: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [studentName, setStudentName] = useState('');

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

  const handleShowCertificate = (name: string) => {
    setStudentName(name);
    setStep('certificate');
  };

  const handleRestart = () => {
    setStep('teacher');
    setTeacherVideo(null);
    setStudentVideo(null);
    setAnalysisResult(null);
    setStudentName('');
  };

  const handleStepClick = (targetStep: AppStep) => {
    const targetIndex = STEPS.findIndex(s => s.key === targetStep);
    // Only allow going back to completed steps
    if (targetIndex < stepIndex) {
      setStep(targetStep);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white border-opacity-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl float-anim">💃</span>
            <div>
              <h1 className="text-lg font-black gradient-text leading-tight">AI Chieko</h1>
              <p className="text-xs text-gray-500">ダンス採点アプリ</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1 md:gap-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.key}>
                <button
                  onClick={() => handleStepClick(s.key)}
                  className={`flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                    s.key === step
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md scale-105'
                      : i < stepIndex
                      ? 'bg-green-100 text-green-600 cursor-pointer hover:bg-green-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>{s.emoji}</span>
                  <span className="hidden md:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <span className={`text-gray-300 ${i < stepIndex ? 'text-green-300' : ''}`}>›</span>
                )}
              </React.Fragment>
            ))}
          </div>
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
            onRestart={handleRestart}
            onBack={() => setStep('scoring')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400">
        <p>Made with 💖 by AI Chieko | ダンスを楽しもう！</p>
      </footer>
    </div>
  );
}

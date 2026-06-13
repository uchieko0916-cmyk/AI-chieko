import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'triangle';
}

const COLORS = [
  '#FFB7D5', '#C9B1FF', '#FFE680', '#B3E5FC',
  '#B5EAD7', '#FFDAB9', '#FF9AA2', '#C7CEEA',
  '#FFDAC1', '#E2F0CB', '#B5EAD7', '#FF9AA2',
];

function generatePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 10,
    shape: (['circle', 'square', 'triangle'] as const)[Math.floor(Math.random() * 3)],
  }));
}

export default function ConfettiRain() {
  const [pieces] = useState(() => generatePieces(60));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            backgroundColor: piece.color,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            borderRadius: piece.shape === 'circle' ? '50%' : piece.shape === 'square' ? '2px' : '0',
            clipPath: piece.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
            opacity: 0.9,
          }}
        />
      ))}

      {/* Big emojis */}
      {['🎉', '⭐', '💃', '🌟', '✨', '🎊', '💫', '🎵'].map((emoji, i) => (
        <div
          key={`emoji-${i}`}
          style={{
            position: 'absolute',
            left: `${10 + i * 12}%`,
            top: '-50px',
            fontSize: '24px',
            animation: `confettiFall ${2 + Math.random() * 2}s ease-in ${i * 0.3}s infinite`,
            zIndex: 10000,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
}

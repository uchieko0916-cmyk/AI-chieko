interface Props {
  twitterUrl: string;
  lineUrl: string;
  shareText: string;
  certDataUrl?: string;
}

export default function ShareButtons({ twitterUrl, lineUrl, shareText, certDataUrl }: Props) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      alert('テキストをコピーしました！');
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        const shareData: ShareData = { text: shareText };
        if (certDataUrl) {
          const res = await fetch(certDataUrl);
          const blob = await res.blob();
          const file = new File([blob], 'dance-certificate.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        }
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-3">
      {/* Web Share API (mobile) */}
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
        <button
          onClick={handleWebShare}
          className="w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <span className="text-xl">📤</span>
          <span>シェアする（スマホ推奨）</span>
        </button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Twitter/X */}
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 bg-black text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all text-center"
        >
          <span className="font-bold text-lg">𝕏</span>
          <span>X（Twitter）</span>
        </a>

        {/* LINE */}
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all text-center"
        >
          <span className="text-xl">💬</span>
          <span>LINEでシェア</span>
        </a>

        {/* Copy text */}
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 py-3 bg-gray-700 text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <span className="text-xl">📋</span>
          <span>テキストをコピー</span>
        </button>
      </div>

      {/* Share text preview */}
      <div className="bg-white bg-opacity-60 rounded-2xl p-3 border border-purple-100">
        <p className="text-xs text-gray-400 mb-1 font-bold">シェアテキスト：</p>
        <p className="text-sm text-gray-600 whitespace-pre-line">{shareText}</p>
      </div>
    </div>
  );
}

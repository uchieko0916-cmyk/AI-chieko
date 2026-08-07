import { useCallback, useRef, useState } from 'react';
import { parseInstruction, type ParseResult } from './lib/commandParser';
import { editVideo } from './lib/ffmpegEditor';
import { loadVideoMeta, type VideoMeta } from './lib/videoMeta';

type Status = 'idle' | 'loading-ffmpeg' | 'processing' | 'done' | 'error';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [instruction, setInstruction] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [preview, setPreview] = useState<ParseResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    setError('');
    setResultUrl('');
    setFile(f);
    try {
      const m = await loadVideoMeta(f);
      setMeta(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const onInstructionChange = (value: string) => {
    setInstruction(value);
    setPreview(value.trim() ? parseInstruction(value) : null);
  };

  const runEdit = async () => {
    if (!file || !meta) return;
    const parsed = parseInstruction(instruction);
    setPreview(parsed);

    const { ops, matchedSegments } = parsed;
    const hasAnyOp =
      ops.trimStartSec !== undefined ||
      ops.trimEndSec !== undefined ||
      (ops.rangeStartSec !== undefined && ops.rangeEndSec !== undefined) ||
      ops.texts.length > 0 ||
      ops.grayscale ||
      ops.mute ||
      (ops.speed !== undefined && ops.speed !== 1);

    if (!hasAnyOp) {
      setError('指示を認識できませんでした。下のヒントを参考に書き直してみてください。');
      return;
    }

    setError('');
    setResultUrl('');
    setLogLines([]);
    setProgress(0);
    setStatus('loading-ffmpeg');

    try {
      const blob = await editVideo({
        file,
        ops,
        durationSec: meta.duration,
        width: meta.width,
        height: meta.height,
        onProgress: (ratio) => {
          setStatus('processing');
          setProgress(ratio);
        },
        onLog: (line) => setLogLines((prev) => [...prev.slice(-40), line]),
      });
      setResultUrl(URL.createObjectURL(blob));
      setStatus('done');
      void matchedSegments;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus('error');
    }
  };

  const isBusy = status === 'loading-ffmpeg' || status === 'processing';

  return (
    <div className="app">
      <header className="app__header">
        <h1>✂️ AI動画エディタ</h1>
        <p>動画をアップロードして、日本語で指示するだけで編集できます(すべてブラウザ内で処理・アップロード不要)</p>
      </header>

      <div className="card">
        <div className="section-title">1. 動画をアップロード</div>
        <div
          className={`dropzone${dragOver ? ' dragover' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void handleFile(f);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          {file ? (
            <span>{file.name}（クリックで変更）</span>
          ) : (
            <span>クリックまたはドラッグ&ドロップで動画を選択</span>
          )}
        </div>
        {meta && (
          <video
            src={meta.url}
            controls
            style={{ marginTop: 14 }}
          />
        )}
      </div>

      {meta && (
        <div className="card">
          <div className="section-title">2. どう編集するか、日本語で指示</div>
          <textarea
            value={instruction}
            onChange={(e) => onInstructionChange(e.target.value)}
            placeholder={'例）最初の3秒をカットして、白黒にして、テロップ「頑張れ！」を追加して'}
          />
          <div className="hints">
            使える指示の例（読点「、」や改行で区切って複数指定できます）：<br />
            <code>最初の5秒をカット</code> / <code>最後の3秒をカット</code> /{' '}
            <code>5秒から10秒を切り抜く</code> / <code>テロップ：こんにちは</code> /{' '}
            <code>白黒にする</code> / <code>ミュート</code> / <code>1.5倍速</code>
          </div>

          {preview && (
            <div className="op-list">
              {preview.matchedSegments.map((s, i) => (
                <span className="op-chip" key={`m-${i}`}>✓ {s}</span>
              ))}
              {preview.unrecognizedSegments.map((s, i) => (
                <span className="op-chip" style={{ background: '#fff0e6', color: '#b3541e' }} key={`u-${i}`}>
                  ? 未認識: {s}
                </span>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <button className="btn-primary" onClick={runEdit} disabled={isBusy || !instruction.trim()}>
              {isBusy ? '編集中…' : '編集を実行'}
            </button>
          </div>

          {isBusy && (
            <div className="progress">
              <div className="progress__bar">
                <div className="progress__fill" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <div className="progress__log">
                {status === 'loading-ffmpeg' && logLines.length === 0 ? 'エンジンを読み込み中…' : logLines.join('\n')}
              </div>
            </div>
          )}

          {error && <div className="error-box">{error}</div>}
        </div>
      )}

      {resultUrl && (
        <div className="card">
          <div className="section-title">3. 完成した動画</div>
          <video src={resultUrl} controls />
          <div className="result-actions">
            <a href={resultUrl} download="edited.mp4">
              <button className="btn-secondary">ダウンロード</button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

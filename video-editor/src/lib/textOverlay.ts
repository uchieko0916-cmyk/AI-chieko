/**
 * Renders text overlays to a transparent PNG using the browser's own font
 * rendering (so Japanese text "just works" without bundling a font file
 * into ffmpeg.wasm). The PNG is later composited onto the video with
 * ffmpeg's overlay filter.
 */
export async function renderTextOverlayPng(
  width: number,
  height: number,
  texts: string[]
): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is not available');

  ctx.clearRect(0, 0, width, height);

  const fontSize = Math.max(20, Math.round(height * 0.06));
  ctx.font = `bold ${fontSize}px "Hiragino Sans", "Yu Gothic", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const paddingBottom = height * 0.08;

  // Stack lines bottom-up, each spaced by 1.4x the font size.
  const lines = texts.slice(0, 4); // keep it simple: cap at 4 lines
  lines.forEach((text, i) => {
    const yFromBottom = paddingBottom + (lines.length - 1 - i) * fontSize * 1.4;
    const y = height - yFromBottom;
    const x = width / 2;
    const metrics = ctx.measureText(text);
    const boxPaddingX = 16;
    const boxHeight = fontSize * 1.3;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(
      x - metrics.width / 2 - boxPaddingX,
      y - boxHeight / 2,
      metrics.width + boxPaddingX * 2,
      boxHeight
    );

    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y + fontSize * 0.05);
  });

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encoding failed'))), 'image/png');
  });
  const buf = await blob.arrayBuffer();
  return new Uint8Array(buf);
}

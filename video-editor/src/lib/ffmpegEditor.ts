import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import type { EditOperations } from './commandParser';
import { renderTextOverlayPng } from './textOverlay';

let ffmpegInstance: FFmpeg | null = null;

export async function loadFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  const ffmpeg = new FFmpeg();
  if (onLog) ffmpeg.on('log', ({ message }) => onLog(message));
  await ffmpeg.load({
    coreURL: `${window.location.origin}/ffmpeg/ffmpeg-core.js`,
    wasmURL: `${window.location.origin}/ffmpeg/ffmpeg-core.wasm`,
  });
  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

export interface EditVideoParams {
  file: File;
  ops: EditOperations;
  durationSec: number;
  width: number;
  height: number;
  onProgress?: (ratio: number) => void;
  onLog?: (msg: string) => void;
}

const clampSpeed = (speed: number) => Math.min(2, Math.max(0.5, speed));

export async function editVideo({
  file,
  ops,
  durationSec,
  width,
  height,
  onProgress,
  onLog,
}: EditVideoParams): Promise<Blob> {
  const ffmpeg = await loadFFmpeg(onLog);
  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress?.(Math.min(1, Math.max(0, progress)));
  };
  ffmpeg.on('progress', progressHandler);

  try {
    const inputExt = file.name.split('.').pop() || 'mp4';
    const inputName = `input.${inputExt}`;
    const outputName = 'output.mp4';

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Resolve the trim window: an explicit range wins over start/end trims.
    let start = 0;
    let end = durationSec;
    if (ops.rangeStartSec !== undefined && ops.rangeEndSec !== undefined) {
      start = Math.max(0, ops.rangeStartSec);
      end = Math.min(durationSec, ops.rangeEndSec);
    } else {
      if (ops.trimStartSec) start = Math.min(durationSec, ops.trimStartSec);
      if (ops.trimEndSec) end = Math.max(start, durationSec - ops.trimEndSec);
    }
    if (end <= start) end = durationSec;
    const hasTrim = start > 0 || end < durationSec;

    const args: string[] = [];
    // -ss/-t placed *before* -i are input options: ffmpeg seeks to the
    // nearest keyframe and decodes forward from there for just the
    // requested duration, instead of decoding the whole file from the
    // start — critical for cutting a short clip out of a long recording
    // (e.g. pulling 5 minutes out of an hour-long meeting).
    if (hasTrim && start > 0) {
      args.push('-ss', start.toFixed(2));
    }
    if (hasTrim) {
      args.push('-t', (end - start).toFixed(2));
    }
    args.push('-i', inputName);

    let overlayUsed = false;
    if (ops.texts.length > 0) {
      const overlayPng = await renderTextOverlayPng(width, height, ops.texts);
      await ffmpeg.writeFile('overlay.png', overlayPng);
      // -loop 1: the overlay is a single still frame; without looping it,
      // ffmpeg's overlay filter only has it for the first output frame.
      args.push('-loop', '1', '-i', 'overlay.png');
      overlayUsed = true;
    }

    const videoFilters: string[] = [];
    if (ops.speed && ops.speed !== 1) {
      videoFilters.push(`setpts=${(1 / clampSpeed(ops.speed)).toFixed(4)}*PTS`);
    }
    if (ops.grayscale) {
      videoFilters.push('hue=s=0');
    }

    if (overlayUsed) {
      const chain =
        videoFilters.length > 0
          ? `[0:v]${videoFilters.join(',')}[vf];[vf][1:v]overlay=0:0[vout]`
          : `[0:v][1:v]overlay=0:0[vout]`;
      args.push('-filter_complex', chain, '-map', '[vout]', '-shortest');
    } else if (videoFilters.length > 0) {
      args.push('-vf', videoFilters.join(','));
    }

    if (ops.mute) {
      args.push('-an');
    } else {
      if (overlayUsed) args.push('-map', '0:a?');
      if (ops.speed && ops.speed !== 1) {
        args.push('-af', `atempo=${clampSpeed(ops.speed)}`);
      }
    }

    args.push('-preset', 'ultrafast', outputName);

    onLog?.(`$ ffmpeg ${args.join(' ')}`);
    await ffmpeg.exec(args);

    const data = await ffmpeg.readFile(outputName);
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);
    if (overlayUsed) await ffmpeg.deleteFile('overlay.png');

    return new Blob([data as BlobPart], { type: 'video/mp4' });
  } finally {
    ffmpeg.off('progress', progressHandler);
  }
}

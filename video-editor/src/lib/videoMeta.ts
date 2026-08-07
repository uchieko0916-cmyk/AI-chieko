export interface VideoMeta {
  duration: number;
  width: number;
  height: number;
  url: string;
}

export function loadVideoMeta(file: File): Promise<VideoMeta> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight, url });
    };
    video.onerror = () => reject(new Error('動画の読み込みに失敗しました'));
    video.src = url;
  });
}

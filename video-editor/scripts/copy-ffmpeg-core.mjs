import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcDir = join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm');
const destDir = join(root, 'public', 'ffmpeg');

if (!existsSync(srcDir)) {
  console.warn('[copy-ffmpeg-core] @ffmpeg/core not found, skipping copy:', srcDir);
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });

for (const file of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
  const src = join(srcDir, file);
  if (existsSync(src)) {
    copyFileSync(src, join(destDir, file));
    console.log('[copy-ffmpeg-core] copied', file);
  } else {
    console.warn('[copy-ffmpeg-core] missing', src);
  }
}

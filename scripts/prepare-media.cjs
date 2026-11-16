// Converts the Wikimedia Commons downloads in source/commons (listed in src/data/media.json)
// into small web files in public/media:
//   photos -> WebP, 1200px wide (and 600px "-sm" versions for cards)
//   chess-piece SVGs -> copied as-is into public/media/chess
// Run with: npm run media
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'source', 'commons');
const OUT = path.join(ROOT, 'public', 'media');
const media = require(path.join(ROOT, 'src', 'data', 'media.json'));

fs.mkdirSync(path.join(OUT, 'chess'), { recursive: true });

// قصّ الحواف (نسبة من العرض/الارتفاع: يسار، أعلى، يمين، أسفل) — مثل إطار صورة زجاجية قديمة
const CROP = { 'tea-stand-1932': [0.045, 0.075, 0.05, 0.075] };

(async () => {
  for (const m of media) {
    if (m.kind === 'svg') {
      fs.copyFileSync(path.join(SRC, m.id + '.svg'), path.join(OUT, 'chess', m.id + '.svg'));
      continue;
    }
    const src = path.join(SRC, m.id + '.jpg');
    let base = sharp(src).rotate();
    if (CROP[m.id]) {
      const { width: w, height: h } = await sharp(src).metadata();
      const [l, t, r, b] = CROP[m.id];
      base = sharp(await base.extract({ left: Math.round(w * l), top: Math.round(h * t), width: Math.round(w * (1 - l - r)), height: Math.round(h * (1 - t - b)) }).toBuffer());
    }
    for (const [suffix, width, quality] of [['', 1200, 72], ['-sm', 600, 68]]) {
      const out = path.join(OUT, m.id + suffix + '.webp');
      await base.clone().resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(out);
    }
    console.log('✓', m.id);
  }
})();

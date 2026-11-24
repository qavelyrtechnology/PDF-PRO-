import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixRgb(bg, fg, alpha) {
  return [
    Math.round(lerp(bg[0], fg[0], alpha)),
    Math.round(lerp(bg[1], fg[1], alpha)),
    Math.round(lerp(bg[2], fg[2], alpha)),
  ];
}

// Signed distance to a rounded box centered at (cx, cy) with half-sizes (hw, hh)
function sdRoundedBox(px, py, cx, cy, hw, hh, r) {
  const dx = Math.abs(px - cx) - (hw - r);
  const dy = Math.abs(py - cy) - (hh - r);
  const ox = Math.max(dx, 0);
  const oy = Math.max(dy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(dx, dy), 0) - r;
}

// Anti-aliased rasterizer matching public/icon.svg
function createBrandPng(width, height, maskable = false) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLength);
  const scale = maskable ? 0.78 : 1.0;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Normalize to 512x512 SVG coordinate space
      const u = ((x + 0.5) / width - 0.5) / scale * 512 + 256;
      const v = ((y + 0.5) / height - 0.5) / scale * 512 + 256;

      // Background slate gradient (#0F172A -> #1E293B)
      const gradT = clamp((u + v) / 1024, 0, 1);
      let rgb = [
        Math.round(lerp(15, 30, gradT)),
        Math.round(lerp(23, 41, gradT)),
        Math.round(lerp(42, 59, gradT)),
      ];
      let outAlpha = 255;

      // Outer rounded icon frame if non-maskable
      if (!maskable) {
        const frameDist = sdRoundedBox(u, v, 256, 256, 256, 256, 128);
        if (frameDist > 1.5) {
          outAlpha = 0;
        } else if (frameDist > -1.5) {
          outAlpha = Math.round(clamp(1.5 - frameDist, 0, 1) * 255);
        }
      }

      if (outAlpha > 0) {
        // 1. Offset Crimson Backing Sheet (164, 120, w=220, h=288, r=34)
        const crimsonDist = sdRoundedBox(u, v, 164 + 110, 120 + 144, 110, 144, 34);
        if (crimsonDist < 1.5) {
          const a = clamp(1.0 - crimsonDist / 1.5, 0, 1);
          const cGrad = clamp((u - 164 + v - 120) / 508, 0, 1);
          const crimsonColor = [
            Math.round(lerp(244, 190, cGrad)),
            Math.round(lerp(63, 18, cGrad)),
            Math.round(lerp(94, 60, cGrad)),
          ];
          rgb = mixRgb(rgb, crimsonColor, a);
        }

        // 2. White Primary Sheet with Folded Top-Right Corner
        const sheetDist = sdRoundedBox(u, v, 128 + 112, 88 + 152, 112, 152, 24);
        // Diagonal cut for top-right corner fold: line from (272, 88) to (352, 168) -> u - v > 184
        const cutDist = (u - v - 184) / Math.SQRT2;
        const docDist = Math.max(sheetDist, cutDist);

        if (docDist < 1.5) {
          const a = clamp(1.0 - docDist / 1.5, 0, 1);
          rgb = mixRgb(rgb, [255, 255, 255], a);

          // Corner fold triangle inside (u >= 272 && v <= 168)
          const foldDist = Math.max(272 - u, v - 168, cutDist);
          if (foldDist < 1.5) {
            const fa = clamp(1.0 - foldDist / 1.5, 0, 1) * a;
            rgb = mixRgb(rgb, [254, 205, 211], fa);
          }

          // Typographic bar 1: Ink Slate (#0F172A) (168, 210, w=128, h=24, r=12)
          const bar1 = sdRoundedBox(u, v, 168 + 64, 210 + 12, 64, 12, 12);
          if (bar1 < 1.2) {
            rgb = mixRgb(rgb, [15, 23, 42], clamp(1.0 - bar1 / 1.2, 0, 1) * a);
          }

          // Typographic bar 2: Cool Muted Slate (#94A3B8) (168, 256, w=96, h=20, r=10)
          const bar2 = sdRoundedBox(u, v, 168 + 48, 256 + 10, 48, 10, 10);
          if (bar2 < 1.2) {
            rgb = mixRgb(rgb, [148, 163, 184], clamp(1.0 - bar2 / 1.2, 0, 1) * a);
          }

          // Typographic bar 3: Studio Crimson (#E11D48) (168, 302, w=144, h=32, r=16)
          const bar3 = sdRoundedBox(u, v, 168 + 72, 302 + 16, 72, 16, 16);
          if (bar3 < 1.2) {
            rgb = mixRgb(rgb, [225, 29, 72], clamp(1.0 - bar3 / 1.2, 0, 1) * a);
          }
        }
      }

      rawData[pixelOffset] = rgb[0];
      rawData[pixelOffset + 1] = rgb[1];
      rawData[pixelOffset + 2] = rgb[2];
      rawData[pixelOffset + 3] = outAlpha;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  let crc = 0xffffffff;
  for (let i = 4; i < 8 + len; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  crc = crc ^ 0xffffffff;
  buf.writeInt32BE(crc, 8 + len);

  return buf;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createBrandPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createBrandPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createBrandPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createBrandPng(180, 180, true));
console.log('Brand PNG icons generated successfully.');

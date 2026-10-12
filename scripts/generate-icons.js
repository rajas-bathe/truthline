const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, drawFn) {
  // RGBA buffer: 4 bytes per pixel + 1 filter byte per scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const buf = Buffer.alloc(8 + length + 4);
  buf.writeUInt32BE(length, 0);
  buf.write(type, 4);
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + length));
  buf.writeUInt32BE(crc, 8 + length);
  return buf;
}

// CRC32 implementation for PNG
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Draw TruthLine AI Shield / Checkmark Icon (Deep slate & cyan glowing shield)
function drawTruthLineIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const r = w / 2 - 1;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Anti-aliased outer circle/shield border
  if (dist > r) {
    return [0, 0, 0, 0]; // transparent
  }

  // Dark cyber background (#0a101d)
  const bgR = 10, bgG = 16, bgB = 29;

  // Outer glowing ring (#00d2ff to #00f5a0 gradient)
  if (dist >= r - Math.max(1.5, w * 0.08)) {
    const t = (x + y) / (w * 2);
    const ringR = Math.round(0 * (1 - t) + 0 * t);
    const ringG = Math.round(210 * (1 - t) + 245 * t);
    const ringB = Math.round(255 * (1 - t) + 160 * t);
    return [ringR, ringG, ringB, 255];
  }

  // Inner stylized 'T' + checkmark emblem in cyan/emerald
  const normX = (x - cx) / (w * 0.5);
  const normY = (y - cy) / (h * 0.5);

  // Horizontal bar of 'T'
  const isTBar = normY >= -0.55 && normY <= -0.25 && normX >= -0.65 && normX <= 0.65;
  // Vertical stem of 'T'
  const isTStem = normY >= -0.25 && normY <= 0.55 && normX >= -0.18 && normX <= 0.18;
  // Checkmark accent on right
  const isCheck = (normX >= 0.15 && normX <= 0.6 && Math.abs(normY - (normX * 0.8 - 0.1)) < 0.18);

  if (isTBar || isTStem || isCheck) {
    // Vibrant electric cyan/emerald
    const t = (normX + 1) / 2;
    const emblemR = Math.round(0 * (1 - t) + 0 * t);
    const emblemG = Math.round(210 * (1 - t) + 245 * t);
    const emblemB = Math.round(255 * (1 - t) + 160 * t);
    return [emblemR, emblemG, emblemB, 255];
  }

  return [bgR, bgG, bgB, 255];
}

const iconsDir = path.join(__dirname, '..', 'extension', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach(size => {
  const pngBuf = createPng(size, size, drawTruthLineIcon);
  const outPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(outPath, pngBuf);
  console.log(`Generated icon: ${outPath} (${size}x${size}, ${pngBuf.length} bytes)`);
});

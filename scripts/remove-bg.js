const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = path.resolve(__dirname, '../Frontend/public/lego-profile.png');
const outputPath = inputPath;

function isBackgroundColor(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const spread = max - min;
  const avg = (r + g + b) / 3;

  // Checkerboard uses near-white and light gray squares.
  if (spread > 30) return false;
  if (avg < 135) return false;
  if (avg > 250) return true;
  if (avg >= 175 && avg <= 245) return true;
  return false;
}

function removeBackground(png) {
  const { width, height, data } = png;
  const visited = new Uint8Array(width * height);
  const queue = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * 4;
    if (!isBackgroundColor(data[i], data[i + 1], data[i + 2])) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx - x) / width;
    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }

  for (let idx = 0; idx < width * height; idx += 1) {
    if (!visited[idx]) continue;
    const i = idx * 4;
    data[i + 3] = 0;
  }
}

const buffer = fs.readFileSync(inputPath);
const png = PNG.sync.read(buffer);
removeBackground(png);
fs.writeFileSync(outputPath, PNG.sync.write(png));
console.log('Background removed:', outputPath);

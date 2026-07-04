const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = process.argv[2];
const outputPath = process.argv[3] || inputPath;

function isKeyColor(r, g, b) {
  // Magenta chroma key and close variants.
  return r > 180 && b > 180 && g < 120 && Math.abs(r - b) < 60;
}

function isNearKeyColor(r, g, b) {
  return r > 150 && b > 150 && g < 140;
}

function removeChromaKey(png) {
  const { width, height, data } = png;
  const visited = new Uint8Array(width * height);
  const queue = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * 4;
    if (!isKeyColor(data[i], data[i + 1], data[i + 2])) return;
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
    const i = idx * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (visited[idx] || isNearKeyColor(r, g, b)) {
      data[i + 3] = 0;
    }
  }
}

const buffer = fs.readFileSync(inputPath);
const png = PNG.sync.read(buffer);
removeChromaKey(png);
fs.writeFileSync(outputPath, PNG.sync.write(png));
console.log('Chroma key removed:', outputPath);

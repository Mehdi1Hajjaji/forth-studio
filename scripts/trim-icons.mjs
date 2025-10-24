import { readdir, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const ICON_DIR = join(process.cwd(), 'public', 'assets', 'icons');

const DEFAULT_TOLERANCE = 12;
const SPECIAL_TOLERANCE = {
  'heart.png': 24,
  'c-plus.png': 18,
  'js.png': 18,
};

const ALPHA_THRESHOLDS = {
  'heart.png': 32,
  'js.png': 28,
  'c-plus.png': 24,
};

function isWithinTolerance(color, ref, tol) {
  return (
    Math.abs(color[0] - ref[0]) <= tol &&
    Math.abs(color[1] - ref[1]) <= tol &&
    Math.abs(color[2] - ref[2]) <= tol
  );
}

async function collectBackgroundColors(data, width, height, tol) {
  const colors = [];
  const addColor = (idx) => {
    const candidate = [data[idx], data[idx + 1], data[idx + 2]];
    if (!colors.some((ref) => isWithinTolerance(candidate, ref, tol))) {
      colors.push(candidate);
    }
  };

  for (let x = 0; x < width; x++) {
    addColor((0 * width + x) * 4);
    addColor(((height - 1) * width + x) * 4);
  }

  for (let y = 0; y < height; y++) {
    addColor((y * width + 0) * 4);
    addColor((y * width + (width - 1)) * 4);
  }

  return colors;
}

async function trimIcon(file) {
  const inputPath = join(ICON_DIR, file);
  const TOLERANCE = SPECIAL_TOLERANCE[file] ?? DEFAULT_TOLERANCE;
  const ALPHA_MIN = ALPHA_THRESHOLDS[file] ?? 10;
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const backgroundColors = await collectBackgroundColors(data, info.width, info.height, TOLERANCE);

  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      const color = [data[idx], data[idx + 1], data[idx + 2]];
      const matchesBackground = backgroundColors.some((ref) => isWithinTolerance(color, ref, TOLERANCE));
      if (matchesBackground) {
        data[idx + 3] = 0;
        continue;
      }
      if (data[idx + 3] > ALPHA_MIN) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === -1 || maxY === -1) {
    console.warn(`No opaque pixels detected in ${file}; skipping crop.`);
    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    })
      .png()
      .toFile(inputPath);
    return;
  }

  // Safety inset trims 1px border which can remain after thresholding
  const inset = 1;
  const left = Math.max(minX + inset, 0);
  const top = Math.max(minY + inset, 0);
  const width = Math.max(maxX - minX + 1 - inset * 2, 1);
  const height = Math.max(maxY - minY + 1 - inset * 2, 1);

  const extractedBuffer = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .extract({ left, top, width, height })
    .png();

  const tempPath = `${inputPath}.tmp`;
  await extractedBuffer.toFile(tempPath);
  await rm(inputPath);
  await rename(tempPath, inputPath);
  console.log(`Trimmed ${file}`);
}

async function main() {
  const files = (await readdir(ICON_DIR)).filter((file) => file.endsWith('.png'));
  for (const file of files) {
    await trimIcon(file);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

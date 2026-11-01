import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`[skip] Already exists: ${path.basename(dest)}`);
      return resolve();
    }
    console.log(`[downloading] ${url} -> ${dest}`);
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return reject(new Error(`Failed with HTTP status ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`[done] Downloaded ${path.basename(dest)}`);
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('==> Step 1: Copying PDF.js assets...');
  const pdfjsCmapsSrc = path.join(rootDir, 'node_modules', 'pdfjs-dist', 'cmaps');
  const pdfjsFontsSrc = path.join(rootDir, 'node_modules', 'pdfjs-dist', 'standard_fonts');
  copyDirRecursive(pdfjsCmapsSrc, path.join(rootDir, 'public', 'pdfjs', 'cmaps'));
  copyDirRecursive(pdfjsFontsSrc, path.join(rootDir, 'public', 'pdfjs', 'standard_fonts'));
  console.log('PDF.js assets copied successfully.');

  console.log('==> Step 2: Copying Tesseract.js worker and core assets...');
  const tesseractWorkerSrc = path.join(rootDir, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js');
  const tesseractCoreSrc = path.join(rootDir, 'node_modules', 'tesseract.js-core');
  const publicTesseractDir = path.join(rootDir, 'public', 'tesseract');
  const publicTesseractCoreDir = path.join(publicTesseractDir, 'core');
  fs.mkdirSync(publicTesseractDir, { recursive: true });
  fs.mkdirSync(publicTesseractCoreDir, { recursive: true });

  if (fs.existsSync(tesseractWorkerSrc)) {
    fs.copyFileSync(tesseractWorkerSrc, path.join(publicTesseractDir, 'worker.min.js'));
  }
  copyDirRecursive(tesseractCoreSrc, publicTesseractCoreDir);
  console.log('Tesseract.js worker & core copied successfully.');

  console.log('==> Step 3: Ensuring Tesseract traineddata...');
  const langDir = path.join(publicTesseractDir, 'lang');
  fs.mkdirSync(langDir, { recursive: true });

  const trainedDataFiles = [
    { name: 'eng.traineddata.gz', url: 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/eng.traineddata.gz' },
    { name: 'ara.traineddata.gz', url: 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/ara.traineddata.gz' }
  ];

  for (const item of trainedDataFiles) {
    const dest = path.join(langDir, item.name);
    try {
      await downloadFile(item.url, dest);
    } catch (err) {
      console.warn(`[WARN] Could not fetch ${item.name} automatically:`, err.message);
      console.warn(`Please download ${item.url} and place it in ${dest}`);
    }
  }

  console.log('==> All local offline assets prepared successfully!');
}

main().catch((err) => {
  console.error('Asset preparation error:', err);
  process.exit(1);
});

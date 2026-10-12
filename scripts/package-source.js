/**
 * TRUTHLINE AI — Source Code Archiving & Inventory Script
 * "DON'T JUST FORWARD. VERIFY."
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('   TRUTHLINE AI — Source Code Packaging             ');
console.log('====================================================\n');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Ignore patterns
const ignoreList = [
  'node_modules',
  '.git',
  'dist',
  '.env',
  '.gemini',
  '*.log',
  '*.tmp'
];

function isIgnored(relPath) {
  const parts = relPath.split(path.sep);
  return parts.some(p => ignoreList.includes(p));
}

function scanFiles(dir, baseDir = dir) {
  let fileList = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);

    if (isIgnored(relPath)) continue;

    if (entry.isDirectory()) {
      fileList = fileList.concat(scanFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      const stat = fs.statSync(fullPath);
      fileList.push({
        path: relPath.replace(/\\/g, '/'),
        size: stat.size
      });
    }
  }
  return fileList;
}

const files = scanFiles(rootDir);
const inventoryPath = path.join(distDir, 'source-inventory.json');
fs.writeFileSync(inventoryPath, JSON.stringify({
  project: 'TRUTHLINE AI',
  tagline: "Don't Just Forward. Verify.",
  generatedAt: new Date().toISOString(),
  fileCount: files.length,
  totalBytes: files.reduce((acc, f) => acc + f.size, 0),
  files
}, null, 2));

console.log(`Audited ${files.length} project source files (${(files.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB).`);
console.log(`Source inventory created: ${inventoryPath}`);

// If on Windows, package clean source zip
const sourceZipPath = path.join(distDir, 'truthline-source.zip');
try {
  if (process.platform === 'win32') {
    const tempStage = path.join(distDir, 'temp-source-stage');
    if (fs.existsSync(tempStage)) fs.rmSync(tempStage, { recursive: true, force: true });
    fs.mkdirSync(tempStage, { recursive: true });

    for (const file of files) {
      const dest = path.join(tempStage, file.path);
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(path.join(rootDir, file.path), dest);
    }

    execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${tempStage}\\*' -DestinationPath '${sourceZipPath}' -Force"`, { stdio: 'ignore' });
    fs.rmSync(tempStage, { recursive: true, force: true });
    console.log(`Created clean source archive: ${sourceZipPath}`);
  }
} catch (err) {
  console.log('Skipped source zip compression.');
}

console.log('\nSource packaging completed successfully!\n');

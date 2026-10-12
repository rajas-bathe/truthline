/**
 * TRUTHLINE AI — Extension Packaging Script
 * "DON'T JUST FORWARD. VERIFY."
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('   TRUTHLINE AI — Packaging Chrome Extension        ');
console.log('====================================================\n');

const extensionDir = path.join(__dirname, '..', 'extension');
const distDir = path.join(__dirname, '..', 'dist');
const targetExtDir = path.join(distDir, 'extension');

// Required files to validate
const requiredFiles = [
  'manifest.json',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png',
  'background/service-worker.js',
  'content/whatsapp.js',
  'content/whatsapp.css',
  'panel/panel.html',
  'panel/panel.css',
  'panel/panel.js',
  'popup/popup.html',
  'popup/popup.css',
  'popup/popup.js'
];

// 1. Verify Manifest and Core Files
console.log('[1/3] Validating extension files...');
let missingFiles = 0;
for (const relFile of requiredFiles) {
  const fullPath = path.join(extensionDir, relFile);
  if (!fs.existsSync(fullPath)) {
    console.error(`  [MISSING] ${relFile}`);
    missingFiles++;
  } else {
    const stat = fs.statSync(fullPath);
    console.log(`  [OK] ${relFile} (${stat.size} bytes)`);
  }
}

if (missingFiles > 0) {
  console.error(`\nValidation failed: ${missingFiles} required file(s) are missing.`);
  process.exit(1);
}

// 2. Validate Manifest JSON
try {
  const manifestRaw = fs.readFileSync(path.join(extensionDir, 'manifest.json'), 'utf8');
  const manifest = JSON.parse(manifestRaw);
  console.log(`\n[2/3] Manifest validated: ${manifest.name} (v${manifest.version}, MV${manifest.manifest_version})`);
} catch (err) {
  console.error(`Manifest parse error: ${err.message}`);
  process.exit(1);
}

// 3. Create Distribution Bundle
console.log('\n[3/3] Assembling distribution directory...');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy extension directory recursively into dist/extension
function copyRecursive(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  if (fs.existsSync(targetExtDir)) {
    fs.rmSync(targetExtDir, { recursive: true, force: true });
  }
  copyRecursive(extensionDir, targetExtDir);
  console.log(`  Created bundle at: ${targetExtDir}`);

  // Create ZIP archive if PowerShell or zip utility is available
  const zipPath = path.join(distDir, 'truthline-extension.zip');
  try {
    if (process.platform === 'win32') {
      execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${targetExtDir}\\*' -DestinationPath '${zipPath}' -Force"`, { stdio: 'ignore' });
      console.log(`  Created ZIP archive: ${zipPath}`);
    }
  } catch (zipErr) {
    console.log('  (Skipped zip archive creation, unpacked folder ready in dist/extension)');
  }

  console.log('\nExtension packaging completed successfully!');
  console.log('To test in Chrome: Load unpacked from:', targetExtDir);
} catch (err) {
  console.error(`Packaging failed: ${err.message}`);
  process.exit(1);
}

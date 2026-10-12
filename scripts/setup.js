/**
 * TRUTHLINE AI — Environment & Workspace Setup Script
 * "DON'T JUST FORWARD. VERIFY."
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('   TRUTHLINE AI — Workspace Initial Setup           ');
console.log('   "Don\'t Just Forward. Verify."                    ');
console.log('====================================================\n');

// 1. Verify Node.js Version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.replace(/^v/, '').split('.')[0], 10);
console.log(`[1/5] Checking Node.js runtime: ${nodeVersion}`);

if (majorVersion < 20) {
  console.warn(`[WARNING] Node.js 22+ is strongly recommended for native 'node:sqlite'. Detected: ${nodeVersion}`);
} else {
  console.log('      Node.js version compatible.');
}

// 2. Initialize .env in root and server
const rootEnvPath = path.join(__dirname, '..', '.env');
const rootEnvExample = path.join(__dirname, '..', '.env.example');
const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');

console.log('\n[2/5] Checking environment configuration (.env)...');
if (!fs.existsSync(rootEnvPath) && fs.existsSync(rootEnvExample)) {
  fs.copyFileSync(rootEnvExample, rootEnvPath);
  console.log('      Created root .env from .env.example');
} else if (fs.existsSync(rootEnvPath)) {
  console.log('      Root .env already exists.');
}

if (!fs.existsSync(backendEnvPath) && fs.existsSync(rootEnvExample)) {
  fs.copyFileSync(rootEnvExample, backendEnvPath);
  console.log('      Created backend/.env from .env.example');
} else if (fs.existsSync(backendEnvPath)) {
  console.log('      backend/.env already exists.');
}

// 3. Ensure SQLite data directory exists
const backendDataDir = path.join(__dirname, '..', 'backend', 'data');
console.log('\n[3/5] Checking SQLite data storage directory...');
if (!fs.existsSync(backendDataDir)) {
  fs.mkdirSync(backendDataDir, { recursive: true });
  console.log(`      Created data directory: ${backendDataDir}`);
} else {
  console.log('      Data directory ready.');
}

// 4. Ensure Extension Icons
const iconsDir = path.join(__dirname, '..', 'extension', 'icons');
const icon16 = path.join(iconsDir, 'icon16.png');
const icon48 = path.join(iconsDir, 'icon48.png');
const icon128 = path.join(iconsDir, 'icon128.png');

console.log('\n[4/5] Checking extension icon assets...');
if (!fs.existsSync(icon16) || !fs.existsSync(icon48) || !fs.existsSync(icon128)) {
  console.log('      Generating extension icons...');
  try {
    require('./generate-icons.js');
    console.log('      Generated extension icons successfully.');
  } catch (err) {
    console.error(`      Failed to generate icons: ${err.message}`);
  }
} else {
  console.log('      Extension icons verified.');
}

// 5. Final status instructions
console.log('\n[5/5] Setup completed successfully!');
console.log('----------------------------------------------------');
console.log('Next steps:');
console.log('1. (Optional) Add your GEMINI_API_KEY into backend/.env to enable live search grounding.');
console.log('   If left unconfigured, SachCheck will run in Offline Demo Mode.');
console.log('2. Build the project:');
console.log('   npm run build');
console.log('3. Start the server:');
console.log('   npm run dev');
console.log('4. In Google Chrome, go to chrome://extensions, enable "Developer mode",');
console.log('   click "Load unpacked", and select the "extension" folder.');
console.log('----------------------------------------------------\n');

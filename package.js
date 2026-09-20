/**
 * Chrome Web Store Packaging Script
 * 
 * Bundles only the necessary runtime files into a clean production ZIP
 * archive ready for submission to the Chrome Web Store Developer Dashboard.
 * 
 * Excludes all test scripts, documentation, development utilities,
 * git artifacts, and OS metadata files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Exact files required for runtime operation in Chrome
const RUNTIME_FILES = [
  'manifest.json',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png',
  'popup/popup.html',
  'popup/popup.css',
  'popup/popup.js',
  'src/background.js',
  'src/content.js',
  'src/content.css',
  'src/main-world.js',
  'src/utils/storage.js',
  'src/utils/license.js'
];

function buildRelease() {
  console.log('====================================================');
  console.log('   BUILDING CHROME WEB STORE PRODUCTION PACKAGE     ');
  console.log('====================================================\n');

  // 1. Read manifest version
  const manifestPath = path.join(ROOT_DIR, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Error: manifest.json not found in project root.');
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const version = manifest.version || '1.0.0';
  const packageName = `channel-speed-memory-v${version}.zip`;
  const packagePath = path.join(DIST_DIR, packageName);

  console.log(`📦 Extension: ${manifest.name}`);
  console.log(`📌 Version:   ${version}`);
  console.log(`🎯 Target:    ${packagePath}\n`);

  // 2. Validate all runtime files exist
  console.log('1. Verifying runtime files...');
  let totalUncompressedBytes = 0;
  for (const relPath of RUNTIME_FILES) {
    const absPath = path.join(ROOT_DIR, relPath);
    if (!fs.existsSync(absPath)) {
      console.error(`❌ Missing runtime file: ${relPath}`);
      process.exit(1);
    }
    const stat = fs.statSync(absPath);
    if (stat.size === 0) {
      console.error(`❌ Empty runtime file: ${relPath}`);
      process.exit(1);
    }
    totalUncompressedBytes += stat.size;
    console.log(`  ✔ [${stat.size.toString().padStart(6, ' ')} bytes] ${relPath}`);
  }
  console.log(`\n  Total uncompressed size: ${(totalUncompressedBytes / 1024).toFixed(1)} KB`);

  // 3. Ensure dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // Remove existing package if present
  if (fs.existsSync(packagePath)) {
    fs.unlinkSync(packagePath);
  }

  // 4. Create ZIP archive
  console.log('\n2. Creating production ZIP package...');
  const fileArgs = RUNTIME_FILES.map(f => `"${f}"`).join(' ');
  const zipCmd = `/usr/bin/zip -q -9 "${packagePath}" ${fileArgs}`;

  try {
    execSync(zipCmd, { cwd: ROOT_DIR, stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Failed to create zip package:', err);
    process.exit(1);
  }

  // 5. Verify package integrity
  if (!fs.existsSync(packagePath)) {
    console.error('❌ Output package was not created.');
    process.exit(1);
  }
  const pkgStat = fs.statSync(packagePath);
  const pkgBuffer = fs.readFileSync(packagePath);
  const sha256 = crypto.createHash('sha256').update(pkgBuffer).digest('hex');

  // Verify archive contents using unzip -l
  console.log('\n3. Verifying package contents against Chrome Web Store guidelines...');
  const zipList = execSync(`/usr/bin/unzip -l "${packagePath}"`, { encoding: 'utf8' });
  const fileLines = zipList
    .split('\n')
    .filter(line => /^\s*\d+\s+[\d-]+\s+[\d:]+\s+(.+)$/.test(line))
    .map(line => line.match(/^\s*\d+\s+[\d-]+\s+[\d:]+\s+(.+)$/)[1].trim());

  // Forbidden file patterns
  const forbiddenPatterns = [
    /\.git/,
    /test_/,
    /\.md$/,
    /\.py$/,
    /\.DS_Store/,
    /store_assets/,
    /package\.js/,
    /^dist\//
  ];

  for (const fileName of fileLines) {
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(fileName)) {
        console.error(`❌ Forbidden content found in package: ${fileName} (matches ${pattern})`);
        process.exit(1);
      }
    }
  }

  console.log('  ✔ Verified 0 prohibited files (no tests, no git metadata, no docs)');
  console.log(`  ✔ Package size: ${(pkgStat.size / 1024).toFixed(1)} KB (${pkgStat.size} bytes)`);
  console.log(`  ✔ SHA-256 checksum: ${sha256}`);

  console.log('\n====================================================');
  console.log('🎉 PACKAGE READY FOR SUBMISSION!                   ');
  console.log(`📁 File: dist/${packageName}`);
  console.log('====================================================\n');

  return {
    packagePath,
    packageName,
    sizeBytes: pkgStat.size,
    sha256
  };
}

if (require.main === module) {
  buildRelease();
}

module.exports = { buildRelease, RUNTIME_FILES };

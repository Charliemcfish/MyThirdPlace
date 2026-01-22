const fs = require('fs');
const path = require('path');

console.log('🚀 Running post-build script...');

// Copy _redirects file to dist directory after build
const sourceFile = path.join(__dirname, '..', 'public', '_redirects');
const distTarget = path.join(__dirname, '..', 'dist', '_redirects');

try {
  if (fs.existsSync(sourceFile)) {
    // Ensure dist directory exists
    const distDir = path.dirname(distTarget);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    fs.copyFileSync(sourceFile, distTarget);
    console.log('✅ _redirects file copied to dist directory');
  } else {
    console.log('⚠️ Source _redirects file not found at:', sourceFile);
  }
} catch (error) {
  console.error('❌ Failed to copy _redirects file to dist:', error);
}

// Also copy to web-build directory if it exists
const webBuildTarget = path.join(__dirname, '..', 'web-build', '_redirects');
try {
  const webBuildDir = path.dirname(webBuildTarget);
  if (fs.existsSync(webBuildDir)) {
    fs.copyFileSync(sourceFile, webBuildTarget);
    console.log('✅ _redirects file copied to web-build directory');
  }
} catch (error) {
  console.error('❌ Failed to copy _redirects to web-build:', error);
}

console.log('🎉 Post-build script completed!');
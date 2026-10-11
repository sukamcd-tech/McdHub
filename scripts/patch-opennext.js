const fs = require('fs');
const path = require('path');

function patchOpenNext() {
  try {
    const targetFile = path.join(
      process.cwd(),
      'node_modules',
      '@opennextjs',
      'cloudflare',
      'dist',
      'cli',
      'build',
      'patches',
      'plugins',
      'load-manifest.js'
    );

    if (fs.existsSync(targetFile)) {
      let content = fs.readFileSync(targetFile, 'utf8');

      if (!content.includes('prefetch-hints,preview-props}')) {
        content = content.replace(
          'prefetch-hints}.json',
          'prefetch-hints,preview-props}.json'
        );
      }

      if (!content.includes('p.endsWith("preview-props")')) {
        content = content.replace(
          'p.endsWith("prefetch-hints")) {',
          'p.endsWith("prefetch-hints") ||\n        p.endsWith("preview-props")) {'
        );
      }

      fs.writeFileSync(targetFile, content, 'utf8');
      console.log('✅ Successfully patched @opennextjs/cloudflare load-manifest.js for preview-props.json support');
    }
  } catch (err) {
    console.error('Error patching opennext:', err);
  }
}

patchOpenNext();
module.exports = patchOpenNext;

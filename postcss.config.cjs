// Auto-detect Tailwind major version and choose the correct PostCSS plugin.
// Tailwind v4+ uses a separate PostCSS plugin package `@tailwindcss/postcss`.
let tailwindMajor = 0;
try {
  // require may fail if tailwind isn't installed yet
  const twPkg = require('tailwindcss/package.json');
  tailwindMajor = parseInt(twPkg.version.split('.')[0], 10) || 0;
} catch (e) {
  tailwindMajor = 0;
}

const plugins = {};
if (tailwindMajor >= 4) {
  // Newer Tailwind releases expect @tailwindcss/postcss as the PostCSS plugin
  plugins['@tailwindcss/postcss'] = {};
} else {
  // Tailwind v3 and earlier integrate directly as a PostCSS plugin
  plugins.tailwindcss = {};
}
plugins.autoprefixer = {};

module.exports = { plugins };


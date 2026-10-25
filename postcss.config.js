// postcss-import must come first so Tailwind can process the files in /styles
module.exports = { plugins: { 'postcss-import': {}, tailwindcss: {}, autoprefixer: {} } };

// Minimal tailwind config to prevent nativewind/babel from failing.
// This project does NOT use NativeWind/TailwindCSS.
// babel-preset-expo auto-detects nativewind if present in node_modules
// (phantom dep from npm hoisting) and its babel plugin requires a config.
module.exports = {
  content: [],
  theme: { extend: {} },
  plugins: [],
};

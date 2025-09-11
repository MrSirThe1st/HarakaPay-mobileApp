const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional asset extensions
config.resolver.assetExts.push(
  // Adds support for `.db` files for SQLite databases
  'db'
);

// Add resolver configuration for better Node.js module resolution
config.resolver.nodeModulesPath = [
  // Resolve node_modules from the project root
  './node_modules',
  // Resolve global node_modules
  '../node_modules',
];

// Configure source extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Add transformer configuration for better compatibility
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
};

module.exports = config;
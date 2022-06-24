// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

module.exports = Object.assign({}, getDefaultConfig(__dirname), {
  resolver: { sourceExts: ['jsx', 'js', 'ts', 'tsx'] }
});

const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');
const pak = require('../package.json');

const root = path.resolve(__dirname, '..');
const modules = Object.keys({ ...pak.peerDependencies });

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const config = getDefaultConfig(__dirname);

config.watchFolders = [root, path.resolve(__dirname, '../node_modules')];

config.resolver.blockList = modules.map(
  (m) =>
    new RegExp(
      `^${escapeRegExp(path.join(root, 'node_modules', m))}\\/.*$`
    )
);

config.resolver.extraNodeModules = modules.reduce(
  (acc, name) => {
    acc[name] = path.join(__dirname, 'node_modules', name);
    return acc;
  },
  {
    '@trycourier/courier-react-native': root,
  }
);

module.exports = config;

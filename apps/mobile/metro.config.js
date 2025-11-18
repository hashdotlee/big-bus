const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    extraNodeModules: {
      '@big-bus/api-client': path.resolve(workspaceRoot, 'packages/api-client'),
      '@big-bus/config': path.resolve(workspaceRoot, 'packages/config'),
      '@big-bus/types': path.resolve(workspaceRoot, 'packages/types'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);

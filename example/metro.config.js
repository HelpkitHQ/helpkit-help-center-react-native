const path = require('path')
const { getDefaultConfig } = require('@expo/metro-config')

const root = path.resolve(__dirname, '..')
const packagePath = path.resolve(root)

const defaultConfig = getDefaultConfig(__dirname)

module.exports = {
  ...defaultConfig,
  projectRoot: __dirname,
  watchFolders: [packagePath],
  resolver: {
    ...defaultConfig.resolver,
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules'), path.resolve(root, 'node_modules')],
    disableHierarchicalLookup: true,
    extraNodeModules: {
      // Alias the scoped package to the root directory
      '@helpkit/helpkit-help-center-react-native': packagePath,
    },
  },
}

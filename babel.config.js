module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Plugin para resolver problemas de módulos
      'react-native-reanimated/plugin',
      // Plugin para melhorar compatibilidade
      '@babel/plugin-proposal-export-namespace-from',
    ],
  };
};

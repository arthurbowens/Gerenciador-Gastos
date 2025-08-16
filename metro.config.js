const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurações adicionais para resolver problemas de dependências
config.resolver = {
  ...config.resolver,
  alias: {
    // Resolver problemas com módulos nativos
    'react-native-google-mobile-ads': require.resolve('./src/contexts/AdsContext.js'),
  },
  // Incluir extensões adicionais
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
  // Resolver problemas de plataforma
  platforms: ['ios', 'android', 'native', 'web'],
};

// Configurações de transformação
config.transformer = {
  ...config.transformer,
  // Habilitar minificação em produção
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Configurações de servidor
config.server = {
  ...config.server,
  // Configurações de CORS para desenvolvimento
  cors: true,
};

module.exports = config;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, Alert, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdsContext = createContext();

export const useAds = () => {
  const context = useContext(AdsContext);
  if (!context) {
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
};

// IDs dos anúncios - SUBSTITUA pelos seus IDs reais do AdMob
const AD_UNIT_IDS = {
  // IDs de TESTE (desenvolvimento)
  BANNER_TEST: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL_TEST: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED_TEST: 'ca-app-pub-3940256099942544/5224354917',
  
  // IDs de PRODUÇÃO (Play Store) - SUBSTITUIR
  BANNER_PROD: 'ca-app-pub-3940256099942544/6300978111', // SUBSTITUIR
  INTERSTITIAL_PROD: 'ca-app-pub-3940256099942544/1033173712', // SUBSTITUIR
  REWARDED_PROD: 'ca-app-pub-3940256099942544/5224354917', // SUBSTITUIR
};

// IDs finais baseados no ambiente
const AD_UNIT_IDS_FINAL = {
  BANNER: __DEV__ ? AD_UNIT_IDS.BANNER_TEST : AD_UNIT_IDS.BANNER_PROD,
  INTERSTITIAL: __DEV__ ? AD_UNIT_IDS.INTERSTITIAL_TEST : AD_UNIT_IDS.INTERSTITIAL_PROD,
  REWARDED: __DEV__ ? AD_UNIT_IDS.REWARDED_TEST : AD_UNIT_IDS.REWARDED_PROD,
};

// Configurações de anúncios
const AD_CONFIG = {
  // Frequência de anúncios intersticiais (em minutos)
  INTERSTITIAL_FREQUENCY: 3,
  // Tempo mínimo entre anúncios (em segundos)
  MIN_TIME_BETWEEN_ADS: 30,
  // Anúncios por sessão
  MAX_ADS_PER_SESSION: 5,
  // Anúncios recompensados por dia
  MAX_REWARDED_PER_DAY: 3,
};

export const AdsProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [interstitialAd, setInterstitialAd] = useState(null);
  const [rewardedAd, setRewardedAd] = useState(null);
  const [isInterstitialLoading, setIsInterstitialLoading] = useState(false);
  const [isRewardedLoading, setIsRewardedLoading] = useState(false);
  const [adsShownToday, setAdsShownToday] = useState(0);
  const [lastAdTime, setLastAdTime] = useState(0);
  const [sessionAdCount, setSessionAdCount] = useState(0);

  // Inicializar sistema de anúncios
  useEffect(() => {
    initializeAds();
  }, []);

  const initializeAds = async () => {
    try {
      // Carregar dados salvos
      await loadAdsData();
      
      // Criar anúncios simulados
      createInterstitialAd();
      createRewardedAd();
      
      setIsInitialized(true);
      console.log('Sistema de anúncios inicializado (modo simulado)');
      
    } catch (error) {
      console.error('Erro ao inicializar anúncios:', error);
      // Fallback para simulação se houver erro
      setIsInitialized(true);
    }
  };

  const loadAdsData = async () => {
    try {
      const savedAdsShown = await AsyncStorage.getItem('ads_shown_today');
      const savedLastAdTime = await AsyncStorage.getItem('last_ad_time');
      const savedSessionCount = await AsyncStorage.getItem('session_ad_count');
      
      if (savedAdsShown) {
        setAdsShownToday(parseInt(savedAdsShown));
      }
      
      if (savedLastAdTime) {
        setLastAdTime(parseInt(savedLastAdTime));
      }
      
      if (savedSessionCount) {
        setSessionAdCount(parseInt(savedSessionCount));
      }
      
      // Resetar contadores se for um novo dia
      await checkAndResetDailyCounters();
      
    } catch (error) {
      console.error('Erro ao carregar dados de anúncios:', error);
    }
  };

  const checkAndResetDailyCounters = async () => {
    try {
      const lastAdDate = await AsyncStorage.getItem('last_ad_date');
      const today = new Date().toDateString();
      
      if (lastAdDate !== today) {
        // Novo dia, resetar contadores
        setAdsShownToday(0);
        setSessionAdCount(0);
        await AsyncStorage.setItem('ads_shown_today', '0');
        await AsyncStorage.setItem('session_ad_count', '0');
        await AsyncStorage.setItem('last_ad_date', today);
      }
    } catch (error) {
      console.error('Erro ao verificar contadores diários:', error);
    }
  };

  // Criar anúncio intersticial simulado
  const createInterstitialAd = () => {
    try {
      // Simular anúncio intersticial
      const simulatedAd = {
        id: 'simulated-interstitial',
        isLoaded: () => true,
        load: () => {
          setIsInterstitialLoading(false);
          console.log('Anúncio intersticial simulado carregado');
        },
        show: () => {
          console.log('Anúncio intersticial simulado exibido');
          // Simular tempo de exibição
          setTimeout(() => {
            handleInterstitialClosed();
          }, 2000);
        }
      };

      setInterstitialAd(simulatedAd);
      setIsInterstitialLoading(false);
      
    } catch (error) {
      console.error('Erro ao criar anúncio intersticial:', error);
      setIsInterstitialLoading(false);
    }
  };

  // Função para lidar com anúncio intersticial fechado
  const handleInterstitialClosed = () => {
    console.log('Anúncio intersticial simulado fechado');
    // Recriar anúncio após ser fechado
    setTimeout(() => {
      createInterstitialAd();
    }, 1000);
  };

  // Função para lidar com anúncio recompensado fechado
  const handleRewardedAdClosed = () => {
    console.log('Anúncio recompensado simulado fechado');
    // Simular recompensa ganha
    handleRewardEarned({ amount: 10, type: 'moedas' });
    // Recriar anúncio após ser fechado
    setTimeout(() => {
      createRewardedAd();
    }, 1000);
  };

  // Criar anúncio recompensado simulado
  const createRewardedAd = () => {
    try {
      // Simular anúncio recompensado
      const simulatedAd = {
        id: 'simulated-rewarded',
        isLoaded: () => true,
        load: () => {
          setIsRewardedLoading(false);
          console.log('Anúncio recompensado simulado carregado');
        },
        show: () => {
          console.log('Anúncio recompensado simulado exibido');
          // Simular tempo de exibição e recompensa
          setTimeout(() => {
            handleRewardedAdClosed();
          }, 3000);
        }
      };

      setRewardedAd(simulatedAd);
      setIsRewardedLoading(false);
      
    } catch (error) {
      console.error('Erro ao criar anúncio recompensado:', error);
      setIsRewardedLoading(false);
    }
  };

  // Mostrar anúncio intersticial
  const showInterstitialAd = async () => {
    try {
      // Verificar se anúncios estão habilitados
      const adsSettings = await AsyncStorage.getItem('ads_settings');
      if (adsSettings) {
        const settings = JSON.parse(adsSettings);
        if (!settings.adsEnabled || !settings.interstitialEnabled) {
          console.log('Anúncios intersticiais desabilitados pelo usuário');
          return false;
        }
      }

      // Verificar se anúncio está disponível
      if (!interstitialAd || isInterstitialLoading) {
        console.log('Anúncio intersticial não disponível');
        return false;
      }

      // Verificar frequência
      if (!canShowAd()) {
        console.log('Muitos anúncios recentemente');
        return false;
      }

      // Verificar limite de sessão
      if (sessionAdCount >= AD_CONFIG.MAX_ADS_PER_SESSION) {
        console.log('Limite de anúncios por sessão atingido');
        return false;
      }

      setIsInterstitialLoading(true);
      
      // Mostrar anúncio
      await interstitialAd.show();
      
      // Atualizar contadores
      await updateAdCounters();
      
      return true;
      
    } catch (error) {
      console.error('Erro ao mostrar anúncio intersticial:', error);
      setIsInterstitialLoading(false);
      return false;
    }
  };

  // Mostrar anúncio recompensado
  const showRewardedAd = async () => {
    try {
      // Verificar se anúncios estão habilitados
      const adsSettings = await AsyncStorage.getItem('ads_settings');
      if (adsSettings) {
        const settings = JSON.parse(adsSettings);
        if (!settings.adsEnabled || !settings.rewardedEnabled) {
          console.log('Anúncios recompensados desabilitados pelo usuário');
          return false;
        }
      }

      // Verificar se anúncio está disponível
      if (!rewardedAd || isRewardedLoading) {
        console.log('Anúncio recompensado não disponível');
        return false;
      }

      // Verificar limite diário
      if (adsShownToday >= AD_CONFIG.MAX_REWARDED_PER_DAY) {
        Alert.alert(
          'Limite Atingido',
          'Você já assistiu o máximo de anúncios recompensados por hoje. Volte amanhã!',
          [{ text: 'OK' }]
        );
        return false;
      }

      setIsRewardedLoading(true);
      
      // Mostrar anúncio
      await rewardedAd.show();
      
      return true;
      
    } catch (error) {
      console.error('Erro ao mostrar anúncio recompensado:', error);
      setIsRewardedLoading(false);
      return false;
    }
  };

  // Processar recompensa ganha
  const handleRewardEarned = async (reward) => {
    try {
      // Atualizar contadores
      await updateAdCounters();
      
      // Aqui você pode implementar a lógica de recompensa
      // Por exemplo: dar moedas virtuais, tempo premium, etc.
      
      Alert.alert(
        'Recompensa Ganha! 🎉',
        `Parabéns! Você ganhou ${reward.amount} ${reward.type}!`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Erro ao processar recompensa:', error);
    }
  };

  // Verificar se pode mostrar anúncio
  const canShowAd = () => {
    const now = Date.now();
    const timeSinceLastAd = (now - lastAdTime) / 1000; // em segundos
    
    return timeSinceLastAd >= AD_CONFIG.MIN_TIME_BETWEEN_ADS;
  };

  // Atualizar contadores de anúncios
  const updateAdCounters = async () => {
    try {
      const now = Date.now();
      
      setAdsShownToday(prev => prev + 1);
      setLastAdTime(now);
      setSessionAdCount(prev => prev + 1);
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem('ads_shown_today', (adsShownToday + 1).toString());
      await AsyncStorage.setItem('last_ad_time', now.toString());
      await AsyncStorage.setItem('session_ad_count', (sessionAdCount + 1).toString());
      
    } catch (error) {
      console.error('Erro ao atualizar contadores:', error);
    }
  };

  // Verificar se anúncio está carregado
  const isInterstitialReady = () => {
    return interstitialAd && !isInterstitialLoading;
  };

  const isRewardedReady = () => {
    return rewardedAd && !isRewardedLoading;
  };

  // Obter estatísticas de anúncios
  const getAdsStats = () => {
    return {
      adsShownToday,
      sessionAdCount,
      maxAdsPerSession: AD_CONFIG.MAX_ADS_PER_SESSION,
      maxRewardedPerDay: AD_CONFIG.MAX_REWARDED_PER_DAY,
      timeSinceLastAd: lastAdTime ? Math.floor((Date.now() - lastAdTime) / 1000) : 0,
      canShowAd: canShowAd(),
      isProduction: !__DEV__,
      adUnitIds: AD_UNIT_IDS_FINAL,
    };
  };

  // Componente de banner simulado
  const BannerAdComponent = ({ size = 'BANNER', style }) => {
    const [showBanner, setShowBanner] = React.useState(true);

    React.useEffect(() => {
      checkBannerSettings();
    }, []);

    const checkBannerSettings = async () => {
      try {
        const adsSettings = await AsyncStorage.getItem('ads_settings');
        if (adsSettings) {
          const settings = JSON.parse(adsSettings);
          if (!settings.adsEnabled || !settings.bannerEnabled) {
            setShowBanner(false);
            return;
          }
        }
        setShowBanner(true);
      } catch (error) {
        console.error('Erro ao verificar configurações de banner:', error);
      }
    };

    if (!showBanner) {
      return null;
    }

    // Banner simulado
    return (
      <View style={[{
        height: size === 'BANNER' ? 50 : size === 'LARGE_BANNER' ? 90 : 250,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
      }, style]}>
        <Text style={{ color: '#666', fontSize: 12 }}>Banner Ad Simulado</Text>
        <Text style={{ color: '#999', fontSize: 10 }}>{AD_UNIT_IDS_FINAL.BANNER}</Text>
      </View>
    );
  };

  const value = {
    // Estado
    isInitialized,
    isInterstitialLoading,
    isRewardedLoading,
    
    // Funções
    showInterstitialAd,
    showRewardedAd,
    isInterstitialReady,
    isRewardedReady,
    getAdsStats,
    
    // Componentes
    BannerAdComponent,
    
    // Configurações
    AD_CONFIG,
    AD_UNIT_IDS_FINAL,
  };

  return (
    <AdsContext.Provider value={value}>
      {children}
    </AdsContext.Provider>
  );
};

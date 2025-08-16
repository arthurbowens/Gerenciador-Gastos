import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAds } from '../contexts/AdsContext';

export const useInterstitialAds = (screenName, options = {}) => {
  const navigation = useNavigation();
  const { showInterstitialAd, isInterstitialReady, getAdsStats } = useAds();
  const lastAdTime = useRef(0);
  const adCount = useRef(0);
  
  const {
    showOnExit = true,
    showOnEnter = false,
    minInterval = 60, // segundos
    maxPerSession = 3
  } = options;

  useEffect(() => {
    const listeners = [];

    if (showOnExit) {
      listeners.push(
        navigation.addListener('beforeRemove', (e) => {
          handleShowInterstitialAd('exit');
        })
      );
    }

    if (showOnEnter) {
      listeners.push(
        navigation.addListener('focus', () => {
          handleShowInterstitialAd('enter');
        })
      );
    }

    return () => {
      listeners.forEach(unsubscribe => unsubscribe());
    };
  }, [navigation, showOnExit, showOnEnter]);

  const handleShowInterstitialAd = async (trigger) => {
    try {
      const stats = getAdsStats();
      
      // Verificar se pode mostrar anúncio
      if (!isInterstitialReady() || !stats.canShowAd) {
        return;
      }

      // Verificar frequência baseada no intervalo configurado
      const now = Date.now();
      const timeSinceLastAd = (now - lastAdTime.current) / 1000;
      
      if (timeSinceLastAd < minInterval) {
        return;
      }

      // Verificar limite de anúncios por sessão
      if (adCount.current >= maxPerSession) {
        return;
      }

      // Mostrar anúncio
      const success = await showInterstitialAd();
      
      if (success) {
        lastAdTime.current = now;
        adCount.current++;
        console.log(`Anúncio intersticial mostrado (${trigger}) - ${screenName}`);
      }
      
    } catch (error) {
      console.error('Erro ao mostrar anúncio intersticial:', error);
    }
  };

  // Função para mostrar anúncio manualmente
  const showAdManually = async () => {
    await handleShowInterstitialAd();
  };

  return {
    showAdManually,
    isReady: isInterstitialReady(),
    stats: {
      lastAdTime: lastAdTime.current,
      adCount: adCount.current,
      maxPerSession,
      minInterval
    }
  };
};

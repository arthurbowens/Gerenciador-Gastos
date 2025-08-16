import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { Card, Title, List, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAds } from '../contexts/AdsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdsSettingsCard() {
  const { isInitialized, AD_CONFIG } = useAds();
  const { isPremium } = useSubscription();
  
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [interstitialEnabled, setInterstitialEnabled] = useState(true);
  const [rewardedEnabled, setRewardedEnabled] = useState(true);
  const [bannerEnabled, setBannerEnabled] = useState(true);

  // Carregar configurações salvas
  React.useEffect(() => {
    loadAdsSettings();
  }, []);

  const loadAdsSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('ads_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setAdsEnabled(parsed.adsEnabled ?? true);
        setInterstitialEnabled(parsed.interstitialEnabled ?? true);
        setRewardedEnabled(parsed.rewardedEnabled ?? true);
        setBannerEnabled(parsed.bannerEnabled ?? true);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de anúncios:', error);
    }
  };

  const saveAdsSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('ads_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Erro ao salvar configurações de anúncios:', error);
    }
  };

  const handleToggleAds = async (value) => {
    if (!value) {
      Alert.alert(
        'Desabilitar Anúncios',
        'Ao desabilitar os anúncios, você não verá mais anúncios no app. Isso pode afetar a experiência gratuita.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Desabilitar', 
            style: 'destructive',
            onPress: () => {
              setAdsEnabled(false);
              saveAdsSettings({
                adsEnabled: false,
                interstitialEnabled: false,
                rewardedEnabled: false,
                bannerEnabled: false
              });
            }
          }
        ]
      );
    } else {
      setAdsEnabled(true);
      saveAdsSettings({
        adsEnabled: true,
        interstitialEnabled: true,
        rewardedEnabled: true,
        bannerEnabled: true
      });
    }
  };

  const handleToggleInterstitial = async (value) => {
    setInterstitialEnabled(value);
    saveAdsSettings({
      adsEnabled,
      interstitialEnabled: value,
      rewardedEnabled,
      bannerEnabled
    });
  };

  const handleToggleRewarded = async (value) => {
    setRewardedEnabled(value);
    saveAdsSettings({
      adsEnabled,
      interstitialEnabled,
      rewardedEnabled: value,
      bannerEnabled
    });
  };

  const handleToggleBanner = async (value) => {
    setBannerEnabled(value);
    saveAdsSettings({
      adsEnabled,
      interstitialEnabled,
      rewardedEnabled,
      bannerEnabled: value
    });
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Restaurar Padrões',
      'Tem certeza que deseja restaurar as configurações padrão de anúncios?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: () => {
            setAdsEnabled(true);
            setInterstitialEnabled(true);
            setRewardedEnabled(true);
            setBannerEnabled(true);
            saveAdsSettings({
              adsEnabled: true,
              interstitialEnabled: true,
              rewardedEnabled: true,
              bannerEnabled: true
            });
          }
        }
      ]
    );
  };

  if (!isInitialized) {
    return null;
  }

  if (isPremium) {
    return (
      <Card style={styles.container}>
        <Card.Content>
          <Title style={styles.title}>🎉 Usuário Premium</Title>
          <Text style={styles.premiumText}>
            Como usuário premium, você não verá anúncios no app. Aproveite a experiência sem interrupções!
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Card.Content>
        <Title style={styles.title}>⚙️ Configurações de Anúncios</Title>
        
        {/* Anúncios gerais */}
        <List.Item
          title="Anúncios no App"
          description="Habilitar ou desabilitar todos os tipos de anúncios"
          left={() => <List.Icon icon="cash" color="#3B82F6" />}
          right={() => (
            <Switch
              value={adsEnabled}
              onValueChange={handleToggleAds}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={adsEnabled ? '#FFFFFF' : '#9CA3AF'}
            />
          )}
        />

        {/* Anúncios intersticiais */}
        <List.Item
          title="Anúncios Intersticiais"
          description={`Anúncios de tela cheia (máx. ${AD_CONFIG.MAX_ADS_PER_SESSION}/sessão)`}
          left={() => <List.Icon icon="fullscreen" color="#10B981" />}
          right={() => (
            <Switch
              value={interstitialEnabled && adsEnabled}
              onValueChange={handleToggleInterstitial}
              disabled={!adsEnabled}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor={(interstitialEnabled && adsEnabled) ? '#FFFFFF' : '#9CA3AF'}
            />
          )}
        />

        {/* Anúncios recompensados */}
        <List.Item
          title="Anúncios Recompensados"
          description={`Ganhe recompensas assistindo anúncios (máx. ${AD_CONFIG.MAX_REWARDED_PER_DAY}/dia)`}
          left={() => <List.Icon icon="gift" color="#F59E0B" />}
          right={() => (
            <Switch
              value={rewardedEnabled && adsEnabled}
              onValueChange={handleToggleRewarded}
              disabled={!adsEnabled}
              trackColor={{ false: '#D1D5DB', true: '#F59E0B' }}
              thumbColor={(rewardedEnabled && adsEnabled) ? '#FFFFFF' : '#9CA3AF'}
            />
          )}
        />

        {/* Anúncios banner */}
        <List.Item
          title="Anúncios Banner"
          description="Anúncios pequenos no rodapé das telas"
          left={() => <List.Icon icon="format-list-bulleted" color="#EF4444" />}
          right={() => (
            <Switch
              value={bannerEnabled && adsEnabled}
              onValueChange={handleToggleBanner}
              disabled={!adsEnabled}
              trackColor={{ false: '#D1D5DB', true: '#EF4444' }}
              thumbColor={(bannerEnabled && adsEnabled) ? '#FFFFFF' : '#9CA3AF'}
            />
          )}
        />

        {/* Informações */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            💡 Os anúncios ajudam a manter o app gratuito e são mostrados de forma inteligente
          </Text>
          <Text style={styles.infoText}>
            🎯 Anúncios relevantes para finanças e economia
          </Text>
          <Text style={styles.infoText}>
            ⏱️ Frequência controlada para não prejudicar sua experiência
          </Text>
        </View>

        {/* Botão restaurar */}
        <Button
          mode="outlined"
          onPress={resetToDefaults}
          style={styles.resetButton}
          textColor="#6B7280"
        >
          Restaurar Configurações Padrão
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  premiumText: {
    fontSize: 14,
    color: '#065F46',
    textAlign: 'center',
    lineHeight: 20,
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 8,
  },
  infoContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 16,
  },
  resetButton: {
    marginTop: 8,
    borderColor: '#D1D5DB',
  },
});

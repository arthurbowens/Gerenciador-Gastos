import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Card, Title, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAds } from '../contexts/AdsContext';

export default function AdsTestPanel() {
  const { 
    showInterstitialAd, 
    showRewardedAd, 
    isInterstitialReady, 
    isRewardedReady,
    getAdsStats,
    isInitialized 
  } = useAds();

  if (!__DEV__ || !isInitialized) {
    return null;
  }

  const handleTestInterstitial = async () => {
    try {
      if (!isInterstitialReady()) {
        Alert.alert('Teste', 'Anúncio intersticial não está pronto. Aguarde...');
        return;
      }

      const success = await showInterstitialAd();
      if (success) {
        Alert.alert('Teste', 'Anúncio intersticial mostrado com sucesso!');
      } else {
        Alert.alert('Teste', 'Falha ao mostrar anúncio intersticial');
      }
    } catch (error) {
      Alert.alert('Erro', `Erro ao testar anúncio: ${error.message}`);
    }
  };

  const handleTestRewarded = async () => {
    try {
      if (!isRewardedReady()) {
        Alert.alert('Teste', 'Anúncio recompensado não está pronto. Aguarde...');
        return;
      }

      const success = await showRewardedAd();
      if (success) {
        Alert.alert('Teste', 'Anúncio recompensado mostrado com sucesso!');
      } else {
        Alert.alert('Teste', 'Falha ao mostrar anúncio recompensado');
      }
    } catch (error) {
      Alert.alert('Erro', `Erro ao testar anúncio: ${error.message}`);
    }
  };

  const showStats = () => {
    const stats = getAdsStats();
    Alert.alert(
      'Estatísticas de Anúncios',
      `Anúncios hoje: ${stats.adsShownToday}\n` +
      `Na sessão: ${stats.sessionAdCount}\n` +
      `Pode mostrar: ${stats.canShowAd ? 'Sim' : 'Não'}\n` +
      `Tempo desde último: ${Math.floor(stats.timeSinceLastAd / 60)}m ${stats.timeSinceLastAd % 60}s`
    );
  };

  return (
    <Card style={styles.container}>
      <Card.Content>
        <Title style={styles.title}>🧪 Painel de Teste - Anúncios</Title>
        <Text style={styles.subtitle}>
          Use este painel apenas durante o desenvolvimento para testar anúncios
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleTestInterstitial}
            disabled={!isInterstitialReady}
            style={[styles.testButton, { backgroundColor: '#3B82F6' }]}
            icon="fullscreen"
          >
            Testar Intersticial
          </Button>
          
          <Button
            mode="contained"
            onPress={handleTestRewarded}
            disabled={!isRewardedReady}
            style={[styles.testButton, { backgroundColor: '#10B981' }]}
            icon="gift"
          >
            Testar Recompensado
          </Button>
          
          <Button
            mode="outlined"
            onPress={showStats}
            style={styles.testButton}
                         icon="chart-line"
          >
            Ver Estatísticas
          </Button>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Ionicons 
              name={isInterstitialReady ? "checkmark-circle" : "clock"} 
              size={16} 
              color={isInterstitialReady ? "#10B981" : "#F59E0B"} 
            />
            <Text style={styles.statusText}>
              Intersticial: {isInterstitialReady ? 'Pronto' : 'Carregando...'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Ionicons 
              name={isRewardedReady ? "checkmark-circle" : "clock"} 
              size={16} 
              color={isRewardedReady ? "#10B981" : "#F59E0B"} 
            />
            <Text style={styles.statusText}>
              Recompensado: {isRewardedReady ? 'Pronto' : 'Carregando...'}
            </Text>
          </View>
        </View>

        <Text style={styles.warningText}>
          ⚠️ Este painel só aparece em modo de desenvolvimento
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#92400E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 8,
    marginBottom: 16,
  },
  testButton: {
    marginBottom: 8,
  },
  statusContainer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 8,
    fontWeight: '500',
  },
  warningText: {
    fontSize: 10,
    color: '#92400E',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

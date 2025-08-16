import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAds } from '../contexts/AdsContext';
import { useSubscription } from '../contexts/SubscriptionContext';

export default function RewardedAdButton({ 
  onRewardEarned, 
  rewardType = 'moedas', 
  rewardAmount = 10,
  style,
  disabled = false 
}) {
  const { showRewardedAd, isRewardedReady, isRewardedLoading, getAdsStats } = useAds();
  const { isPremium } = useSubscription();

  const handleShowRewardedAd = async () => {
    try {
      if (isPremium) {
        Alert.alert(
          'Usuário Premium',
          'Usuários premium não precisam assistir anúncios recompensados!',
          [{ text: 'OK' }]
        );
        return;
      }

      const stats = getAdsStats();
      
      if (stats.adsShownToday >= 3) {
        Alert.alert(
          'Limite Atingido',
          'Você já assistiu o máximo de anúncios recompensados por hoje. Volte amanhã!',
          [{ text: 'OK' }]
        );
        return;
      }

      const success = await showRewardedAd();
      
      if (success) {
        // A recompensa será processada automaticamente pelo AdsContext
        if (onRewardEarned) {
          onRewardEarned(rewardType, rewardAmount);
        }
      }
      
    } catch (error) {
      console.error('Erro ao mostrar anúncio recompensado:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar o anúncio. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  if (isPremium) {
    return null; // Não mostrar para usuários premium
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        style,
        disabled && styles.disabled,
        !isRewardedReady && styles.notReady
      ]}
      onPress={handleShowRewardedAd}
      disabled={disabled || !isRewardedReady || isRewardedLoading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name="play-circle" 
            size={24} 
            color="#FFFFFF" 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isRewardedLoading ? 'Carregando...' : 'Assistir Anúncio'}
          </Text>
          <Text style={styles.subtitle}>
            Ganhe {rewardAmount} {rewardType}
          </Text>
        </View>
        
        <View style={styles.arrowContainer}>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color="#FFFFFF" 
          />
        </View>
      </View>
      
      {!isRewardedReady && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
  },
  disabled: {
    opacity: 0.5,
  },
  notReady: {
    backgroundColor: '#9CA3AF',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

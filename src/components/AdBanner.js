import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAds } from '../contexts/AdsContext';
import { useSubscription } from '../contexts/SubscriptionContext';

export default function AdBanner({ 
  size = 'BANNER', 
  position = 'bottom', 
  style,
  showForPremium = false 
}) {
  const { BannerAdComponent } = useAds();
  const { isPremium } = useSubscription();

  // Não mostrar anúncios para usuários premium (a menos que showForPremium = true)
  if (isPremium && !showForPremium) {
    return null;
  }

  const getBannerSize = () => {
    switch (size) {
      case 'BANNER':
        return 'BANNER';
      case 'LARGE_BANNER':
        return 'LARGE_BANNER';
      case 'MEDIUM_RECTANGLE':
        return 'MEDIUM_RECTANGLE';
      case 'FULL_BANNER':
        return 'FULL_BANNER';
      case 'LEADERBOARD':
        return 'LEADERBOARD';
      default:
        return 'BANNER';
    }
  };

  const getBannerStyle = () => {
    const baseStyle = {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8FAFC',
      borderTopWidth: position === 'bottom' ? 1 : 0,
      borderBottomWidth: position === 'top' ? 1 : 0,
      borderColor: '#E5E7EB',
    };

    return [baseStyle, style];
  };

  return (
    <View style={getBannerStyle()}>
      <BannerAdComponent size={getBannerSize()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

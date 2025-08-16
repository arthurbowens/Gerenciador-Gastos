import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAds } from '../contexts/AdsContext';

export default function AdsStatsCard() {
  const { getAdsStats, isInitialized } = useAds();
  
  if (!isInitialized) {
    return null;
  }

  const stats = getAdsStats();

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <Card style={styles.container}>
      <Card.Content>
        <Title style={styles.title}>📊 Estatísticas de Anúncios</Title>
        
        <View style={styles.statsGrid}>
          {/* Anúncios hoje */}
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="calendar" size={20} color="#3B82F6" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stats.adsShownToday}</Text>
              <Text style={styles.statLabel}>Anúncios hoje</Text>
            </View>
          </View>

          {/* Anúncios na sessão */}
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="play-circle" size={20} color="#10B981" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stats.sessionAdCount}</Text>
              <Text style={styles.statLabel}>Na sessão</Text>
            </View>
          </View>

          {/* Limite por sessão */}
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="shield-checkmark" size={20} color="#F59E0B" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stats.maxAdsPerSession}</Text>
              <Text style={styles.statLabel}>Limite sessão</Text>
            </View>
          </View>

          {/* Limite recompensados */}
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="gift" size={20} color="#EF4444" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stats.maxRewardedPerDay}</Text>
              <Text style={styles.statLabel}>Recompensados/dia</Text>
            </View>
          </View>
        </View>

        {/* Status atual */}
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Ionicons 
              name={stats.canShowAd ? "checkmark-circle" : "clock"} 
              size={16} 
              color={stats.canShowAd ? "#10B981" : "#F59E0B"} 
            />
            <Text style={styles.statusText}>
              {stats.canShowAd ? "Pronto para anúncio" : `Aguarde ${formatTime(stats.timeSinceLastAd)}`}
            </Text>
          </View>
        </View>

        {/* Informações adicionais */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            💡 Os anúncios são mostrados de forma inteligente para não prejudicar sua experiência
          </Text>
          <Text style={styles.infoText}>
            🎯 Anúncios relevantes para finanças e economia
          </Text>
        </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    elevation: 1,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusContainer: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#065F46',
    marginLeft: 8,
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 4,
    lineHeight: 16,
  },
});

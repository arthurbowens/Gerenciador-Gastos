import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import RewardedAdButton from '../components/RewardedAdButton';

const { width, height } = Dimensions.get('window');

export default function PremiumScreen({ navigation }) {
  const { 
    isPremium, 
    currentPlan, 
    isLoading, 
    purchaseProduct, 
    restorePurchases, 
    cancelSubscription,
    SUBSCRIPTION_PLANS,
    PRODUCT_IDS,
    isRestoring
  } = useSubscription();
  
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { formatCurrency } = useCurrency();
  
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePurchase = async (productId) => {
    if (!selectedPlan) {
      Alert.alert('Selecione um Plano', 'Por favor, selecione um plano antes de continuar.');
      return;
    }
    
    try {
      await purchaseProduct(productId);
    } catch (error) {
      console.error('Erro na compra:', error);
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
    } catch (error) {
      console.error('Erro na restauração:', error);
    }
  };

  const renderFeatureItem = (feature, index) => (
    <View key={index} style={styles.featureItem}>
      <Ionicons 
        name="checkmark-circle" 
        size={20} 
        color="#10B981" 
        style={styles.featureIcon}
      />
      <Text style={[styles.featureText, { color: '#1F2937' }]}>
        {feature}
      </Text>
    </View>
  );

  const renderPlanCard = (plan, productId) => {
    const isSelected = selectedPlan === productId;
    const isCurrentPlan = currentPlan && currentPlan.id === productId;
    
    return (
      <TouchableOpacity
        key={productId}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          isCurrentPlan && styles.currentPlanCard
        ]}
        onPress={() => setSelectedPlan(productId)}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan && (
          <View style={styles.currentPlanBadge}>
            <Text style={styles.currentPlanBadgeText}>Plano Atual</Text>
          </View>
        )}
        
        {plan.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{plan.discount}</Text>
          </View>
        )}
        
        <View style={styles.planHeader}>
          <Title style={[styles.planTitle, { color: '#1F2937' }]}>
            {plan.name}
          </Title>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: '#1E3A8A' }]}>
              {plan.price}
            </Text>
            {plan.originalPrice && (
              <Text style={[styles.originalPrice, { color: '#9CA3AF' }]}>
                {plan.originalPrice}
              </Text>
            )}
            {plan.period !== 'lifetime' && (
              <Text style={[styles.period, { color: '#6B7280' }]}>
                /{plan.period === 'month' ? 'mês' : 'ano'}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => renderFeatureItem(feature, index))}
        </View>
        
        {isCurrentPlan ? (
          <Button
            mode="outlined"
            onPress={cancelSubscription}
            style={[styles.cancelButton, { borderColor: '#EF4444' }]}
            textColor="#EF4444"
            disabled={isLoading}
          >
            Cancelar Assinatura
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={() => handlePurchase(productId)}
            style={[
              styles.purchaseButton,
              isSelected && { backgroundColor: '#3B82F6' }
            ]}
            disabled={isLoading || !isSelected}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              'Selecionar Plano'
            )}
          </Button>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#FFFFFF' }]}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={[styles.loadingText, { color: '#1F2937' }]}>
          Carregando planos...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <StatusBar 
        barStyle="light-content"
        backgroundColor="#1E3A8A"
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Ionicons name="star" size={40} color="white" />
          <Title style={styles.headerTitle}>Upgrade Premium</Title>
          <Text style={styles.headerSubtitle}>
            Desbloqueie todo o potencial do seu controle financeiro
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status atual */}
        {isPremium && currentPlan && (
          <Card style={[styles.currentPlanCard, { backgroundColor: '#F0FDF4' }]}>
            <Card.Content>
              <View style={styles.currentPlanInfo}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <View style={styles.currentPlanText}>
                  <Title style={[styles.currentPlanTitle, { color: '#1F2937' }]}>
                    Plano Ativo: {currentPlan.name}
                  </Title>
                  <Text style={[styles.currentPlanSubtitle, { color: '#6B7280' }]}>
                    Você tem acesso a todas as funcionalidades premium
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Planos disponíveis */}
        <View style={styles.plansContainer}>
          <Text style={[styles.sectionTitle, { color: '#1F2937' }]}>
            Escolha seu Plano
          </Text>
          
          {Object.entries(SUBSCRIPTION_PLANS).map(([productId, plan]) => 
            renderPlanCard(plan, productId)
          )}
        </View>

        {/* Botão de compra */}
        {selectedPlan && (
          <View style={styles.purchaseContainer}>
            <Button
              mode="contained"
              onPress={() => handlePurchase(selectedPlan)}
              style={[styles.mainPurchaseButton, { backgroundColor: '#1E3A8A' }]}
              contentStyle={styles.mainPurchaseButtonContent}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="card" size={20} color="white" />
                  <Text style={styles.mainPurchaseButtonText}>
                    Comprar {SUBSCRIPTION_PLANS[selectedPlan]?.name}
                  </Text>
                </>
              )}
            </Button>
          </View>
        )}

        {/* Anúncios recompensados */}
        <View style={styles.rewardedAdsContainer}>
          <Text style={[styles.sectionTitle, { color: '#1F2937' }]}>
            Ganhe Recompensas
          </Text>
          <RewardedAdButton
            rewardType="moedas"
            rewardAmount={50}
            onRewardEarned={(type, amount) => {
              console.log(`Recompensa ganha: ${amount} ${type}`);
            }}
          />
          <RewardedAdButton
            rewardType="tempo premium"
            rewardAmount="1 dia"
            onRewardEarned={(type, amount) => {
              console.log(`Recompensa ganha: ${amount} ${type}`);
            }}
          />
        </View>

        {/* Restaurar compras */}
        <View style={styles.restoreContainer}>
          <Button
            mode="text"
            onPress={handleRestore}
            disabled={isRestoring}
            textColor="#1E3A8A"
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color="#1E3A8A" />
            ) : (
              'Restaurar Compras'
            )}
          </Button>
        </View>

        {/* Informações adicionais */}
        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: '#6B7280' }]}>
            • As assinaturas são renovadas automaticamente
          </Text>
          <Text style={[styles.infoText, { color: '#6B7280' }]}>
            • Você pode cancelar a qualquer momento
          </Text>
          <Text style={[styles.infoText, { color: '#6B7280' }]}>
            • Suporte 24/7 para usuários premium
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  currentPlanCard: {
    marginBottom: 20,
    elevation: 4,
  },
  currentPlanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPlanText: {
    marginLeft: 15,
    flex: 1,
  },
  currentPlanTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  currentPlanSubtitle: {
    fontSize: 14,
  },
  plansContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedPlanCard: {
    borderColor: '#3B82F6',
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  currentPlanCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  currentPlanBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentPlanBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  discountBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'center',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  period: {
    fontSize: 16,
    marginTop: 4,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  purchaseButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  selectedPurchaseButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  purchaseContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  mainPurchaseButton: {
    borderRadius: 16,
    paddingVertical: 12,
    elevation: 4,
  },
  mainPurchaseButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainPurchaseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rewardedAdsContainer: {
    marginBottom: 20,
  },
  restoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
});

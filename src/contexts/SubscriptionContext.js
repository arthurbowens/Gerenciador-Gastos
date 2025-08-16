import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import { 
  initConnection, 
  getProducts, 
  getSubscriptions, 
  purchaseProduct, 
  purchaseSubscription,
  finishTransaction,
  getAvailablePurchases,
  endConnection,
  ProductPurchase,
  SubscriptionPurchase,
  PurchaseError,
} from 'react-native-iap';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// IDs dos produtos - SUBSTITUA pelos seus IDs reais do Google Play Console
const PRODUCT_IDS = {
  // Produtos únicos
  PREMIUM_MONTH: 'premium_month', // SUBSTITUIR
  PREMIUM_YEAR: 'premium_year',   // SUBSTITUIR
  PREMIUM_LIFETIME: 'premium_lifetime', // SUBSTITUIR
  
  // Assinaturas
  SUBSCRIPTION_MONTH: 'subscription_month', // SUBSTITUIR
  SUBSCRIPTION_YEAR: 'subscription_year',   // SUBSTITUIR
};

// Planos de assinatura
const SUBSCRIPTION_PLANS = {
  [PRODUCT_IDS.SUBSCRIPTION_MONTH]: {
    id: PRODUCT_IDS.SUBSCRIPTION_MONTH,
    name: 'Premium Mensal',
    description: 'Acesso premium por 1 mês',
    price: 'R$ 9,90',
    priceValue: 9.90,
    period: 'month',
    features: [
      'Transações ilimitadas',
      'Categorias ilimitadas',
      'Relatórios avançados',
      'Backup na nuvem',
      'Exportar PDF',
      'Widgets',
      'Notificações inteligentes',
      'Análise de localização',
      'Categorização automática'
    ]
  },
  [PRODUCT_IDS.SUBSCRIPTION_YEAR]: {
    id: PRODUCT_IDS.SUBSCRIPTION_YEAR,
    name: 'Premium Anual',
    description: 'Acesso premium por 1 ano (2 meses grátis)',
    price: 'R$ 99,90',
    priceValue: 99.90,
    period: 'year',
    features: [
      'Transações ilimitadas',
      'Categorias ilimitadas',
      'Relatórios avançados',
      'Backup na nuvem',
      'Exportar PDF',
      'Widgets',
      'Notificações inteligentes',
      'Análise de localização',
      'Categorização automática',
      'Prioridade no suporte'
    ]
  },
  [PRODUCT_IDS.PREMIUM_LIFETIME]: {
    id: PRODUCT_IDS.PREMIUM_LIFETIME,
    name: 'Premium Vitalício',
    description: 'Acesso premium para sempre',
    price: 'R$ 199,90',
    priceValue: 199.90,
    period: 'lifetime',
    features: [
      'Transações ilimitadas',
      'Categorias ilimitadas',
      'Relatórios avançados',
      'Backup na nuvem',
      'Exportar PDF',
      'Widgets',
      'Notificações inteligentes',
      'Análise de localização',
      'Categorização automática',
      'Prioridade no suporte',
      'Atualizações premium',
      'Sem renovação'
    ]
  }
};

export const SubscriptionProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Inicializar conexão com Google Play
  useEffect(() => {
    initializeBilling();
    return () => {
      // Desconectar ao desmontar
      if (isConnected) {
        endConnection();
      }
    };
  }, []);

  const initializeBilling = async () => {
    try {
      if (Platform.OS !== 'android') {
        console.log('Google Play Billing só está disponível no Android');
        return;
      }

      // Inicializar conexão
      const result = await initConnection();
      setIsConnected(true);
      console.log('Conexão com Google Play estabelecida');

      // Carregar status da assinatura
      await loadSubscriptionStatus();
      
      // Carregar produtos disponíveis
      await loadProducts();
      
    } catch (error) {
      console.error('Erro ao inicializar billing:', error);
    }
  };

  const loadProducts = async () => {
    try {
      // Carregar produtos únicos
      const productsResult = await getProducts(Object.values(PRODUCT_IDS));
      
      // Carregar assinaturas
      const subscriptionsResult = await getSubscriptions(Object.values(PRODUCT_IDS));
      
      // Combinar produtos e assinaturas
      const allProducts = [...productsResult, ...subscriptionsResult];
      
      // Mapear produtos para nossos planos
      const mappedProducts = allProducts.map(product => {
        const plan = SUBSCRIPTION_PLANS[product.productId];
        if (plan) {
          return {
            ...plan,
            googleProduct: product,
            price: product.localizedPrice || plan.price,
            priceValue: product.price || plan.priceValue,
          };
        }
        return null;
      }).filter(Boolean);

      setProducts(mappedProducts);
      console.log('Produtos carregados:', mappedProducts.length);
      
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      // Carregar dados salvos
      const savedSubscription = await AsyncStorage.getItem('subscription_status');
      const savedPlan = await AsyncStorage.getItem('current_plan');
      const savedHistory = await AsyncStorage.getItem('purchase_history');
      
      if (savedSubscription) {
        const subscription = JSON.parse(savedSubscription);
        setIsPremium(subscription.isPremium);
        setCurrentPlan(subscription.plan);
      }
      
      if (savedPlan) {
        const plan = JSON.parse(savedPlan);
        setCurrentPlan(plan);
      }
      
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setPurchaseHistory(history);
      }
      
      // Verificar assinatura ativa
      await checkActiveSubscription();
      
    } catch (error) {
      console.error('Erro ao carregar status da assinatura:', error);
    }
  };

  const checkActiveSubscription = async () => {
    try {
      // Verificar compras disponíveis
      const purchases = await getAvailablePurchases();
      
      // Verificar se há assinatura ativa
      const activeSubscription = purchases.find(purchase => 
        purchase.productId === PRODUCT_IDS.SUBSCRIPTION_MONTH ||
        purchase.productId === PRODUCT_IDS.SUBSCRIPTION_YEAR
      );
      
      if (activeSubscription) {
        const plan = SUBSCRIPTION_PLANS[activeSubscription.productId];
        if (plan) {
          setIsPremium(true);
          setCurrentPlan(plan);
          
          // Salvar status
          await AsyncStorage.setItem('subscription_status', JSON.stringify({
            isPremium: true,
            plan: plan,
            purchaseDate: activeSubscription.transactionDate,
            expiryDate: activeSubscription.expiryDate
          }));
          
          await AsyncStorage.setItem('current_plan', JSON.stringify(plan));
          await AsyncStorage.setItem('has_active_subscription', 'true');
        }
      }
      
    } catch (error) {
      console.error('Erro ao verificar assinatura ativa:', error);
    }
  };

  // Comprar produto
  const purchaseProduct = async (productId) => {
    try {
      setIsLoading(true);
      
      const plan = SUBSCRIPTION_PLANS[productId];
      if (!plan) {
        throw new Error('Produto não encontrado');
      }

      let purchaseResult;
      
      if (plan.period === 'lifetime') {
        // Produto único
        purchaseResult = await purchaseProduct({ sku: productId });
      } else {
        // Assinatura
        purchaseResult = await purchaseSubscription({ sku: productId });
      }
      
      // Processar compra bem-sucedida
      await processSuccessfulPurchase(productId, plan, purchaseResult);
      
      return true;
      
    } catch (error) {
      console.error('Erro ao comprar produto:', error);
      
      if (error instanceof PurchaseError) {
        switch (error.code) {
          case 'E_USER_CANCELLED':
            Alert.alert('Compra Cancelada', 'A compra foi cancelada pelo usuário.');
            break;
          case 'E_ITEM_UNAVAILABLE':
            Alert.alert('Produto Indisponível', 'Este produto não está disponível no momento.');
            break;
          case 'E_NETWORK_ERROR':
            Alert.alert('Erro de Rede', 'Verifique sua conexão com a internet e tente novamente.');
            break;
          default:
            Alert.alert('Erro na Compra', 'Ocorreu um erro durante a compra. Tente novamente.');
        }
      } else {
        Alert.alert('Erro', 'Falha ao processar a compra. Tente novamente.');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Processar compra bem-sucedida
  const processSuccessfulPurchase = async (productId, plan, purchaseResult) => {
    try {
      const now = new Date();
      let expiryDate = null;
      
      // Calcular data de expiração baseada no período
      if (plan.period === 'month') {
        expiryDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      } else if (plan.period === 'year') {
        expiryDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      } else if (plan.period === 'lifetime') {
        expiryDate = new Date(now.getFullYear() + 100, now.getMonth(), now.getDate()); // 100 anos
      }
      
      // Atualizar estado
      setIsPremium(true);
      setCurrentPlan(plan);
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem('subscription_status', JSON.stringify({
        isPremium: true,
        plan: plan,
        purchaseDate: now.toISOString(),
        expiryDate: expiryDate?.toISOString()
      }));
      
      await AsyncStorage.setItem('current_plan', JSON.stringify(plan));
      await AsyncStorage.setItem('has_active_subscription', 'true');
      if (expiryDate) {
        await AsyncStorage.setItem('subscription_expiry', expiryDate.toISOString());
      }
      
      // Adicionar ao histórico
      const newPurchase = {
        id: Date.now().toString(),
        productId,
        plan,
        purchaseDate: now.toISOString(),
        amount: plan.priceValue,
        status: 'completed',
        transactionId: purchaseResult.transactionId || `TXN_${Date.now()}`
      };
      
      setPurchaseHistory(prev => [newPurchase, ...prev]);
      await AsyncStorage.setItem('purchase_history', JSON.stringify([newPurchase, ...purchaseHistory]));
      
      // Finalizar transação
      await finishTransaction(purchaseResult);
      
      Alert.alert(
        'Compra Realizada! 🎉',
        `Parabéns! Você agora é um usuário Premium com o plano ${plan.name}!`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Erro ao processar compra bem-sucedida:', error);
    }
  };

  // Restaurar compras
  const restorePurchases = async () => {
    try {
      setIsRestoring(true);
      
      const purchases = await getAvailablePurchases();
      
      if (purchases.length > 0) {
        // Verificar se há assinatura ativa
        const activeSubscription = purchases.find(purchase => 
          purchase.productId === PRODUCT_IDS.SUBSCRIPTION_MONTH ||
          purchase.productId === PRODUCT_IDS.SUBSCRIPTION_YEAR
        );
        
        if (activeSubscription) {
          const plan = SUBSCRIPTION_PLANS[activeSubscription.productId];
          if (plan) {
            setIsPremium(true);
            setCurrentPlan(plan);
            
            // Salvar status
            await AsyncStorage.setItem('subscription_status', JSON.stringify({
              isPremium: true,
              plan: plan,
              purchaseDate: activeSubscription.transactionDate,
              expiryDate: activeSubscription.expiryDate
            }));
            
            await AsyncStorage.setItem('current_plan', JSON.stringify(plan));
            await AsyncStorage.setItem('has_active_subscription', 'true');
            
            Alert.alert('Compras Restauradas', 'Sua assinatura Premium foi restaurada com sucesso!');
          }
        } else {
          Alert.alert('Nenhuma Compra Ativa', 'Não foi encontrada nenhuma assinatura Premium ativa para restaurar.');
        }
      } else {
        Alert.alert('Nenhuma Compra Encontrada', 'Não foi encontrada nenhuma compra para restaurar.');
      }
      
    } catch (error) {
      console.error('Erro ao restaurar compras:', error);
      Alert.alert('Erro', 'Falha ao restaurar compras. Tente novamente.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Cancelar assinatura
  const cancelSubscription = async () => {
    Alert.alert(
      'Cancelar Assinatura',
      'Tem certeza que deseja cancelar sua assinatura Premium?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Aqui você implementaria o cancelamento real
              // Por enquanto, vamos simular
              
              setIsPremium(false);
              setCurrentPlan(null);
              
              await AsyncStorage.removeItem('subscription_status');
              await AsyncStorage.removeItem('current_plan');
              await AsyncStorage.removeItem('has_active_subscription');
              await AsyncStorage.removeItem('subscription_expiry');
              
              Alert.alert('Assinatura Cancelada', 'Sua assinatura Premium foi cancelada com sucesso.');
              
            } catch (error) {
              console.error('Erro ao cancelar assinatura:', error);
              Alert.alert('Erro', 'Falha ao cancelar assinatura. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  // Verificar se uma funcionalidade está disponível
  const isFeatureAvailable = (feature) => {
    if (isPremium) return true;
    
    // Lista de funcionalidades gratuitas
    const freeFeatures = [
      'basic_transactions',
      'basic_categories',
      'basic_reports'
    ];
    
    return freeFeatures.includes(feature);
  };

  // Obter limite de transações
  const getTransactionLimit = () => {
    return isPremium ? -1 : 50; // -1 = ilimitado
  };

  // Obter limite de categorias
  const getCategoryLimit = () => {
    return isPremium ? -1 : 10; // -1 = ilimitado
  };

  const value = {
    // Estado
    isPremium,
    currentPlan,
    isLoading,
    products,
    purchaseHistory,
    isRestoring,
    isConnected,
    
    // Funções
    purchaseProduct,
    restorePurchases,
    cancelSubscription,
    isFeatureAvailable,
    getTransactionLimit,
    getCategoryLimit,
    
    // Constantes
    SUBSCRIPTION_PLANS,
    PRODUCT_IDS,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

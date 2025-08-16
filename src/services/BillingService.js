import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IDs dos produtos no Google Play Console
export const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'premium_monthly',
  PREMIUM_YEARLY: 'premium_yearly',
  PREMIUM_LIFETIME: 'premium_lifetime',
};

class BillingService {
  constructor() {
    this.isInitialized = false;
    this.products = [];
    this.purchases = [];
  }

  // Inicializar o serviço de billing
  async initialize() {
    try {
      if (Platform.OS !== 'android') {
        console.log('Billing só está disponível no Android');
        return false;
      }

      // Aqui você implementaria a inicialização real com react-native-iap
      // Por enquanto, vamos simular
      
      this.isInitialized = true;
      console.log('Billing service inicializado');
      return true;
    } catch (error) {
      console.error('Erro ao inicializar billing:', error);
      return false;
    }
  }

  // Obter produtos disponíveis
  async getProducts() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Aqui você implementaria a busca real dos produtos
      // Por enquanto, vamos simular
      
      const mockProducts = [
        {
          productId: PRODUCT_IDS.PREMIUM_MONTHLY,
          title: 'Premium Mensal',
          description: 'Acesso premium por 1 mês',
          price: 'R$ 9,90',
          priceValue: 9.90,
          currency: 'BRL',
          localizedPrice: 'R$ 9,90'
        },
        {
          productId: PRODUCT_IDS.PREMIUM_YEARLY,
          title: 'Premium Anual',
          description: 'Acesso premium por 1 ano',
          price: 'R$ 99,90',
          priceValue: 99.90,
          currency: 'BRL',
          localizedPrice: 'R$ 99,90'
        },
        {
          productId: PRODUCT_IDS.PREMIUM_LIFETIME,
          title: 'Premium Vitalício',
          description: 'Acesso premium para sempre',
          price: 'R$ 299,90',
          priceValue: 299.90,
          currency: 'BRL',
          localizedPrice: 'R$ 299,90'
        }
      ];

      this.products = mockProducts;
      return mockProducts;
    } catch (error) {
      console.error('Erro ao obter produtos:', error);
      return [];
    }
  }

  // Comprar produto
  async purchaseProduct(productId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Aqui você implementaria a compra real
      // Por enquanto, vamos simular
      
      console.log(`Iniciando compra do produto: ${productId}`);
      
      // Simular processo de compra
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular compra bem-sucedida
      const purchase = {
        productId,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        purchaseTime: Date.now(),
        isAcknowledged: false,
        purchaseToken: `PURCHASE_TOKEN_${Date.now()}`,
        orderId: `ORDER_${Date.now()}`,
        originalTransactionId: null,
        quantity: 1,
        developerPayload: null
      };

      // Salvar compra
      await this.savePurchase(purchase);
      
      return {
        success: true,
        purchase,
        message: 'Compra realizada com sucesso!'
      };
      
    } catch (error) {
      console.error('Erro na compra:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao processar compra'
      };
    }
  }

  // Restaurar compras
  async restorePurchases() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Aqui você implementaria a restauração real
      // Por enquanto, vamos simular
      
      console.log('Restaurando compras...');
      
      // Simular processo de restauração
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Buscar compras salvas
      const savedPurchases = await this.getSavedPurchases();
      
      if (savedPurchases.length > 0) {
        return {
          success: true,
          purchases: savedPurchases,
          message: `${savedPurchases.length} compra(s) restaurada(s)`
        };
      } else {
        return {
          success: false,
          message: 'Nenhuma compra encontrada para restaurar'
        };
      }
      
    } catch (error) {
      console.error('Erro ao restaurar compras:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao restaurar compras'
      };
    }
  }

  // Verificar se produto foi comprado
  async isProductPurchased(productId) {
    try {
      const purchases = await this.getSavedPurchases();
      return purchases.some(purchase => 
        purchase.productId === productId && 
        !this.isPurchaseExpired(purchase)
      );
    } catch (error) {
      console.error('Erro ao verificar produto comprado:', error);
      return false;
    }
  }

  // Verificar se compra expirou
  isPurchaseExpired(purchase) {
    try {
      // Para produtos vitalícios, nunca expiram
      if (purchase.productId === PRODUCT_IDS.PREMIUM_LIFETIME) {
        return false;
      }

      // Para assinaturas, verificar data de expiração
      const purchaseDate = new Date(purchase.purchaseTime);
      const now = new Date();
      
      if (purchase.productId === PRODUCT_IDS.PREMIUM_MONTHLY) {
        const expiryDate = new Date(purchaseDate.setMonth(purchaseDate.getMonth() + 1));
        return now > expiryDate;
      }
      
      if (purchase.productId === PRODUCT_IDS.PREMIUM_YEARLY) {
        const expiryDate = new Date(purchaseDate.setFullYear(purchaseDate.getFullYear() + 1));
        return now > expiryDate;
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar expiração:', error);
      return true; // Em caso de erro, considerar como expirado
    }
  }

  // Salvar compra
  async savePurchase(purchase) {
    try {
      const savedPurchases = await this.getSavedPurchases();
      const updatedPurchases = [...savedPurchases, purchase];
      
      await AsyncStorage.setItem('purchases', JSON.stringify(updatedPurchases));
      this.purchases = updatedPurchases;
      
      console.log('Compra salva:', purchase);
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
    }
  }

  // Obter compras salvas
  async getSavedPurchases() {
    try {
      const saved = await AsyncStorage.getItem('purchases');
      if (saved) {
        this.purchases = JSON.parse(saved);
        return this.purchases;
      }
      return [];
    } catch (error) {
      console.error('Erro ao obter compras salvas:', error);
      return [];
    }
  }

  // Limpar compras expiradas
  async cleanExpiredPurchases() {
    try {
      const purchases = await this.getSavedPurchases();
      const validPurchases = purchases.filter(purchase => !this.isPurchaseExpired(purchase));
      
      if (validPurchases.length !== purchases.length) {
        await AsyncStorage.setItem('purchases', JSON.stringify(validPurchases));
        this.purchases = validPurchases;
        console.log('Compras expiradas removidas');
      }
      
      return validPurchases;
    } catch (error) {
      console.error('Erro ao limpar compras expiradas:', error);
      return [];
    }
  }

  // Obter status da assinatura
  async getSubscriptionStatus() {
    try {
      const purchases = await this.getSavedPurchases();
      const activePurchase = purchases.find(purchase => !this.isPurchaseExpired(purchase));
      
      if (activePurchase) {
        return {
          isActive: true,
          productId: activePurchase.productId,
          purchaseTime: activePurchase.purchaseTime,
          expiryDate: this.calculateExpiryDate(activePurchase)
        };
      }
      
      return {
        isActive: false,
        productId: null,
        purchaseTime: null,
        expiryDate: null
      };
    } catch (error) {
      console.error('Erro ao obter status da assinatura:', error);
      return {
        isActive: false,
        productId: null,
        purchaseTime: null,
        expiryDate: null
      };
    }
  }

  // Calcular data de expiração
  calculateExpiryDate(purchase) {
    try {
      const purchaseDate = new Date(purchase.purchaseTime);
      
      if (purchase.productId === PRODUCT_IDS.PREMIUM_LIFETIME) {
        return new Date(purchaseDate.setFullYear(purchaseDate.getFullYear() + 100));
      }
      
      if (purchase.productId === PRODUCT_IDS.PREMIUM_MONTHLY) {
        return new Date(purchaseDate.setMonth(purchaseDate.getMonth() + 1));
      }
      
      if (purchase.productId === PRODUCT_IDS.PREMIUM_YEARLY) {
        return new Date(purchaseDate.setFullYear(purchaseDate.getFullYear() + 1));
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao calcular data de expiração:', error);
      return null;
    }
  }
}

export default new BillingService();

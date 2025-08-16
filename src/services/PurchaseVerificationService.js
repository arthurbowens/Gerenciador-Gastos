import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class PurchaseVerificationService {
  constructor() {
    this.verificationEndpoint = 'https://your-backend.com/verify-purchase';
    this.publicKey = 'YOUR_GOOGLE_PLAY_PUBLIC_KEY'; // Chave pública do Google Play
  }

  // Verificar se uma compra é válida
  async verifyPurchase(purchase) {
    try {
      if (Platform.OS !== 'android') {
        console.log('Verificação só está disponível no Android');
        return { isValid: false, reason: 'Platform not supported' };
      }

      // Verificações básicas
      if (!this.isValidPurchaseFormat(purchase)) {
        return { isValid: false, reason: 'Invalid purchase format' };
      }

      // Verificar se já foi processada
      if (await this.isPurchaseAlreadyProcessed(purchase)) {
        return { isValid: false, reason: 'Purchase already processed' };
      }

      // Verificar assinatura (implementação real)
      const signatureValid = await this.verifySignature(purchase);
      if (!signatureValid) {
        return { isValid: false, reason: 'Invalid signature' };
      }

      // Verificar com servidor backend (recomendado)
      const serverVerification = await this.verifyWithServer(purchase);
      if (!serverVerification.valid) {
        return { isValid: false, reason: serverVerification.reason };
      }

      // Marcar como processada
      await this.markPurchaseAsProcessed(purchase);

      return { 
        isValid: true, 
        purchase: purchase,
        verifiedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Erro na verificação da compra:', error);
      return { 
        isValid: false, 
        reason: 'Verification error',
        error: error.message 
      };
    }
  }

  // Verificar formato da compra
  isValidPurchaseFormat(purchase) {
    if (!purchase) return false;
    
    const requiredFields = [
      'productId', 
      'purchaseToken', 
      'orderId', 
      'purchaseTime'
    ];
    
    return requiredFields.every(field => 
      purchase[field] && typeof purchase[field] === 'string'
    );
  }

  // Verificar se compra já foi processada
  async isPurchaseAlreadyProcessed(purchase) {
    try {
      const processedPurchases = await AsyncStorage.getItem('processed_purchases');
      if (processedPurchases) {
        const purchases = JSON.parse(processedPurchases);
        return purchases.some(p => 
          p.purchaseToken === purchase.purchaseToken ||
          p.orderId === purchase.orderId
        );
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar compras processadas:', error);
      return false;
    }
  }

  // Verificar assinatura da compra
  async verifySignature(purchase) {
    try {
      // Aqui você implementaria a verificação real da assinatura
      // usando a chave pública do Google Play
      
      // Por enquanto, vamos simular
      console.log('Verificando assinatura da compra:', purchase.orderId);
      
      // Simular verificação
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simular assinatura válida (90% das vezes)
      return Math.random() > 0.1;
      
    } catch (error) {
      console.error('Erro na verificação da assinatura:', error);
      return false;
    }
  }

  // Verificar com servidor backend
  async verifyWithServer(purchase) {
    try {
      // Aqui você implementaria a verificação com seu servidor
      // Por enquanto, vamos simular
      
      console.log('Verificando compra com servidor:', purchase.orderId);
      
      // Simular resposta do servidor
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular verificação bem-sucedida (95% das vezes)
      if (Math.random() > 0.05) {
        return {
          valid: true,
          serverResponse: 'Purchase verified successfully'
        };
      } else {
        return {
          valid: false,
          reason: 'Server verification failed'
        };
      }
      
    } catch (error) {
      console.error('Erro na verificação com servidor:', error);
      return {
        valid: false,
        reason: 'Server error',
        error: error.message
      };
    }
  }

  // Marcar compra como processada
  async markPurchaseAsProcessed(purchase) {
    try {
      const processedPurchases = await AsyncStorage.getItem('processed_purchases');
      let purchases = [];
      
      if (processedPurchases) {
        purchases = JSON.parse(processedPurchases);
      }
      
      const processedPurchase = {
        ...purchase,
        processedAt: new Date().toISOString(),
        verificationStatus: 'verified'
      };
      
      purchases.push(processedPurchase);
      
      await AsyncStorage.setItem('processed_purchases', JSON.stringify(purchases));
      
      console.log('Compra marcada como processada:', purchase.orderId);
      
    } catch (error) {
      console.error('Erro ao marcar compra como processada:', error);
    }
  }

  // Verificar todas as compras pendentes
  async verifyPendingPurchases() {
    try {
      const pendingPurchases = await AsyncStorage.getItem('pending_purchases');
      if (!pendingPurchases) return [];
      
      const purchases = JSON.parse(pendingPurchases);
      const verificationResults = [];
      
      for (const purchase of purchases) {
        const result = await this.verifyPurchase(purchase);
        verificationResults.push({
          purchase,
          result
        });
        
        // Aguardar um pouco entre verificações
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Limpar compras pendentes verificadas
      await this.cleanPendingPurchases();
      
      return verificationResults;
      
    } catch (error) {
      console.error('Erro ao verificar compras pendentes:', error);
      return [];
    }
  }

  // Limpar compras pendentes
  async cleanPendingPurchases() {
    try {
      await AsyncStorage.removeItem('pending_purchases');
      console.log('Compras pendentes limpas');
    } catch (error) {
      console.error('Erro ao limpar compras pendentes:', error);
    }
  }

  // Adicionar compra pendente
  async addPendingPurchase(purchase) {
    try {
      const pendingPurchases = await AsyncStorage.getItem('pending_purchases');
      let purchases = [];
      
      if (pendingPurchases) {
        purchases = JSON.parse(pendingPurchases);
      }
      
      purchases.push(purchase);
      
      await AsyncStorage.setItem('pending_purchases', JSON.stringify(purchases));
      
      console.log('Compra adicionada como pendente:', purchase.orderId);
      
    } catch (error) {
      console.error('Erro ao adicionar compra pendente:', error);
    }
  }

  // Obter histórico de verificações
  async getVerificationHistory() {
    try {
      const processedPurchases = await AsyncStorage.getItem('processed_purchases');
      if (processedPurchases) {
        return JSON.parse(processedPurchases);
      }
      return [];
    } catch (error) {
      console.error('Erro ao obter histórico de verificações:', error);
      return [];
    }
  }

  // Verificar integridade das compras
  async verifyPurchaseIntegrity() {
    try {
      const allPurchases = await AsyncStorage.getItem('purchases');
      const processedPurchases = await AsyncStorage.getItem('processed_purchases');
      
      if (!allPurchases) return { valid: true, issues: [] };
      
      const purchases = JSON.parse(allPurchases);
      const processed = processedPurchases ? JSON.parse(processedPurchases) : [];
      
      const issues = [];
      
      // Verificar se há compras não verificadas
      for (const purchase of purchases) {
        const isProcessed = processed.some(p => 
          p.purchaseToken === purchase.purchaseToken ||
          p.orderId === purchase.orderId
        );
        
        if (!isProcessed) {
          issues.push({
            type: 'unverified_purchase',
            purchase,
            message: 'Purchase not verified'
          });
        }
      }
      
      // Verificar se há compras duplicadas
      const purchaseTokens = purchases.map(p => p.purchaseToken);
      const duplicateTokens = purchaseTokens.filter((token, index) => 
        purchaseTokens.indexOf(token) !== index
      );
      
      if (duplicateTokens.length > 0) {
        issues.push({
          type: 'duplicate_purchases',
          tokens: duplicateTokens,
          message: 'Duplicate purchase tokens found'
        });
      }
      
      return {
        valid: issues.length === 0,
        issues,
        totalPurchases: purchases.length,
        verifiedPurchases: processed.length
      };
      
    } catch (error) {
      console.error('Erro na verificação de integridade:', error);
      return {
        valid: false,
        issues: [{ type: 'error', message: error.message }]
      };
    }
  }

  // Limpar dados de verificação antigos
  async cleanupOldVerificationData() {
    try {
      const processedPurchases = await AsyncStorage.getItem('processed_purchases');
      if (!processedPurchases) return;
      
      const purchases = JSON.parse(processedPurchases);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentPurchases = purchases.filter(purchase => {
        const processedAt = new Date(purchase.processedAt);
        return processedAt > thirtyDaysAgo;
      });
      
      if (recentPurchases.length !== purchases.length) {
        await AsyncStorage.setItem('processed_purchases', JSON.stringify(recentPurchases));
        console.log('Dados de verificação antigos limpos');
      }
      
    } catch (error) {
      console.error('Erro ao limpar dados antigos:', error);
    }
  }
}

export default new PurchaseVerificationService();

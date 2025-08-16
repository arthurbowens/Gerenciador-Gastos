import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

class DataCleaningService {
  static async clearAllData() {
    try {
      // Lista de todas as chaves do AsyncStorage
      const allKeys = [
        // Dados financeiros
        'transactions',
        'categories',
        
        // Contas
        'accounts',
        'currentAccount',
        
        // Orçamento
        'budgets',
        'monthlyGoals',
        'budgetHistory',
        'goalAchievements',
        
        // Notificações
        'notificationSettings',
        
        // Assinatura
        'subscription_status',
        'current_plan',
        'has_active_subscription',
        'subscription_expiry',
        'purchase_history',
        
        // Outros dados
        'theme',
        'language',
        'currency',
        'exportSettings',
        'analyticsSettings',
        'recurringTransactions',
      ];

      // Limpar todas as chaves
      await AsyncStorage.multiRemove(allKeys);
      
      console.log('✅ Todos os dados foram limpos com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
      return false;
    }
  }

  static async clearSpecificData(dataType) {
    try {
      switch (dataType) {
        case 'transactions':
          await AsyncStorage.removeItem('transactions');
          break;
        case 'categories':
          await AsyncStorage.removeItem('categories');
          break;
        case 'budgets':
          await AsyncStorage.multiRemove(['budgets', 'monthlyGoals', 'budgetHistory', 'goalAchievements']);
          break;
        case 'accounts':
          await AsyncStorage.multiRemove(['accounts', 'currentAccount']);
          break;
        case 'notifications':
          await AsyncStorage.removeItem('notificationSettings');
          break;
        case 'subscription':
          await AsyncStorage.multiRemove(['subscription_status', 'current_plan', 'has_active_subscription', 'subscription_expiry', 'purchase_history']);
          break;
        default:
          throw new Error('Tipo de dados inválido');
      }
      
      console.log(`✅ Dados do tipo '${dataType}' foram limpos`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao limpar dados do tipo '${dataType}':`, error);
      return false;
    }
  }

  static async showClearDataConfirmation() {
    return new Promise((resolve) => {
      Alert.alert(
        'Limpar Todos os Dados',
        'Tem certeza que deseja excluir TODOS os dados do aplicativo? Esta ação não pode ser desfeita.',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          { 
            text: 'Limpar Tudo', 
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Confirmação Final',
                'Esta ação irá remover permanentemente todos os seus dados financeiros, contas, orçamentos e configurações. Tem certeza absoluta?',
                [
                  { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
                  { 
                    text: 'SIM, LIMPAR TUDO', 
                    style: 'destructive',
                    onPress: () => resolve(true)
                  },
                ]
              );
            }
          },
        ]
      );
    });
  }

  static async clearDataWithConfirmation() {
    const confirmed = await this.showClearDataConfirmation();
    
    if (confirmed) {
      const success = await this.clearAllData();
      
      if (success) {
        Alert.alert(
          'Dados Limpos',
          'Todos os dados foram removidos com sucesso. O aplicativo será reiniciado.',
          [{ text: 'OK' }]
        );
        
        // Forçar reinicialização do app
        setTimeout(() => {
          // Em um app real, você usaria um método para reiniciar
          // Por enquanto, apenas logamos
          console.log('🔄 App deve ser reiniciado manualmente');
        }, 1000);
      } else {
        Alert.alert(
          'Erro',
          'Ocorreu um erro ao limpar os dados. Tente novamente.',
          [{ text: 'OK' }]
        );
      }
      
      return success;
    }
    
    return false;
  }
}

export default DataCleaningService;

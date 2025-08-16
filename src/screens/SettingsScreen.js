import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Switch,
  Modal,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useAccounts } from '../contexts/AccountsContext';
import { useFinance } from '../contexts/FinanceContext';
import { useBudget } from '../contexts/BudgetContext';
import DataCleaningService from '../services/DataCleaningService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Title, List, Divider, Button, Portal } from 'react-native-paper';
import { APP_INFO } from '../constants/AppInfo';
import AdsStatsCard from '../components/AdsStatsCard';
import AdsSettingsCard from '../components/AdsSettingsCard';
import AdsTestPanel from '../components/AdsTestPanel';


export default function SettingsScreen({ navigation }) {
  const { transactions, categories } = useFinance();
  const { theme, isDarkMode, toggleDarkMode } = useTheme();
  const { t, currentLanguageName, currentLanguageFlag, languages, changeLanguage, currentLanguage, isLoading } = useLanguage();
  const { refreshAccountNames } = useAccounts();
  const { currentCurrency, changeCurrency, getCurrencyList, getCurrentCurrency } = useCurrency();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const appVersion = '1.0.0';
  const buildNumber = '1';

  const handleExportData = () => {
    Alert.alert(
      'Exportar Dados',
      'Esta funcionalidade permitirá exportar todas as suas transações e categorias em formato CSV.',
      [{ text: 'OK' }]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Importar Dados',
      'Esta funcionalidade permitirá importar transações de outros aplicativos financeiros.',
      [{ text: 'OK' }]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      'Backup dos Dados',
      'Seus dados são salvos automaticamente no dispositivo. Para backup na nuvem, esta funcionalidade será implementada em breve.',
      [{ text: 'OK' }]
    );
  };

  const handleClearData = async () => {
    try {
      const success = await DataCleaningService.clearDataWithConfirmation();
      
      if (success) {
        // Recarregar dados após limpeza
        // Os contextos devem recarregar automaticamente
        console.log('✅ Dados limpos com sucesso');
      }
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao limpar os dados. Tente novamente.');
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      t('settings.supportTitle'),
      t('settings.supportMessage'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        { 
          text: t('settings.sendEmail'), 
          onPress: () => {
            Linking.openURL('mailto:suporte@controlefinancas.com');
          }
        },
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      t('settings.rateAppTitle'),
      t('settings.rateAppMessage'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        { 
          text: t('settings.rate'), 
          onPress: () => {
            // Aqui você implementaria o link para a loja
            Alert.alert('Obrigado!', 'Sua avaliação é muito importante para nós!');
          }
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      t('settings.privacyPolicyTitle'),
      t('settings.privacyPolicyMessage'),
      [{ text: t('settings.ok') }]
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      t('settings.termsOfServiceTitle'),
      t('settings.termsOfServiceMessage'),
      [{ text: t('settings.ok') }]
    );
  };

  const handleLanguageSelect = async (languageCode) => {
    changeLanguage(languageCode);
    setLanguageModalVisible(false);
    
    // Atualizar nomes das contas padrão após mudança de idioma
    setTimeout(() => {
      refreshAccountNames();
    }, 100);
  };

  const getStatsSummary = () => {
    const totalTransactions = transactions.length;
    const totalCategories = categories.length;
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalTransactions,
      totalCategories,
      totalIncome,
      totalExpenses,
    };
  };

  const stats = getStatsSummary();

  // Aguardar carregamento dos contextos
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Estatísticas do App */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.statsTitle}>{t('settings.appStats')}</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="list" size={24} color="#1E3A8A" />
              <Text style={styles.statValue}>{stats.totalTransactions}</Text>
              <Text style={styles.statLabel}>{t('settings.totalTransactions')}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="grid" size={24} color="#1E3A8A" />
              <Text style={styles.statValue}>{stats.totalCategories}</Text>
              <Text style={styles.statLabel}>{t('settings.totalCategories')}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="arrow-up-circle" size={24} color="#10B981" />
              <Text style={styles.statValue}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(stats.totalIncome)}
              </Text>
              <Text style={styles.statLabel}>{t('settings.totalIncome')}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="arrow-down-circle" size={24} color="#EF4444" />
              <Text style={styles.statValue}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(stats.totalExpenses)}
              </Text>
              <Text style={styles.statLabel}>{t('settings.totalExpenses')}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Estatísticas de Anúncios */}
      <AdsStatsCard />

      {/* Configurações de Anúncios */}
      <AdsSettingsCard />

      {/* Painel de Teste (Apenas Desenvolvimento) */}
      <AdsTestPanel />

      {/* Configurações do App */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>{t('settings.appSettings')}</Title>
          
          <List.Item
            title={t('settings.notifications')}
            description={t('settings.notificationsDesc')}
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color="#1E3A8A"
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Modo Escuro"
            description={t('settings.darkModeDesc')}
            left={(props) => <List.Icon {...props} icon="moon-waning-crescent" />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title={t('settings.language')}
            description={`${currentLanguageFlag} ${currentLanguageName}`}
            left={(props) => <List.Icon {...props} icon="translate" />}
            onPress={() => setLanguageModalVisible(true)}
          />
          
          <Divider />
          
          <List.Item
            title={t('settings.currency')}
            description={`${getCurrentCurrency().flag} ${getCurrentCurrency().code} - ${getCurrentCurrency().name}`}
            left={(props) => <List.Icon {...props} icon="cash" />}
            onPress={() => setCurrencyModalVisible(true)}
          />
          
          <List.Item
            title={t('themes.customization')}
            description={t('themes.customizationDesc')}
            left={(props) => <List.Icon {...props} icon="palette-outline" />}
            onPress={() => navigation.navigate('ThemeCustomization')}
          />
          
          <Divider />
          
          <List.Item
            title={t('settings.autoBackup')}
            description={t('settings.autoBackupDesc')}
            left={(props) => <List.Icon {...props} icon="cloud-upload-outline" />}
            right={() => (
              <Switch
                value={autoBackupEnabled}
                onValueChange={setAutoBackupEnabled}
                color="#1E3A8A"
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Gerenciamento de Dados */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>{t('settings.dataManagement')}</Title>
          
          <List.Item
            title={t('settings.exportData')}
            description="Salvar dados em arquivo CSV"
            left={(props) => <List.Icon {...props} icon="download-outline" />}
            onPress={handleExportData}
          />
          
          <Divider />
          
          <List.Item
            title={t('settings.importData')}
            description="Carregar dados de outros apps"
            left={(props) => <List.Icon {...props} icon="upload-outline" />}
            onPress={handleImportData}
          />
          
          <Divider />
          
          <List.Item
            title={t('settings.backupData')}
            description="Fazer backup na nuvem"
            left={(props) => <List.Icon {...props} icon="cloud-outline" />}
            onPress={handleBackupData}
          />
          
          <Divider />
          
          <List.Item
            title={t('settings.clearData')}
            description="Remover todas as transações e categorias"
            left={(props) => <List.Icon {...props} icon="delete-outline" color="#EF4444" />}
            onPress={handleClearData}
            titleStyle={{ color: '#EF4444' }}
          />
        </Card.Content>
      </Card>

      {/* Suporte e Informações */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>{t('settings.supportInfo')}</Title>
          
          <List.Item
            title={t('settings.contactSupport')}
            description={t('settings.contactSupportDesc')}
            left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
            onPress={handleContactSupport}
          />
          
          <Divider />
          
          <List.Item
            title={t('settings.rateApp')}
            description={t('settings.rateAppDesc')}
            left={(props) => <List.Icon {...props} icon="star" />}
            onPress={handleRateApp}
          />
          
          <Divider />
          
          <List.Item
            title={t('settings.privacyPolicy')}
            description={t('settings.privacyPolicyDesc')}
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            onPress={handlePrivacyPolicy}
          />
          
          <Divider />
          
          <List.Item
            title={t('settings.termsOfService')}
            description={t('settings.termsOfServiceDesc')}
            left={(props) => <List.Icon {...props} icon="file-document-outline" />}
            onPress={handleTermsOfService}
          />
        </Card.Content>
      </Card>

      {/* Informações do App */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>{t('settings.aboutApp')}</Title>
          
          <View style={styles.appInfo}>
            <View style={styles.appIcon}>
              <Ionicons name="wallet" size={48} color="#1E3A8A" />
            </View>
            <View style={styles.appDetails}>
              <Text style={styles.appName}>{t('settings.appName')}</Text>
              <Text style={styles.appVersion}>{t('settings.version')} {APP_INFO.version} ({APP_INFO.buildNumber})</Text>
              <Text style={styles.appDescription}>
                {t('settings.appDescription')}
              </Text>
            </View>
          </View>
          
          <View style={styles.developerInfo}>
            <Text style={styles.developerText}>
              {t('settings.developerText')}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Modal de Seleção de Idioma */}
      <Portal>
        <Modal
          visible={languageModalVisible}
          onDismiss={() => setLanguageModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>{t('settings.language')}</Title>
              
              {Object.entries(languages).map(([code, language]) => (
                <TouchableOpacity
                  key={code}
                  style={styles.languageItem}
                  onPress={() => handleLanguageSelect(code)}
                >
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <Text style={styles.languageName}>{language.name}</Text>
                  {code === currentLanguage && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
              
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setLanguageModalVisible(false)}
                  style={styles.cancelButton}
                >
                  {t('common.cancel')}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>

        {/* Modal de Seleção de Moeda */}
        <Modal
          visible={currencyModalVisible}
          onDismiss={() => setCurrencyModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>{t('settings.currency')}</Title>
              
              {getCurrencyList().map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.languageOption,
                    currentCurrency === currency.code && styles.languageOptionSelected
                  ]}
                  onPress={() => {
                    changeCurrency(currency.code);
                    setCurrencyModalVisible(false);
                  }}
                >
                  <Text style={styles.languageFlag}>{currency.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>{currency.name}</Text>
                    <Text style={styles.languageCode}>{currency.code} - {currency.symbol}</Text>
                  </View>
                  {currentCurrency === currency.code && (
                    <Ionicons name="checkmark" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>
              ))}
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setCurrencyModalVisible(false)}
                  style={styles.cancelButton}
                >
                  {t('common.cancel')}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  appIcon: {
    marginRight: 16,
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  developerInfo: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  developerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1F2937',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  languageName: {
    fontSize: 16,
    flex: 1,
    color: '#374151',
    fontWeight: '500',
  },
  modalButtons: {
    marginTop: 24,
    alignItems: 'center',
  },
  cancelButton: {
    minWidth: 120,
    borderColor: '#6B7280',
  },
});

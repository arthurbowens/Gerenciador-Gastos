import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { 
  Card, 
  Title, 
  FAB, 
  Button, 
  TextInput, 
  Modal, 
  Portal,
  Chip,
  Switch,
  SegmentedButtons
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useRecurring } from '../contexts/RecurringContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useFinance } from '../contexts/FinanceContext';
import { useAccounts } from '../contexts/AccountsContext';

export default function RecurringScreen() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { 
    recurringTransactions, 
    addRecurringTransaction, 
    deleteRecurringTransaction,
    toggleRecurringTransaction,
    getFrequencyLabel,
    getMonthlyRecurringTotal
  } = useRecurring();
  const { categories } = useFinance();
  const { accounts, currentAccount } = useAccounts();
  const { formatCurrency } = useCurrency();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [frequency, setFrequency] = useState('monthly');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState(currentAccount?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const frequencies = [
    { value: 'daily', label: t('recurring.daily') },
    { value: 'weekly', label: t('recurring.weekly') },
    { value: 'monthly', label: t('recurring.monthly') },
    { value: 'yearly', label: t('recurring.yearly') },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getFilteredCategories = () => {
    return categories.filter(category => category.type === type);
  };

  const getCategoryIcon = (categoryName) => {
    const categoryMap = {
      [t('defaultCategories.food')]: 'restaurant',
      [t('defaultCategories.transport')]: 'car',
      [t('defaultCategories.housing')]: 'home',
      [t('defaultCategories.health')]: 'medical',
      [t('defaultCategories.education')]: 'school',
      [t('defaultCategories.entertainment')]: 'game-controller',
      [t('defaultCategories.salary')]: 'cash',
      [t('defaultCategories.freelance')]: 'briefcase',
      [t('defaultCategories.investments')]: 'trending-up',
    };
    return categoryMap[categoryName] || 'help-circle';
  };

  const getCategoryColor = (categoryName) => {
    const categoryMap = {
      [t('defaultCategories.food')]: '#FF6B6B',
      [t('defaultCategories.transport')]: '#4ECDC4',
      [t('defaultCategories.housing')]: '#45B7D1',
      [t('defaultCategories.health')]: '#96CEB4',
      [t('defaultCategories.education')]: '#FFEAA7',
      [t('defaultCategories.entertainment')]: '#DDA0DD',
      [t('defaultCategories.salary')]: '#98D8C8',
      [t('defaultCategories.freelance')]: '#F7DC6F',
      [t('defaultCategories.investments')]: '#BB8FCE',
    };
    return categoryMap[categoryName] || '#95A5A6';
  };

  const handleAddRecurring = async () => {
    if (!title.trim() || !amount || !categoryId) {
      Alert.alert(t('common.error'), t('recurring.fillAllFields'));
      return;
    }

    const amountValue = parseFloat(amount);
    if (amountValue <= 0) {
      Alert.alert(t('common.error'), t('recurring.invalidAmount'));
      return;
    }

    try {
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      const selectedAccount = accounts.find(acc => acc.id === accountId);
      
      await addRecurringTransaction({
        title: title.trim(),
        amount: amountValue,
        type,
        frequency,
        categoryId,
        categoryName: selectedCategory?.name || 'Outros',
        accountId,
        accountName: selectedAccount?.name || 'Principal',
        startDate: new Date(startDate).toISOString(),
      });
      
      // Limpar campos
      setTitle('');
      setAmount('');
      setCategoryId('');
      setModalVisible(false);
      
      Alert.alert(t('common.success'), t('recurring.recurringCreated'));
    } catch (error) {
      Alert.alert(t('common.error'), t('recurring.errorCreating'));
    }
  };

  const handleDeleteRecurring = (recurring) => {
    Alert.alert(
      t('recurring.deleteRecurring'),
      t('recurring.confirmDelete'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => deleteRecurringTransaction(recurring.id)
        },
      ]
    );
  };

  const renderRecurringCard = (recurring) => {
    const categoryColor = getCategoryColor(recurring.categoryName);
    const nextExecution = new Date(recurring.nextExecutionDate);
    const account = accounts.find(acc => acc.id === recurring.accountId);

    return (
      <Card key={recurring.id} style={styles.recurringCard}>
        <Card.Content>
          <View style={styles.recurringHeader}>
            <View style={styles.recurringLeft}>
              <View style={[styles.categoryIcon, { backgroundColor: categoryColor }]}>
                <Ionicons 
                  name={getCategoryIcon(recurring.categoryName)} 
                  size={20} 
                  color="white" 
                />
              </View>
              <View style={styles.recurringInfo}>
                <Title style={styles.recurringTitle}>{recurring.title}</Title>
                <Text style={styles.recurringCategory}>{recurring.categoryName}</Text>
                <Text style={styles.recurringAccount}>
                  {account?.name || recurring.accountName}
                </Text>
              </View>
            </View>
            
            <View style={styles.recurringRight}>
              <Text style={[
                styles.recurringAmount,
                recurring.type === 'income' ? styles.incomeText : styles.expenseText
              ]}>
                {recurring.type === 'income' ? '+' : '-'}{formatCurrency(recurring.amount)}
              </Text>
              
              <View style={styles.frequencyContainer}>
                <Chip 
                  style={styles.frequencyChip}
                  textStyle={{ 
                    fontSize: 12, 
                    fontWeight: '500',
                    textAlign: 'center' 
                  }}
                >
                  {getFrequencyLabel(recurring.frequency)}
                </Chip>
              </View>
            </View>
          </View>

          <View style={styles.recurringDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('recurring.nextExecution')}:</Text>
              <Text style={styles.detailValue}>{formatDate(recurring.nextExecutionDate)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('recurring.executionCount')}:</Text>
              <Text style={styles.detailValue}>{recurring.executionCount}</Text>
            </View>
          </View>

          <View style={styles.recurringActions}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                {recurring.isActive ? t('recurring.active') : t('recurring.inactive')}
              </Text>
              <Switch
                value={recurring.isActive}
                onValueChange={() => toggleRecurringTransaction(recurring.id)}
                color={theme.colors.primary}
              />
            </View>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteRecurring(recurring)}
            >
              <Ionicons name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderStatsCard = () => {
    const monthlyExpenses = getMonthlyRecurringTotal('expense');
    const monthlyIncome = getMonthlyRecurringTotal('income');
    const activeCount = recurringTransactions.filter(r => r.isActive).length;

    return (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.statsTitle}>{t('recurring.monthlyRecurring')}</Title>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('home.income')}</Text>
              <Text style={[styles.statValue, styles.incomeText]}>
                {formatCurrency(monthlyIncome)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('home.expenses')}</Text>
              <Text style={[styles.statValue, styles.expenseText]}>
                {formatCurrency(monthlyExpenses)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('recurring.active')}</Text>
              <Text style={styles.statValue}>{activeCount}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Estatísticas */}
        {renderStatsCard()}

        {/* Lista de recorrentes */}
        <View style={styles.listContainer}>
          <Title style={styles.sectionTitle}>{t('recurring.recurringTransactions')}</Title>
          
          {recurringTransactions.length > 0 ? (
            recurringTransactions.map(renderRecurringCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="repeat-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>{t('recurring.noRecurring')}</Text>
              <Text style={styles.emptyStateSubtext}>{t('recurring.createFirst')}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal para criar recorrente */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView style={styles.modalScroll}>
            <Card>
              <Card.Content>
                <Title style={styles.modalTitle}>{t('recurring.newRecurring')}</Title>
                
                {/* Tipo */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>{t('addTransaction.type')}</Text>
                  <SegmentedButtons
                    value={type}
                    onValueChange={setType}
                    buttons={[
                      {
                        value: 'expense',
                        label: t('addTransaction.expense'),
                        icon: 'arrow-down-circle',
                      },
                      {
                        value: 'income',
                        label: t('addTransaction.income'),
                        icon: 'arrow-up-circle',
                      },
                    ]}
                    style={styles.segmentedButtons}
                  />
                </View>

                {/* Título */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>{t('addTransaction.transactionTitle')}</Text>
                  <TextInput
                    mode="outlined"
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t('recurring.titlePlaceholder')}
                    style={styles.modalInput}
                  />
                </View>

                {/* Valor */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>{t('addTransaction.amount')}</Text>
                  <TextInput
                    mode="outlined"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0,00"
                    keyboardType="numeric"
                    style={styles.modalInput}
                    left={<TextInput.Affix text="R$ " />}
                  />
                </View>

                {/* Frequência */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>{t('recurring.frequency')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {frequencies.map((freq) => (
                      <Chip
                        key={freq.value}
                        selected={frequency === freq.value}
                        onPress={() => setFrequency(freq.value)}
                        style={styles.frequencyChip}
                      >
                        {freq.label}
                      </Chip>
                    ))}
                  </ScrollView>
                </View>

                {/* Categoria */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>{t('addTransaction.category')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {getFilteredCategories().map((category) => (
                      <Chip
                        key={category.id}
                        selected={categoryId === category.id}
                        onPress={() => setCategoryId(category.id)}
                        style={styles.categoryChip}
                      >
                        {category.name}
                      </Chip>
                    ))}
                  </ScrollView>
                </View>

                {/* Conta */}
                {accounts.length > 1 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>{t('accounts.account')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {accounts.map((account) => (
                        <Chip
                          key={account.id}
                          selected={accountId === account.id}
                          onPress={() => setAccountId(account.id)}
                          style={styles.accountChip}
                        >
                          {account.name}
                        </Chip>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => setModalVisible(false)}
                    style={styles.cancelButton}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleAddRecurring}
                    style={styles.confirmButton}
                  >
                    {t('recurring.createRecurring')}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
        label={t('recurring.newRecurring')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  incomeText: {
    color: '#10B981',
  },
  expenseText: {
    color: '#EF4444',
  },
  listContainer: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  recurringCard: {
    marginBottom: 12,
    elevation: 1,
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recurringLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recurringInfo: {
    flex: 1,
  },
  recurringTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  recurringCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  recurringAccount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  recurringRight: {
    alignItems: 'flex-end',
  },
  recurringAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  frequencyContainer: {
    alignItems: 'flex-end',
  },
  frequencyChip: {
    minHeight: 32,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  recurringDetails: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  recurringActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#374151',
    marginTop: 16,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalScroll: {
    maxHeight: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1F2937',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: 'white',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
    minHeight: 36,
    paddingHorizontal: 12,
  },
  accountChip: {
    marginRight: 8,
    marginBottom: 8,
    minHeight: 36,
    paddingHorizontal: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
  },
});

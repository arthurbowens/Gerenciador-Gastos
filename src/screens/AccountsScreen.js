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
  Divider
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAccounts } from '../contexts/AccountsContext';
import { useCurrency } from '../contexts/CurrencyContext';

export default function AccountsScreen() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { 
    accounts, 
    currentAccount, 
    addAccount, 
    deleteAccount, 
    switchAccount,
    transferBetweenAccounts,
    getTotalBalance 
  } = useAccounts();
  const { formatCurrency } = useCurrency();

  const [modalVisible, setModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('checking');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [transferAmount, setTransferAmount] = useState('');
  const [fromAccount, setFromAccount] = useState(null);
  const [toAccount, setToAccount] = useState(null);

  const accountTypes = [
    { value: 'checking', label: t('accounts.checkingAccount'), icon: 'card' },
    { value: 'savings', label: t('accounts.savings'), icon: 'trending-up' },
    { value: 'credit', label: t('accounts.creditCard'), icon: 'card-outline' },
    { value: 'investment', label: t('accounts.investment'), icon: 'analytics' },
    { value: 'cash', label: t('accounts.cash'), icon: 'wallet' },
  ];

  const colors = [
    '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ];

  const getAccountIcon = (type) => {
    return accountTypes.find(t => t.value === type)?.icon || 'wallet';
  };

  const handleAddAccount = async () => {
    if (!accountName.trim()) {
      Alert.alert(t('common.error'), t('accounts.nameRequired'));
      return;
    }

    try {
      const selectedType = accountTypes.find(t => t.value === accountType);
      await addAccount({
        name: accountName.trim(),
        type: accountType,
        icon: selectedType?.icon || 'wallet',
        color: selectedColor,
      });
      
      setAccountName('');
      setAccountType('checking');
      setSelectedColor('#3B82F6');
      setModalVisible(false);
      
      Alert.alert(t('common.success'), t('accounts.accountCreated'));
    } catch (error) {
      Alert.alert(t('common.error'), t('accounts.errorCreating'));
    }
  };

  const handleDeleteAccount = (account) => {
    if (account.isDefault) {
      Alert.alert(t('common.error'), t('accounts.cannotDeleteDefault'));
      return;
    }

    Alert.alert(
      t('accounts.deleteAccount'),
      t('accounts.confirmDelete'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => deleteAccount(account.id)
        },
      ]
    );
  };

  const handleTransfer = async () => {
    if (!fromAccount || !toAccount || !transferAmount) {
      Alert.alert(t('common.error'), t('accounts.fillTransferFields'));
      return;
    }

    if (fromAccount.id === toAccount.id) {
      Alert.alert(t('common.error'), t('accounts.sameAccountError'));
      return;
    }

    const amount = parseFloat(transferAmount);
    if (amount <= 0) {
      Alert.alert(t('common.error'), t('accounts.invalidAmount'));
      return;
    }

    try {
      await transferBetweenAccounts(fromAccount.id, toAccount.id, amount);
      
      setTransferAmount('');
      setFromAccount(null);
      setToAccount(null);
      setTransferModalVisible(false);
      
      Alert.alert(t('common.success'), t('accounts.transferCompleted'));
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    }
  };

  const renderAccountCard = (account) => {
    const isActive = currentAccount?.id === account.id;
    const balanceColor = account.type === 'credit' 
      ? (account.balance > 0 ? '#EF4444' : '#10B981')
      : (account.balance >= 0 ? '#10B981' : '#EF4444');

    return (
      <TouchableOpacity
        key={account.id}
        onPress={() => switchAccount(account.id)}
        style={[
          styles.accountCard,
          isActive && { borderColor: theme.colors.primary, borderWidth: 2 }
        ]}
      >
        <Card style={[styles.card, { backgroundColor: account.color }]}>
          <Card.Content>
            <View style={styles.accountHeader}>
              <View style={styles.accountIcon}>
                <Ionicons 
                  name={getAccountIcon(account.type)} 
                  size={24} 
                  color="white" 
                />
              </View>
              
              {!account.isDefault && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAccount(account)}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>

            <Title style={styles.accountName}>{account.name}</Title>
            <Text style={styles.accountType}>
              {accountTypes.find(t => t.value === account.type)?.label}
            </Text>
            
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>
                {account.type === 'credit' ? t('accounts.limit') : t('accounts.balance')}
              </Text>
              <Text style={[styles.balanceValue, { color: 'white' }]}>
                {account.type === 'credit' && account.balance > 0 && '-'}
                {formatCurrency(account.balance)}
              </Text>
            </View>

            {isActive && (
              <Chip 
                style={styles.activeChip}
                textStyle={{ color: account.color, fontSize: 12 }}
              >
                {t('accounts.active')}
              </Chip>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Resumo total */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.summaryTitle}>{t('accounts.totalBalance')}</Title>
            <Text style={styles.summaryValue}>{formatCurrency(getTotalBalance())}</Text>
            <Text style={styles.summarySubtext}>
              {accounts.length} {t('accounts.accounts')}
            </Text>
          </Card.Content>
        </Card>

        {/* Botão de transferência */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={() => setTransferModalVisible(true)}
              style={styles.transferButton}
              icon="swap-horizontal"
            >
              {t('accounts.transfer')}
            </Button>
          </Card.Content>
        </Card>

        {/* Lista de contas */}
        <View style={styles.accountsContainer}>
          <Title style={styles.sectionTitle}>{t('accounts.myAccounts')}</Title>
          {accounts.map(renderAccountCard)}
        </View>
      </ScrollView>

      {/* Modal para criar conta */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>{t('accounts.newAccount')}</Title>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('accounts.accountName')}</Text>
                <TextInput
                  mode="outlined"
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder={t('accounts.accountNamePlaceholder')}
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('accounts.accountType')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {accountTypes.map((type) => (
                    <Chip
                      key={type.value}
                      selected={accountType === type.value}
                      onPress={() => setAccountType(type.value)}
                      style={styles.typeChip}
                      icon={type.icon}
                    >
                      {type.label}
                    </Chip>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('accounts.color')}</Text>
                <View style={styles.colorPicker}>
                  {colors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.selectedColor
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <Ionicons name="checkmark" size={20} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

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
                  onPress={handleAddAccount}
                  style={styles.confirmButton}
                >
                  {t('accounts.createAccount')}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Modal de transferência */}
      <Portal>
        <Modal
          visible={transferModalVisible}
          onDismiss={() => setTransferModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>{t('accounts.transfer')}</Title>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('accounts.fromAccount')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {accounts.map((account) => (
                    <Chip
                      key={account.id}
                      selected={fromAccount?.id === account.id}
                      onPress={() => setFromAccount(account)}
                      style={styles.accountChip}
                    >
                      {account.name}
                    </Chip>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('accounts.toAccount')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {accounts.map((account) => (
                    <Chip
                      key={account.id}
                      selected={toAccount?.id === account.id}
                      onPress={() => setToAccount(account)}
                      style={styles.accountChip}
                    >
                      {account.name}
                    </Chip>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('accounts.amount')}</Text>
                <TextInput
                  mode="outlined"
                  value={transferAmount}
                  onChangeText={setTransferAmount}
                  placeholder="0,00"
                  keyboardType="numeric"
                  style={styles.modalInput}
                  left={<TextInput.Affix text="R$ " />}
                />
              </View>

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setTransferModalVisible(false)}
                  style={styles.cancelButton}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleTransfer}
                  style={styles.confirmButton}
                >
                  {t('accounts.transfer')}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
        label={t('accounts.newAccount')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginVertical: 8,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 1,
  },
  transferButton: {
    marginVertical: 8,
  },
  accountsContainer: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  accountCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  card: {
    elevation: 2,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    padding: 4,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  balanceContainer: {
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  activeChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
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
    maxHeight: '80%',
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
  typeChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  accountChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#1F2937',
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

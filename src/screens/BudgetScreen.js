import React, { useState, useEffect } from 'react';
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
  ProgressBar,
  Chip,
  Divider
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useBudget } from '../contexts/BudgetContext';
import { useFinance } from '../contexts/FinanceContext';
import { useCurrency } from '../contexts/CurrencyContext';

export default function BudgetScreen() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { 
    getAllCurrentBudgets, 
    setBudgetForCategory,
    updateBudget,
    getBudgetStatus, 
    deleteBudget,
    setMonthlyGoal,
    getMonthlyGoal 
  } = useBudget();
  const { categories, getMonthlyStats } = useFinance();
  const { formatCurrency } = useCurrency();

  const [modalVisible, setModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [editingBudget, setEditingBudget] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savingsGoal, setSavingsGoal] = useState(getMonthlyGoal('savings').toString());
  const [expenseGoal, setExpenseGoal] = useState(getMonthlyGoal('maxExpenses').toString());

  const monthlyStats = getMonthlyStats();
  const currentBudgets = getAllCurrentBudgets();

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#10B981';
      case 'caution': return '#F59E0B';
      case 'warning': return '#EF4444';
      case 'exceeded': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'good': return t('budget.statusGood');
      case 'caution': return t('budget.statusCaution');
      case 'warning': return t('budget.statusWarning');
      case 'exceeded': return t('budget.statusExceeded');
      default: return t('budget.statusNone');
    }
  };

  const handleSetBudget = async () => {
    if (!selectedCategory || !budgetAmount) {
      Alert.alert(t('common.error'), t('budget.fillAllFields'));
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (amount <= 0) {
      Alert.alert(t('common.error'), t('budget.invalidAmount'));
      return;
    }

    try {
      if (isEditing && editingBudget) {
        // Usar updateBudget para lidar com mudança de categoria
        await updateBudget(
          editingBudget.id,
          selectedCategory.id,
          selectedCategory.name,
          amount,
          selectedCategory.type
        );
      } else {
        // Criar novo orçamento
        await setBudgetForCategory(
          selectedCategory.id,
          selectedCategory.name,
          amount,
          selectedCategory.type
        );
      }
      
      setBudgetAmount('');
      setSelectedCategory(null);
      setModalVisible(false);
      setIsEditing(false);
      setEditingBudget(null);
      
      const successMessage = isEditing ? t('budget.budgetUpdated') : t('budget.budgetSet');
      Alert.alert(t('common.success'), successMessage);
    } catch (error) {
      Alert.alert(t('common.error'), t('budget.errorSetting'));
    }
  };

  const handleDeleteBudget = (budget) => {
    Alert.alert(
      t('budget.deleteBudget'),
      t('budget.confirmDelete'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => deleteBudget(budget.id)
        },
      ]
    );
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setIsEditing(true);
    setSelectedCategory({ id: budget.categoryId, name: budget.categoryName, type: budget.type });
    setBudgetAmount(budget.limit.toString());
    setModalVisible(true);
  };

  const handleSetGoals = async () => {
    try {
      if (savingsGoal) {
        await setMonthlyGoal('savings', parseFloat(savingsGoal));
      }
      if (expenseGoal) {
        await setMonthlyGoal('maxExpenses', parseFloat(expenseGoal));
      }
      
      setGoalModalVisible(false);
      Alert.alert(t('common.success'), t('budget.goalsSet'));
    } catch (error) {
      Alert.alert(t('common.error'), t('budget.errorSettingGoals'));
    }
  };

  const renderBudgetCard = (budget) => {
    const { status, percentage } = getBudgetStatus(budget);
    const statusColor = getStatusColor(status);

    return (
      <Card key={budget.id} style={styles.budgetCard}>
        <Card.Content>
          <View style={styles.budgetHeader}>
            <View style={styles.budgetInfo}>
              <Title style={styles.categoryName}>{budget.categoryName}</Title>
              <Text style={styles.budgetType}>
                {budget.type === 'income' ? t('home.income') : t('home.expenses')}
              </Text>
            </View>
            
            <View style={styles.budgetActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditBudget(budget)}
              >
                <Ionicons name="pencil" size={20} color="#3B82F6" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteBudget(budget)}
              >
                <Ionicons name="trash" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressLabels}>
              <Text style={styles.spentText}>
                {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
              </Text>
              <Chip 
                style={[styles.statusChip, { backgroundColor: statusColor }]}
                textStyle={styles.statusChipText}
              >
                {Math.round(percentage)}%
              </Chip>
            </View>
            
            <ProgressBar 
              progress={percentage / 100}
              color={statusColor}
              style={styles.progressBar}
            />
            
            <View style={[styles.statusContainer, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>
                {getStatusText(status)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderGoalsCard = () => {
    const currentSavingsGoal = getMonthlyGoal('savings');
    const currentExpenseGoal = getMonthlyGoal('maxExpenses');
    
    const savingsProgress = currentSavingsGoal > 0 ? (monthlyStats.balance / currentSavingsGoal) * 100 : 0;
    const expenseProgress = currentExpenseGoal > 0 ? (monthlyStats.expenses / currentExpenseGoal) * 100 : 0;

    return (
      <Card style={styles.goalsCard}>
        <Card.Content>
          <View style={styles.goalsHeader}>
            <Title style={styles.goalsTitle}>{t('budget.monthlyGoals')}</Title>
            <TouchableOpacity
              style={styles.editGoalsButton}
              onPress={() => setGoalModalVisible(true)}
            >
              <Ionicons name="settings" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {currentSavingsGoal > 0 && (
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>{t('budget.savingsGoal')}</Text>
              <Text style={styles.goalValue}>
                {formatCurrency(monthlyStats.balance)} / {formatCurrency(currentSavingsGoal)}
              </Text>
              <ProgressBar 
                progress={Math.min(savingsProgress / 100, 1)}
                color={savingsProgress >= 100 ? '#10B981' : '#3B82F6'}
                style={styles.goalProgress}
              />
              <Text style={styles.goalPercentage}>{Math.round(savingsProgress)}%</Text>
            </View>
          )}

          {currentExpenseGoal > 0 && (
            <>
              <Divider style={styles.goalDivider} />
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>{t('budget.expenseLimit')}</Text>
                <Text style={styles.goalValue}>
                  {formatCurrency(monthlyStats.expenses)} / {formatCurrency(currentExpenseGoal)}
                </Text>
                <ProgressBar 
                  progress={Math.min(expenseProgress / 100, 1)}
                  color={expenseProgress >= 100 ? '#EF4444' : '#10B981'}
                  style={styles.goalProgress}
                />
                <Text style={styles.goalPercentage}>{Math.round(expenseProgress)}%</Text>
              </View>
            </>
          )}

          {currentSavingsGoal === 0 && currentExpenseGoal === 0 && (
            <View style={styles.noGoalsContainer}>
              <Text style={styles.noGoalsText}>{t('budget.noGoalsSet')}</Text>
              <Button
                mode="outlined"
                onPress={() => setGoalModalVisible(true)}
                style={styles.setGoalsButton}
              >
                {t('budget.setGoals')}
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Metas mensais */}
        {renderGoalsCard()}

        {/* Orçamentos por categoria */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>{t('budget.categoryBudgets')}</Title>
            
            {currentBudgets.length > 0 ? (
              currentBudgets.map(renderBudgetCard)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="wallet-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>{t('budget.noBudgets')}</Text>
                <Text style={styles.emptyStateSubtext}>{t('budget.createFirst')}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal para criar orçamento */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setIsEditing(false);
            setEditingBudget(null);
            setBudgetAmount('');
            setSelectedCategory(null);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>
                {isEditing ? t('budget.editBudget') : t('budget.setBudget')}
              </Title>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('addTransaction.category')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {categories.map((category) => (
                    <Chip
                      key={category.id}
                      selected={selectedCategory?.id === category.id}
                      onPress={() => setSelectedCategory(category)}
                      style={styles.categoryChip}
                    >
                      {category.name}
                    </Chip>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('budget.budgetLimit')}</Text>
                <TextInput
                  mode="outlined"
                  value={budgetAmount}
                  onChangeText={setBudgetAmount}
                  placeholder="0,00"
                  keyboardType="numeric"
                  style={styles.modalInput}
                  left={<TextInput.Affix text="R$ " />}
                />
              </View>

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setModalVisible(false);
                    setIsEditing(false);
                    setEditingBudget(null);
                    setBudgetAmount('');
                    setSelectedCategory(null);
                  }}
                  style={styles.cancelButton}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSetBudget}
                  style={styles.confirmButton}
                >
                  {isEditing ? t('budget.updateBudget') : t('budget.setBudget')}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Modal para metas mensais */}
      <Portal>
        <Modal
          visible={goalModalVisible}
          onDismiss={() => setGoalModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>{t('budget.setMonthlyGoals')}</Title>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('budget.savingsGoal')}</Text>
                <TextInput
                  mode="outlined"
                  value={savingsGoal}
                  onChangeText={setSavingsGoal}
                  placeholder="0,00"
                  keyboardType="numeric"
                  style={styles.modalInput}
                  left={<TextInput.Affix text="R$ " />}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('budget.expenseLimit')}</Text>
                <TextInput
                  mode="outlined"
                  value={expenseGoal}
                  onChangeText={setExpenseGoal}
                  placeholder="0,00"
                  keyboardType="numeric"
                  style={styles.modalInput}
                  left={<TextInput.Affix text="R$ " />}
                />
              </View>

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setGoalModalVisible(false)}
                  style={styles.cancelButton}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSetGoals}
                  style={styles.confirmButton}
                >
                  {t('common.save')}
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
        label={t('budget.newBudget')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  goalsCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  editGoalsButton: {
    padding: 8,
  },
  goalItem: {
    marginVertical: 8,
  },
  goalLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  goalProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  goalPercentage: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  goalDivider: {
    marginVertical: 12,
  },
  noGoalsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noGoalsText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  setGoalsButton: {
    borderColor: '#6B7280',
  },
  sectionCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  budgetCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  budgetInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  budgetType: {
    fontSize: 12,
    color: '#6B7280',
  },
  budgetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  progressContainer: {
    marginTop: 12,
    paddingBottom: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spentText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  statusChip: {
    height: 36,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusChipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textTransform: 'uppercase',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 32,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
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
    maxHeight: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  categoryScroll: {
    maxHeight: 50,
  },
  categoryChip: {
    marginRight: 8,
  },
  modalInput: {
    backgroundColor: 'white',
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

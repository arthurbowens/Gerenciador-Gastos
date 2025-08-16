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
    getMonthlyGoal,
    getCurrentMonthGoals,
    copyPreviousMonthGoals,
    getGoalsHistory,
    getGoalsStats,
    clearCurrentMonthGoals,
    isLoading: budgetLoading
  } = useBudget();
  const { categories, getMonthlyStats } = useFinance();
  const { formatCurrency } = useCurrency();

  const [modalVisible, setModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [editingBudget, setEditingBudget] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savingsGoal, setSavingsGoal] = useState('');
  const [expenseGoal, setExpenseGoal] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showGoalsHistory, setShowGoalsHistory] = useState(false);
  const [showGoalsStats, setShowGoalsStats] = useState(false);

  const monthlyStats = getMonthlyStats(new Date().getFullYear(), new Date().getMonth());
  const currentBudgets = getAllCurrentBudgets();
  const currentGoals = getCurrentMonthGoals();

  // Carregar metas atuais apenas uma vez quando o componente montar
  useEffect(() => {
    if (!budgetLoading && !isInitialized) {
      const currentSavings = getMonthlyGoal('savings');
      const currentExpense = getMonthlyGoal('maxExpenses');
      
      setSavingsGoal(currentSavings > 0 ? currentSavings.toString() : '');
      setExpenseGoal(currentExpense > 0 ? currentExpense.toString() : '');
      setIsInitialized(true);
    }
  }, [budgetLoading, isInitialized]);

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
        await updateBudget(
          editingBudget.id,
          selectedCategory.id,
          selectedCategory.name,
          amount,
          selectedCategory.type
        );
      } else {
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
      let success = true;
      const errors = [];
      
      // Validar meta de economia
      if (savingsGoal.trim() !== '') {
        const savingsValue = parseFloat(savingsGoal.replace(',', '.'));
        if (isNaN(savingsValue) || savingsValue <= 0) {
          errors.push('Meta de economia deve ser um valor válido maior que zero');
        } else if (savingsValue > 1000000) {
          errors.push('Meta de economia não pode ser maior que R$ 1.000.000');
        }
      }
      
      // Validar limite de gastos
      if (expenseGoal.trim() !== '') {
        const expenseValue = parseFloat(expenseGoal.replace(',', '.'));
        if (isNaN(expenseValue) || expenseValue <= 0) {
          errors.push('Limite de gastos deve ser um valor válido maior que zero');
        } else if (expenseValue > 1000000) {
          errors.push('Limite de gastos não pode ser maior que R$ 1.000.000');
        }
      }
      
      // Se há erros de validação, mostrar todos de uma vez
      if (errors.length > 0) {
        Alert.alert(
          t('common.validationError'),
          errors.join('\n\n'),
          [{ text: t('common.ok'), style: 'default' }]
        );
        return;
      }
      
      // Processar meta de economia
      if (savingsGoal.trim() !== '') {
        const savingsValue = parseFloat(savingsGoal.replace(',', '.'));
        success = await setMonthlyGoal('savings', savingsValue);
        if (!success) {
          Alert.alert(t('common.error'), 'Erro ao salvar meta de economia');
          return;
        }
      } else {
        // Se o campo estiver vazio, definir como 0 (sem meta)
        success = await setMonthlyGoal('savings', 0);
      }
      
      // Processar limite de gastos
      if (expenseGoal.trim() !== '') {
        const expenseValue = parseFloat(expenseGoal.replace(',', '.'));
        success = await setMonthlyGoal('maxExpenses', expenseValue);
        if (!success) {
          Alert.alert(t('common.error'), 'Erro ao salvar limite de gastos');
          return;
        }
      } else {
        // Se o campo estiver vazio, definir como 0 (sem meta)
        success = await setMonthlyGoal('maxExpenses', 0);
      }
      
      if (success) {
        setGoalModalVisible(false);
        Alert.alert(
          t('common.success'),
          'Metas mensais definidas com sucesso!',
          [{ text: t('common.ok'), style: 'default' }]
        );
        // Recarregar as metas após salvar
        setIsInitialized(false);
      }
    } catch (error) {
      console.error('Erro ao definir metas:', error);
      Alert.alert(
        t('common.error'),
        'Erro inesperado ao salvar metas. Tente novamente.',
        [{ text: t('common.ok'), style: 'default' }]
      );
    }
  };

  const handleCopyPreviousMonthGoals = async () => {
    try {
      const success = await copyPreviousMonthGoals();
      if (success) {
        Alert.alert(
          t('common.success'),
          'Metas copiadas do mês anterior com sucesso!',
          [{ text: t('common.ok'), style: 'default' }]
        );
        setIsInitialized(false);
      } else {
        Alert.alert(
          t('common.info'),
          'Não há metas do mês anterior para copiar',
          [{ text: t('common.ok'), style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Erro ao copiar metas:', error);
      Alert.alert(
        t('common.error'),
        'Erro ao copiar metas do mês anterior',
        [{ text: t('common.ok'), style: 'default' }]
      );
    }
  };

  const handleClearCurrentGoals = () => {
    Alert.alert(
      'Limpar Metas',
      'Tem certeza que deseja limpar todas as metas do mês atual?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await clearCurrentMonthGoals();
              if (success) {
                Alert.alert(
                  t('common.success'),
                  'Metas do mês atual foram limpas',
                  [{ text: t('common.ok'), style: 'default' }]
                );
                setIsInitialized(false);
              }
            } catch (error) {
              Alert.alert(
                t('common.error'),
                'Erro ao limpar metas',
                [{ text: t('common.ok'), style: 'default' }]
              );
            }
          }
        },
      ]
    );
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
            <View style={styles.goalsActions}>
              <TouchableOpacity
                style={styles.goalsActionButton}
                onPress={() => setShowGoalsStats(true)}
              >
                <Ionicons name="bar-chart" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.goalsActionButton}
                onPress={() => setShowGoalsHistory(true)}
              >
                <Ionicons name="calendar" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.goalsActionButton}
                onPress={handleCopyPreviousMonthGoals}
              >
                <Ionicons name="copy" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.goalsActionButton}
                onPress={handleClearCurrentGoals}
              >
                <Ionicons name="trash" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editGoalsButton}
                onPress={() => setGoalModalVisible(true)}
              >
                <Ionicons name="settings" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Meta de Economia */}
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

          {/* Separador entre metas se ambas existirem */}
          {currentSavingsGoal > 0 && currentExpenseGoal > 0 && (
            <Divider style={styles.goalDivider} />
          )}

          {/* Limite de Gastos */}
          {currentExpenseGoal > 0 && (
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
          )}

          {/* Estado vazio quando não há metas */}
          {currentSavingsGoal === 0 && currentExpenseGoal === 0 && (
            <View style={styles.noGoalsContainer}>
              <Ionicons name="flag-outline" size={48} color="#9CA3AF" />
              <Text style={styles.noGoalsText}>{t('budget.noGoalsSet')}</Text>
              <Text style={styles.noGoalsSubtext}>{t('budget.setGoalsDescription')}</Text>
              <Button
                mode="contained"
                onPress={() => setGoalModalVisible(true)}
                style={styles.setGoalsButton}
                icon="plus"
              >
                {t('budget.setGoals')}
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  // Mostrar loading se necessário
  if (budgetLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Carregando orçamentos...</Text>
      </View>
    );
  }

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
              <View style={styles.modalHeader}>
                <Ionicons name="flag" size={24} color={theme.colors.primary} />
                <Title style={styles.modalTitle}>{t('budget.setMonthlyGoals')}</Title>
              </View>
              
              <Text style={styles.modalDescription}>
                Defina suas metas financeiras para este mês. Deixe em branco para não definir uma meta específica.
              </Text>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('budget.savingsGoal')}</Text>
                <Text style={styles.modalSubtext}>
                  Meta de economia mensal (opcional)
                </Text>
                <TextInput
                  mode="outlined"
                  value={savingsGoal}
                  onChangeText={(text) => {
                    const cleanedText = text.replace(/[^0-9,.]/g, '');
                    setSavingsGoal(cleanedText);
                  }}
                  placeholder="0,00"
                  keyboardType="numeric"
                  style={styles.modalInput}
                  left={<TextInput.Affix text="R$ " />}
                  right={
                    savingsGoal.trim() !== '' && (
                      <TextInput.Affix text="💰" />
                    )
                  }
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('budget.expenseLimit')}</Text>
                <Text style={styles.modalSubtext}>
                  Limite máximo de gastos mensais (opcional)
                </Text>
                <TextInput
                  mode="outlined"
                  value={expenseGoal}
                  onChangeText={(text) => {
                    const cleanedText = text.replace(/[^0-9,.]/g, '');
                    setExpenseGoal(cleanedText);
                  }}
                  placeholder="0,00"
                  keyboardType="numeric"
                  style={styles.modalInput}
                  left={<TextInput.Affix text="R$ " />}
                  right={
                    expenseGoal.trim() !== '' && (
                      <TextInput.Affix text="📊" />
                    )
                  }
                />
              </View>

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setGoalModalVisible(false)}
                  style={styles.cancelButton}
                  icon="close"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSetGoals}
                  style={styles.confirmButton}
                  disabled={!savingsGoal.trim() && !expenseGoal.trim()}
                  icon="check"
                  loading={budgetLoading}
                >
                  {t('common.save')}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Modal para estatísticas das metas */}
      <Portal>
        <Modal
          visible={showGoalsStats}
          onDismiss={() => setShowGoalsStats(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>{t('budget.goalsStats')}</Title>
              
              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>{t('budget.currentMonth')}:</Text>
                  <Text style={styles.statValue}>{getGoalsStats().currentMonth}</Text>
                </View>
                
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>{t('budget.daysRemaining')}:</Text>
                  <Text style={styles.statValue}>{getGoalsStats().daysRemaining} dias</Text>
                </View>
                
                <Divider style={styles.modalDivider} />
                
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>{t('budget.monthlyIncome')}:</Text>
                  <Text style={[styles.statValue, { color: '#10B981' }]}>
                    {formatCurrency(getGoalsStats().monthlyIncome)}
                  </Text>
                </View>
                
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>{t('budget.monthlyExpenses')}:</Text>
                  <Text style={[styles.statValue, { color: '#EF4444' }]}>
                    {formatCurrency(getGoalsStats().monthlyExpenses)}
                  </Text>
                </View>
                
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>{t('budget.currentBalance')}:</Text>
                  <Text style={[styles.statValue, { 
                    color: getGoalsStats().monthlyBalance >= 0 ? '#10B981' : '#EF4444',
                    fontWeight: 'bold'
                  }]}>
                    {formatCurrency(getGoalsStats().monthlyBalance)}
                  </Text>
                </View>
                
                <Divider style={styles.modalDivider} />
                
                {getGoalsStats().savingsGoal > 0 && (
                  <View style={styles.goalStatRow}>
                    <Text style={styles.statLabel}>{t('budget.savingsGoal')}:</Text>
                    <Text style={styles.statValue}>{formatCurrency(getGoalsStats().savingsGoal)}</Text>
                    <View style={styles.progressContainer}>
                      <ProgressBar 
                        progress={getGoalsStats().savingsProgress / 100}
                        color={getGoalsStats().isSavingsGoalMet ? '#10B981' : '#3B82F6'}
                        style={styles.goalProgress}
                      />
                      <Text style={styles.progressText}>{getGoalsStats().savingsProgress}%</Text>
                    </View>
                    {getGoalsStats().isSavingsGoalMet && (
                      <Text style={[styles.achievementText, { color: '#10B981' }]}>
                        🎉 {t('budget.goalAchieved')}
                      </Text>
                    )}
                  </View>
                )}
                
                {getGoalsStats().expenseGoal > 0 && (
                  <View style={styles.goalStatRow}>
                    <Text style={styles.statLabel}>{t('budget.expenseLimit')}:</Text>
                    <Text style={styles.statValue}>{formatCurrency(getGoalsStats().expenseGoal)}</Text>
                    <View style={styles.progressContainer}>
                      <ProgressBar 
                        progress={getGoalsStats().expenseProgress / 100}
                        color={getGoalsStats().isExpenseGoalExceeded ? '#EF4444' : '#10B981'}
                        style={styles.goalProgress}
                      />
                      <Text style={styles.progressText}>{getGoalsStats().expenseProgress}%</Text>
                    </View>
                    {getGoalsStats().isExpenseGoalExceeded && (
                      <Text style={[styles.achievementText, { color: '#EF4444' }]}>
                        ⚠️ {t('budget.limitExceeded')}
                      </Text>
                    )}
                  </View>
                )}
              </View>
              
              <View style={styles.modalButtons}>
                <Button
                  mode="contained"
                  onPress={() => setShowGoalsStats(false)}
                  style={styles.confirmButton}
                >
                  Fechar
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Modal para histórico de metas */}
      <Portal>
        <Modal
          visible={showGoalsHistory}
          onDismiss={() => setShowGoalsHistory(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>{t('budget.goalsHistory')}</Title>
              
              <ScrollView style={styles.historyContainer}>
                {getGoalsHistory().map((monthData, index) => (
                  <View key={monthData.month} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyMonth}>{monthData.monthName}</Text>
                      <Chip 
                        style={[styles.historyChip, { 
                          backgroundColor: monthData.hasGoals ? '#10B981' : '#6B7280' 
                        }]}
                        textStyle={styles.historyChipText}
                      >
                        {monthData.hasGoals ? t('budget.withGoals') : t('budget.withoutGoals')}
                      </Chip>
                    </View>
                    
                    {monthData.hasGoals && (
                      <View style={styles.historyGoals}>
                        {monthData.goals.savings > 0 && (
                          <View style={styles.historyGoalItem}>
                            <Ionicons name="arrow-up-circle" size={16} color="#10B981" />
                            <Text style={styles.historyGoalText}>
                              {t('budget.savingsGoalLabel')}: {formatCurrency(monthData.goals.savings)}
                            </Text>
                          </View>
                        )}
                        
                        {monthData.goals.maxExpenses > 0 && (
                          <View style={styles.historyGoalItem}>
                            <Ionicons name="arrow-down-circle" size={16} color="#EF4444" />
                            <Text style={styles.historyGoalText}>
                              {t('budget.expenseLimitLabel')}: {formatCurrency(monthData.goals.maxExpenses)}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                    
                    {index < getGoalsHistory().length - 1 && (
                      <Divider style={styles.historyDivider} />
                    )}
                  </View>
                ))}
                
                {getGoalsHistory().length === 0 && (
                  <View style={styles.emptyHistory}>
                    <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyHistoryText}>{t('budget.noHistoryFound')}</Text>
                  </View>
                )}
              </ScrollView>
              
              <View style={styles.modalButtons}>
                <Button
                  mode="contained"
                  onPress={() => setShowGoalsHistory(false)}
                  style={styles.confirmButton}
                >
                  Fechar
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
    elevation: 3,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  goalsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  editGoalsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  goalsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalsActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  goalItem: {
    marginVertical: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  goalProgress: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  goalPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'right',
  },
  goalDivider: {
    marginVertical: 16,
    backgroundColor: '#E5E7EB',
    height: 1,
  },
  noGoalsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  noGoalsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  noGoalsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  setGoalsButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  sectionCard: {
    margin: 16,
    marginTop: 8,
    elevation: 3,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  budgetCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  budgetInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  budgetType: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  budgetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  deleteButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  progressContainer: {
    marginTop: 16,
    paddingBottom: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  spentText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  statusChip: {
    height: 32,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
  },
  statusChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  statusContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 36,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    maxHeight: '85%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  modalDescription: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryChip: {
    marginRight: 8,
    borderRadius: 20,
  },
  modalInput: {
    backgroundColor: 'white',
    borderRadius: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: '#D1D5DB',
    borderWidth: 2,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
  },
  statsContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalDivider: {
    marginVertical: 16,
    backgroundColor: '#E5E7EB',
    height: 1,
  },
  goalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  achievementText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  historyContainer: {
    maxHeight: '70%',
    paddingHorizontal: 16,
  },
  historyItem: {
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  historyChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  historyGoals: {
    marginLeft: 20,
    marginBottom: 12,
  },
  historyGoalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyGoalText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  historyDivider: {
    marginVertical: 12,
    backgroundColor: '#E5E7EB',
    height: 1,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
});

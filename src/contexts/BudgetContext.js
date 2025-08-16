import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFinance } from './FinanceContext';
import { useLanguage } from './LanguageContext';
import { useNotifications } from './NotificationContext';

const BudgetContext = createContext();

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([]);
  const [monthlyGoals, setMonthlyGoals] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [budgetHistory, setBudgetHistory] = useState([]);
  const [goalAchievements, setGoalAchievements] = useState([]);
  const { t } = useLanguage();
  const { transactions } = useFinance();
  const { sendBudgetAlert, sendGoalAchievement } = useNotifications();

  // Carregar dados salvos
  useEffect(() => {
    loadBudgetData();
  }, []);

  // Recalcular gastos dos orçamentos quando transações mudarem
  useEffect(() => {
    if (budgets.length > 0 && transactions.length > 0) {
      recalculateBudgetSpending();
    }
  }, [transactions]);

  const loadBudgetData = async () => {
    try {
      setIsLoading(true);
      const savedBudgets = await AsyncStorage.getItem('budgets');
      const savedGoals = await AsyncStorage.getItem('monthlyGoals');
      const savedHistory = await AsyncStorage.getItem('budgetHistory');
      const savedAchievements = await AsyncStorage.getItem('goalAchievements');
      
      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets));
      }
      
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        setMonthlyGoals(parsedGoals);
      }
      
      if (savedHistory) {
        setBudgetHistory(JSON.parse(savedHistory));
      }
      
      if (savedAchievements) {
        setGoalAchievements(JSON.parse(savedAchievements));
      }
    } catch (error) {
      console.error('Erro ao carregar dados de orçamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBudgetData = async (newBudgets, newGoals = monthlyGoals) => {
    try {
      // Preservar metas existentes se não foram fornecidas
      const goalsToSave = newGoals === monthlyGoals ? monthlyGoals : newGoals;
      
      await AsyncStorage.setItem('budgets', JSON.stringify(newBudgets));
      await AsyncStorage.setItem('monthlyGoals', JSON.stringify(goalsToSave));
      await AsyncStorage.setItem('budgetHistory', JSON.stringify(budgetHistory));
      await AsyncStorage.setItem('goalAchievements', JSON.stringify(goalAchievements));
      
    } catch (error) {
      console.error('Erro ao salvar dados de orçamento:', error);
    }
  };

  const setBudgetForCategory = async (categoryId, categoryName, limit, type = 'expense') => {
    const currentDate = new Date();
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const budgetId = `${categoryId}_${monthKey}`;
    
    // Verificar se já existe um orçamento para esta categoria no mês
    const existingBudget = budgets.find(b => b.id === budgetId);
    
    const budgetData = {
      id: budgetId,
      categoryId,
      categoryName,
      limit: parseFloat(limit),
      spent: existingBudget ? existingBudget.spent : 0,
      month: monthKey,
      type,
      createdAt: existingBudget ? existingBudget.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedBudgets = budgets.filter(b => b.id !== budgetId);
    updatedBudgets.push(budgetData);
    
    setBudgets(updatedBudgets);
    // Não sobrescrever metas ao definir orçamento de categoria
    await saveBudgetData(updatedBudgets, monthlyGoals);
  };

  const updateBudgetSpent = async (categoryId, amount, type) => {
    const currentDate = new Date();
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const budgetId = `${categoryId}_${monthKey}`;
    
    const updatedBudgets = budgets.map(budget => {
      if (budget.id === budgetId && budget.type === type) {
        return {
          ...budget,
          spent: budget.spent + amount
        };
      }
      return budget;
    });
    
    setBudgets(updatedBudgets);
    // Não sobrescrever metas ao atualizar gastos
    await saveBudgetData(updatedBudgets, monthlyGoals);
  };

  const getBudgetForCategory = (categoryId, type = 'expense') => {
    const currentDate = new Date();
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const budgetId = `${categoryId}_${monthKey}`;
    
    return budgets.find(b => b.id === budgetId && b.type === type);
  };

  const getAllCurrentBudgets = () => {
    const currentDate = new Date();
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    return budgets.filter(b => b.month === monthKey);
  };

  const getBudgetStatus = (budget) => {
    if (!budget) return { status: 'none', percentage: 0 };
    
    const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
    
    let status = 'good';
    if (percentage >= 100) status = 'exceeded';
    else if (percentage >= 80) status = 'warning';
    else if (percentage >= 60) status = 'caution';
    
    return { status, percentage: Math.min(percentage, 100) };
  };

  const setMonthlyGoal = async (goalType, amount) => {
    try {
      const currentDate = new Date();
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Preservar metas existentes do mês
      const existingMonthGoals = monthlyGoals[monthKey] || {};
      
      const updatedGoals = {
        ...monthlyGoals,
        [monthKey]: {
          ...existingMonthGoals,  // Preservar todas as metas existentes
          [goalType]: parseFloat(amount) || 0
        }
      };
      
      setMonthlyGoals(updatedGoals);
      await saveBudgetData(budgets, updatedGoals);
      
      // Verificar se a meta foi alcançada
      if (amount > 0) {
        checkGoalAchievement(goalType, amount, monthKey);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao definir meta mensal:', error);
      return false;
    }
  };

  // Verificar se uma meta foi alcançada
  const checkGoalAchievement = async (goalType, targetAmount, monthKey) => {
    try {
      const currentStats = getCurrentMonthStats();
      let isAchieved = false;
      
      if (goalType === 'savings' && currentStats.balance >= targetAmount) {
        isAchieved = true;
      } else if (goalType === 'maxExpenses' && currentStats.expenses <= targetAmount) {
        isAchieved = true;
      }
      
      if (isAchieved) {
        const achievement = {
          id: `${goalType}_${monthKey}_${Date.now()}`,
          goalType,
          targetAmount,
          achievedAmount: goalType === 'savings' ? currentStats.balance : currentStats.expenses,
          monthKey,
          achievedAt: new Date().toISOString(),
        };
        
        setGoalAchievements(prev => [...prev, achievement]);
        await saveBudgetData(budgets, monthlyGoals);
        
        // Enviar notificação de meta alcançada
        const goalTypeText = goalType === 'savings' ? 'economia' : 'limite de gastos';
        await sendGoalAchievement(goalTypeText, targetAmount);
      }
    } catch (error) {
      console.error('Erro ao verificar meta:', error);
    }
  };

  // Obter estatísticas do mês atual
  const getCurrentMonthStats = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    let income = 0;
    let expenses = 0;
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate.getMonth() === currentMonth && 
          transactionDate.getFullYear() === currentYear) {
        
        if (transaction.type === 'income') {
          income += parseFloat(transaction.amount) || 0;
        } else {
          expenses += parseFloat(transaction.amount) || 0;
        }
      }
    });
    
    return {
      income,
      expenses,
      balance: income - expenses
    };
  };

  // Copiar metas do mês anterior
  const copyPreviousMonthGoals = async () => {
    try {
      const currentDate = new Date();
      const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
      const previousMonthKey = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
      const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      const previousGoals = monthlyGoals[previousMonthKey];
      if (!previousGoals || (!previousGoals.savings && !previousGoals.maxExpenses)) {
        return false; // Não há metas para copiar
      }
      
      const updatedGoals = {
        ...monthlyGoals,
        [currentMonthKey]: {
          ...monthlyGoals[currentMonthKey],
          savings: previousGoals.savings || 0,
          maxExpenses: previousGoals.maxExpenses || 0,
          copiedFrom: previousMonthKey,
          copiedAt: new Date().toISOString()
        }
      };
      
      setMonthlyGoals(updatedGoals);
      await saveBudgetData(budgets, updatedGoals);
      
      return true;
    } catch (error) {
      console.error('Erro ao copiar metas:', error);
      return false;
    }
  };

  // Obter histórico de metas
  const getGoalsHistory = () => {
    const months = Object.keys(monthlyGoals).sort().reverse();
    return months.map(monthKey => {
      const monthDate = new Date(monthKey.split('-')[0], parseInt(monthKey.split('-')[1]) - 1);
      const monthName = monthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      return {
        month: monthKey,
        monthName,
        goals: monthlyGoals[monthKey],
        hasGoals: !!(monthlyGoals[monthKey]?.savings || monthlyGoals[monthKey]?.maxExpenses)
      };
    });
  };

  // Obter estatísticas das metas
  const getGoalsStats = () => {
    const currentStats = getCurrentMonthStats();
    const currentGoals = getCurrentMonthGoals();
    
    const daysRemaining = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
    
    const savingsProgress = currentGoals.savings > 0 ? (currentStats.balance / currentGoals.savings) * 100 : 0;
    const expenseProgress = currentGoals.maxExpenses > 0 ? (currentStats.expenses / currentGoals.maxExpenses) * 100 : 0;
    
    return {
      currentMonth: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      daysRemaining: Math.max(0, daysRemaining),
      monthlyIncome: currentStats.income,
      monthlyExpenses: currentStats.expenses,
      monthlyBalance: currentStats.balance,
      savingsGoal: currentGoals.savings || 0,
      expenseGoal: currentGoals.maxExpenses || 0,
      savingsProgress: Math.round(savingsProgress),
      expenseProgress: Math.round(expenseProgress),
      isSavingsGoalMet: savingsProgress >= 100,
      isExpenseGoalExceeded: expenseProgress >= 100
    };
  };

  // Limpar metas do mês atual
  const clearCurrentMonthGoals = async () => {
    try {
      const currentDate = new Date();
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      const updatedGoals = { ...monthlyGoals };
      delete updatedGoals[monthKey];
      
      setMonthlyGoals(updatedGoals);
      await saveBudgetData(budgets, updatedGoals);
      
      return true;
    } catch (error) {
      console.error('Erro ao limpar metas do mês atual:', error);
      return false;
    }
  };

  const clearAllData = async () => {
    try {
      // Limpar orçamentos
      setBudgets([]);
      
      // Limpar metas mensais
      setMonthlyGoals({});
      
      // Limpar histórico
      setBudgetHistory([]);
      
      // Limpar conquistas
      setGoalAchievements([]);
      
      // Limpar do AsyncStorage
      await AsyncStorage.removeItem('budgets');
      await AsyncStorage.removeItem('monthlyGoals');
      await AsyncStorage.removeItem('budgetHistory');
      await AsyncStorage.removeItem('goalAchievements');
      
      console.log('✅ Todos os dados de orçamento foram limpos');
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados de orçamento:', error);
      return false;
    }
  };

  const getMonthlyGoal = (goalType) => {
    const currentDate = new Date();
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const goal = monthlyGoals[monthKey]?.[goalType];
    
    return goal || 0;
  };

  const getCurrentMonthGoals = () => {
    const currentDate = new Date();
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    return monthlyGoals[monthKey] || {};
  };

  const deleteBudget = async (budgetId) => {
    const updatedBudgets = budgets.filter(b => b.id !== budgetId);
    setBudgets(updatedBudgets);
    // Não sobrescrever metas ao deletar orçamento
    await saveBudgetData(updatedBudgets, monthlyGoals);
  };

  const recalculateBudgetSpending = async () => {
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Calcular gastos por categoria no mês atual
    const spendingByCategory = {};
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate.getMonth() === currentMonth && 
          transactionDate.getFullYear() === currentYear) {
        
        const categoryId = transaction.categoryId;
        const amount = parseFloat(transaction.amount) || 0;
        
        if (!spendingByCategory[categoryId]) {
          spendingByCategory[categoryId] = { income: 0, expense: 0 };
        }
        
        if (transaction.type === 'income') {
          spendingByCategory[categoryId].income += amount;
        } else if (transaction.type === 'expense') {
          spendingByCategory[categoryId].expense += amount;
        }
      }
    });
    
    // Atualizar orçamentos com gastos recalculados
    const updatedBudgets = budgets.map(budget => {
      const categorySpending = spendingByCategory[budget.categoryId];
      if (categorySpending) {
        const newSpent = budget.type === 'income' 
          ? categorySpending.income 
          : categorySpending.expense;
          
        if (newSpent !== budget.spent) {
          
          // Adicionar ao histórico
          const historyEntry = {
            id: `${budget.id}_${Date.now()}`,
            budgetId: budget.id,
            categoryName: budget.categoryName,
            oldSpent: budget.spent,
            newSpent,
            change: newSpent - budget.spent,
            updatedAt: new Date().toISOString()
          };
          
          setBudgetHistory(prev => [...prev, historyEntry]);
          
          // Verificar se precisa enviar notificação
          const percentage = (newSpent / budget.limit) * 100;
          if (percentage >= 80) {
            sendBudgetAlert(budget.categoryName, percentage);
          }
          
          return { ...budget, spent: newSpent };
        }
      }
      return budget;
    });
    
    // Salvar apenas se houve mudanças
    const hasChanges = updatedBudgets.some((budget, index) => 
      budget.spent !== budgets[index].spent
    );
    
    if (hasChanges) {
      setBudgets(updatedBudgets);
      // Não sobrescrever metas ao recalcular gastos
      await saveBudgetData(updatedBudgets, monthlyGoals);
    }
  };

  const updateBudget = async (oldBudgetId, categoryId, categoryName, limit, type = 'expense') => {

    const currentDate = new Date();
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const newBudgetId = `${categoryId}_${monthKey}`;
    
    // Preservar dados do orçamento antigo antes de deletar
    const oldBudget = budgets.find(b => b.id === oldBudgetId);
    const spentToPreserve = oldBudget ? oldBudget.spent : 0;
    const createdAtToPreserve = oldBudget ? oldBudget.createdAt : new Date().toISOString();
    
    // Remover o orçamento antigo e criar/atualizar em uma única operação
    const updatedBudgets = budgets.filter(b => b.id !== oldBudgetId && b.id !== newBudgetId);
    
    const budgetData = {
      id: newBudgetId,
      categoryId,
      categoryName,
      limit: parseFloat(limit),
      spent: spentToPreserve,
      month: monthKey,
      type,
      createdAt: createdAtToPreserve,
      updatedAt: new Date().toISOString(),
    };
    
    updatedBudgets.push(budgetData);
    
    setBudgets(updatedBudgets);
    // Não sobrescrever metas ao atualizar orçamento
    await saveBudgetData(updatedBudgets, monthlyGoals);
  };

  const value = {
    budgets,
    monthlyGoals,
    budgetHistory,
    goalAchievements,
    isLoading,
    setBudgetForCategory,
    updateBudget,
    updateBudgetSpent,
    getBudgetForCategory,
    getAllCurrentBudgets,
    getBudgetStatus,
    setMonthlyGoal,
    getMonthlyGoal,
    getCurrentMonthGoals,
    deleteBudget,
    copyPreviousMonthGoals,
    getGoalsHistory,
    getGoalsStats,
    clearCurrentMonthGoals,
    clearAllData,
    getCurrentMonthStats,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFinance } from './FinanceContext';
import { useLanguage } from './LanguageContext';

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
  const { t } = useLanguage();
  const { transactions } = useFinance();

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
      
      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets));
      }
      
      if (savedGoals) {
        setMonthlyGoals(JSON.parse(savedGoals));
      }
    } catch (error) {
      console.error('Erro ao carregar dados de orçamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBudgetData = async (newBudgets, newGoals = monthlyGoals) => {
    try {
      await AsyncStorage.setItem('budgets', JSON.stringify(newBudgets));
      await AsyncStorage.setItem('monthlyGoals', JSON.stringify(newGoals));
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
    
    console.log('💰 setBudgetForCategory:', {
      budgetId,
      categoryName,
      limit,
      existingBudget: existingBudget ? 'SIM' : 'NÃO',
      spentToPreserve: existingBudget ? existingBudget.spent : 0
    });
    
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
    
    console.log('📊 Total de orçamentos após operação:', updatedBudgets.length);
    
    setBudgets(updatedBudgets);
    await saveBudgetData(updatedBudgets);
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
    await saveBudgetData(updatedBudgets);
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
      
      // Validar o tipo de meta
      if (!['savings', 'maxExpenses'].includes(goalType)) {
        console.error('Tipo de meta inválido:', goalType);
        return false;
      }
      
      // Validar o valor
      const validatedAmount = parseFloat(amount) || 0;
      if (validatedAmount < 0) {
        console.error('Valor da meta não pode ser negativo:', amount);
        return false;
      }
      
      const updatedGoals = {
        ...monthlyGoals,
        [monthKey]: {
          ...monthlyGoals[monthKey],
          [goalType]: validatedAmount
        }
      };
      
      console.log('🎯 Definindo meta mensal:', { 
        monthKey, 
        goalType, 
        amount: validatedAmount, 
        updatedGoals,
        previousValue: monthlyGoals[monthKey]?.[goalType] || 0
      });
      
      setMonthlyGoals(updatedGoals);
      await saveBudgetData(budgets, updatedGoals);
      
      console.log('✅ Meta mensal salva com sucesso:', { goalType, amount: validatedAmount });
      return true;
    } catch (error) {
      console.error('Erro ao definir meta mensal:', error);
      return false;
    }
  };

  const getMonthlyGoal = (goalType) => {
    try {
      const currentDate = new Date();
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Validar o tipo de meta
      if (!['savings', 'maxExpenses'].includes(goalType)) {
        console.error('Tipo de meta inválido:', goalType);
        return 0;
      }
      
      const goal = monthlyGoals[monthKey]?.[goalType];
      console.log('🎯 Obtendo meta mensal:', { monthKey, goalType, goal, allGoals: monthlyGoals[monthKey] });
      
      return goal || 0;
    } catch (error) {
      console.error('Erro ao obter meta mensal:', error);
      return 0;
    }
  };

  const getCurrentMonthGoals = () => {
    const currentDate = new Date();
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    return monthlyGoals[monthKey] || {};
  };

  const deleteBudget = async (budgetId) => {
    const updatedBudgets = budgets.filter(b => b.id !== budgetId);
    setBudgets(updatedBudgets);
    await saveBudgetData(updatedBudgets);
  };

  const recalculateBudgetSpending = async () => {
    console.log('🔄 Recalculando gastos dos orçamentos...');
    
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
          console.log(`💰 Atualizando orçamento ${budget.categoryName}: ${budget.spent} → ${newSpent}`);
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
      console.log('💾 Salvando orçamentos atualizados...');
      setBudgets(updatedBudgets);
      await saveBudgetData(updatedBudgets);
    }
  };

  const updateBudget = async (oldBudgetId, categoryId, categoryName, limit, type = 'expense') => {
    console.log('🔄 updateBudget chamado:', {
      oldBudgetId,
      categoryId,
      categoryName,
      limit,
      type
    });

    const currentDate = new Date();
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const newBudgetId = `${categoryId}_${monthKey}`;
    
    console.log('🆔 IDs:', { oldBudgetId, newBudgetId, willDelete: oldBudgetId !== newBudgetId });
    
    // Preservar dados do orçamento antigo antes de deletar
    const oldBudget = budgets.find(b => b.id === oldBudgetId);
    const spentToPreserve = oldBudget ? oldBudget.spent : 0;
    const createdAtToPreserve = oldBudget ? oldBudget.createdAt : new Date().toISOString();
    
    console.log('💾 Dados a preservar:', { spentToPreserve, createdAtToPreserve });
    
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
    
    console.log('📊 Total de orçamentos após operação:', updatedBudgets.length);
    console.log('✅ Orçamento atualizado:', budgetData);
    
    setBudgets(updatedBudgets);
    await saveBudgetData(updatedBudgets);
  };

  const value = {
    budgets,
    monthlyGoals,
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
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

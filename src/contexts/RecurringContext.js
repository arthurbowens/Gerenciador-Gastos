import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from './LanguageContext';

const RecurringContext = createContext();

export const useRecurring = () => {
  const context = useContext(RecurringContext);
  if (!context) {
    throw new Error('useRecurring must be used within a RecurringProvider');
  }
  return context;
};

export const RecurringProvider = ({ children }) => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const { t } = useLanguage();

  // Carregar dados salvos
  useEffect(() => {
    loadRecurringData();
  }, []);

  // Verificar transações pendentes diariamente
  useEffect(() => {
    const checkPendingTransactions = () => {
      processRecurringTransactions();
    };

    // Verificar imediatamente
    checkPendingTransactions();

    // Verificar a cada hora (3600000 ms)
    const interval = setInterval(checkPendingTransactions, 3600000);

    return () => clearInterval(interval);
  }, [recurringTransactions]);

  const loadRecurringData = async () => {
    try {
      const savedRecurring = await AsyncStorage.getItem('recurringTransactions');
      
      if (savedRecurring) {
        setRecurringTransactions(JSON.parse(savedRecurring));
      }
    } catch (error) {
      console.error('Erro ao carregar transações recorrentes:', error);
    }
  };

  const saveRecurringData = async (data) => {
    try {
      await AsyncStorage.setItem('recurringTransactions', JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar transações recorrentes:', error);
    }
  };

  const addRecurringTransaction = async (transactionData) => {
    const newRecurring = {
      ...transactionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      nextExecutionDate: calculateNextDate(transactionData.frequency, transactionData.startDate),
      isActive: true,
      executionCount: 0,
      lastExecutionDate: null,
    };

    const updatedRecurring = [...recurringTransactions, newRecurring];
    setRecurringTransactions(updatedRecurring);
    await saveRecurringData(updatedRecurring);
    
    return newRecurring;
  };

  const updateRecurringTransaction = async (id, updates) => {
    const updatedRecurring = recurringTransactions.map(recurring =>
      recurring.id === id ? { 
        ...recurring, 
        ...updates,
        nextExecutionDate: updates.frequency || updates.startDate 
          ? calculateNextDate(updates.frequency || recurring.frequency, updates.startDate || recurring.startDate)
          : recurring.nextExecutionDate
      } : recurring
    );
    
    setRecurringTransactions(updatedRecurring);
    await saveRecurringData(updatedRecurring);
  };

  const deleteRecurringTransaction = async (id) => {
    const updatedRecurring = recurringTransactions.filter(recurring => recurring.id !== id);
    setRecurringTransactions(updatedRecurring);
    await saveRecurringData(updatedRecurring);
  };

  const toggleRecurringTransaction = async (id) => {
    const recurring = recurringTransactions.find(r => r.id === id);
    if (recurring) {
      await updateRecurringTransaction(id, { isActive: !recurring.isActive });
    }
  };

  const calculateNextDate = (frequency, startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        const nextDay = new Date(now);
        nextDay.setDate(nextDay.getDate() + 1);
        return nextDay.toISOString();
        
      case 'weekly':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek.toISOString();
        
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(start.getDate());
        return nextMonth.toISOString();
        
      case 'yearly':
        const nextYear = new Date(now);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        nextYear.setMonth(start.getMonth());
        nextYear.setDate(start.getDate());
        return nextYear.toISOString();
        
      default:
        return now.toISOString();
    }
  };

  const processRecurringTransactions = async () => {
    const now = new Date();
    const pendingTransactions = [];
    
    for (const recurring of recurringTransactions) {
      if (!recurring.isActive) continue;
      
      const nextExecution = new Date(recurring.nextExecutionDate);
      
      if (nextExecution <= now) {
        // Criar transação automática
        const newTransaction = {
          title: recurring.title,
          amount: recurring.amount,
          type: recurring.type,
          categoryId: recurring.categoryId,
          categoryName: recurring.categoryName,
          description: `${t('recurring.automaticTransaction')} - ${recurring.title}`,
          accountId: recurring.accountId,
        };
        
        pendingTransactions.push({
          recurringId: recurring.id,
          transaction: newTransaction,
        });
        
        // Atualizar próxima execução
        const nextDate = calculateNextDate(recurring.frequency, recurring.nextExecutionDate);
        await updateRecurringTransaction(recurring.id, {
          nextExecutionDate: nextDate,
          lastExecutionDate: now.toISOString(),
          executionCount: recurring.executionCount + 1,
        });
      }
    }
    
    return pendingTransactions;
  };

  const getPendingTransactions = async () => {
    return await processRecurringTransactions();
  };

  const getActiveRecurringTransactions = () => {
    return recurringTransactions.filter(recurring => recurring.isActive);
  };

  const getRecurringByCategory = (categoryId) => {
    return recurringTransactions.filter(recurring => recurring.categoryId === categoryId);
  };

  const getMonthlyRecurringTotal = (type = 'expense') => {
    return recurringTransactions
      .filter(recurring => recurring.isActive && recurring.type === type && recurring.frequency === 'monthly')
      .reduce((total, recurring) => total + recurring.amount, 0);
  };

  const getFrequencyLabel = (frequency) => {
    switch (frequency) {
      case 'daily': return t('recurring.daily');
      case 'weekly': return t('recurring.weekly');
      case 'monthly': return t('recurring.monthly');
      case 'yearly': return t('recurring.yearly');
      default: return frequency;
    }
  };

  const value = {
    recurringTransactions,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    toggleRecurringTransaction,
    getPendingTransactions,
    getActiveRecurringTransactions,
    getRecurringByCategory,
    getMonthlyRecurringTotal,
    getFrequencyLabel,
    processRecurringTransactions,
  };

  return (
    <RecurringContext.Provider value={value}>
      {children}
    </RecurringContext.Provider>
  );
};

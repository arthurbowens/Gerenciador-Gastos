import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from './LanguageContext';

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const { t, currentLanguage } = useLanguage();

  // Criar categorias padrão baseadas no idioma
  const getDefaultCategories = () => {
    return [
      { id: '1', name: t('defaultCategories.food'), icon: 'restaurant', color: '#FF6B6B', type: 'expense' },
      { id: '2', name: t('defaultCategories.transport'), icon: 'car', color: '#4ECDC4', type: 'expense' },
      { id: '3', name: t('defaultCategories.housing'), icon: 'home', color: '#45B7D1', type: 'expense' },
      { id: '4', name: t('defaultCategories.health'), icon: 'medical', color: '#96CEB4', type: 'expense' },
      { id: '5', name: t('defaultCategories.education'), icon: 'school', color: '#FFEAA7', type: 'expense' },
      { id: '6', name: t('defaultCategories.entertainment'), icon: 'game-controller', color: '#DDA0DD', type: 'expense' },
      { id: '7', name: t('defaultCategories.salary'), icon: 'cash', color: '#98D8C8', type: 'income' },
      { id: '8', name: t('defaultCategories.freelance'), icon: 'briefcase', color: '#F7DC6F', type: 'income' },
      { id: '9', name: t('defaultCategories.investments'), icon: 'trending-up', color: '#BB8FCE', type: 'income' },
    ];
  };

  // Carregar dados salvos
  useEffect(() => {
    loadData();
  }, []);

  // Atualizar categorias quando o idioma mudar
  useEffect(() => {
    updateCategoriesLanguage();
  }, [currentLanguage, t]);

  // Calcular balanço
  useEffect(() => {
    calculateBalance();
  }, [transactions]);

  const loadData = async () => {
    try {
      const savedTransactions = await AsyncStorage.getItem('transactions');
      const savedCategories = await AsyncStorage.getItem('categories');
      
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
      
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      } else {
        // Categorias padrão traduzidas
        const defaultCategories = getDefaultCategories();
        setCategories(defaultCategories);
        await AsyncStorage.setItem('categories', JSON.stringify(defaultCategories));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const updateCategoriesLanguage = async () => {
    if (!t || !currentLanguage) return;
    
    try {
      // IDs das categorias padrão
      const defaultCategoryIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
      
      // Buscar categorias salvas
      const savedCategories = await AsyncStorage.getItem('categories');
      if (savedCategories) {
        const currentCategories = JSON.parse(savedCategories);
        const updatedCategories = currentCategories.map(category => {
          // Apenas atualizar categorias padrão (não as personalizadas do usuário)
          if (defaultCategoryIds.includes(category.id)) {
            const defaultCategories = getDefaultCategories();
            const updatedCategory = defaultCategories.find(defCat => defCat.id === category.id);
            if (updatedCategory) {
              return { ...category, name: updatedCategory.name };
            }
          }
          return category;
        });
        
        setCategories(updatedCategories);
        await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
      }
    } catch (error) {
      console.error('Erro ao atualizar idioma das categorias:', error);
    }
  };

  const calculateBalance = () => {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    });

    setIncome(totalIncome);
    setExpenses(totalExpenses);
    setBalance(totalIncome - totalExpenses);
  };

  const addTransaction = async (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    
    try {
      await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const updateTransaction = async (transactionId, updatedData) => {
    try {
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === transactionId 
          ? { 
              ...transaction, 
              ...updatedData,
              updatedAt: new Date().toISOString()
            }
          : transaction
      );

      setTransactions(updatedTransactions);
      await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return false;
    }
  };

  const deleteTransaction = async (transactionId) => {
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    setTransactions(updatedTransactions);
    
    try {
      await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
    }
  };

  const addCategory = async (category) => {
    const newCategory = {
      ...category,
      id: Date.now().toString(),
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    
    try {
      await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const deleteCategory = async (categoryId) => {
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    setCategories(updatedCategories);
    
    try {
      await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
    }
  };

  const getTransactionsByCategory = (categoryId) => {
    return transactions.filter(t => t.categoryId === categoryId);
  };

  const getTransactionsByMonth = (year, month) => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  };

  const getMonthlyStats = (year, month) => {
    const monthTransactions = getTransactionsByMonth(year, month);
    let monthIncome = 0;
    let monthExpenses = 0;

    monthTransactions.forEach(t => {
      if (t.type === 'income') {
        monthIncome += t.amount;
      } else {
        monthExpenses += t.amount;
      }
    });

    return {
      income: monthIncome,
      expenses: monthExpenses,
      balance: monthIncome - monthExpenses,
      count: monthTransactions.length
    };
  };

  const value = {
    transactions,
    categories,
    balance,
    income,
    expenses,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    getTransactionsByCategory,
    getTransactionsByMonth,
    getMonthlyStats,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

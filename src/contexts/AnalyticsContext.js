import React, { createContext, useContext, useMemo } from 'react';
import { useFinance } from './FinanceContext';
import { useAccounts } from './AccountsContext';
import { useRecurring } from './RecurringContext';
import { useLanguage } from './LanguageContext';
import { useCurrency } from './CurrencyContext';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const { transactions, categories } = useFinance();
  const { accounts } = useAccounts();
  const { recurringTransactions } = useRecurring();
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();

  // Análise de tendências mensais
  const monthlyTrends = useMemo(() => {
    const monthlyData = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          income: 0,
          expenses: 0,
          transactions: 0,
        };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
      monthlyData[monthKey].transactions += 1;
    });

    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(data => ({
        ...data,
        balance: data.income - data.expenses,
        savings: data.income > 0 ? ((data.income - data.expenses) / data.income) * 100 : 0,
      }));
  }, [transactions, t, formatCurrency]);

  // Análise por categoria
  const categoryAnalytics = useMemo(() => {
    const categoryData = {};
    
    transactions.forEach(transaction => {
      const category = transaction.categoryName;
      if (!categoryData[category]) {
        categoryData[category] = {
          name: category,
          totalAmount: 0,
          transactionCount: 0,
          averageAmount: 0,
          type: transaction.type,
          trend: 'stable',
        };
      }
      
      categoryData[category].totalAmount += transaction.amount;
      categoryData[category].transactionCount += 1;
    });

    // Calcular médias e tendências
    Object.values(categoryData).forEach(category => {
      category.averageAmount = category.totalAmount / category.transactionCount;
      
      // Análise de tendência (últimos 3 meses vs 3 meses anteriores)
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      
      const recentTransactions = transactions.filter(t => 
        t.categoryName === category.name && 
        new Date(t.date) >= threeMonthsAgo
      );
      
      const olderTransactions = transactions.filter(t => 
        t.categoryName === category.name && 
        new Date(t.date) >= sixMonthsAgo &&
        new Date(t.date) < threeMonthsAgo
      );
      
      const recentAverage = recentTransactions.reduce((sum, t) => sum + t.amount, 0) / Math.max(recentTransactions.length, 1);
      const olderAverage = olderTransactions.reduce((sum, t) => sum + t.amount, 0) / Math.max(olderTransactions.length, 1);
      
      if (recentAverage > olderAverage * 1.1) {
        category.trend = 'increasing';
      } else if (recentAverage < olderAverage * 0.9) {
        category.trend = 'decreasing';
      }
    });

    return Object.values(categoryData).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [transactions, t, formatCurrency]);

  // Previsões baseadas em histórico
  const predictions = useMemo(() => {
    if (monthlyTrends.length < 3) {
      return {
        nextMonthIncome: 0,
        nextMonthExpenses: 0,
        nextMonthBalance: 0,
        confidence: 'low',
      };
    }

    const lastThreeMonths = monthlyTrends.slice(-3);
    
    // Previsão simples baseada na média dos últimos 3 meses
    const avgIncome = lastThreeMonths.reduce((sum, month) => sum + month.income, 0) / 3;
    const avgExpenses = lastThreeMonths.reduce((sum, month) => sum + month.expenses, 0) / 3;
    
    // Detectar tendência
    const incomeGrowth = lastThreeMonths.length > 1 
      ? (lastThreeMonths[2].income - lastThreeMonths[0].income) / 2
      : 0;
    
    const expenseGrowth = lastThreeMonths.length > 1
      ? (lastThreeMonths[2].expenses - lastThreeMonths[0].expenses) / 2
      : 0;

    const nextMonthIncome = Math.max(0, avgIncome + incomeGrowth);
    const nextMonthExpenses = Math.max(0, avgExpenses + expenseGrowth);
    
    const confidence = monthlyTrends.length >= 6 ? 'high' : monthlyTrends.length >= 4 ? 'medium' : 'low';

    return {
      nextMonthIncome,
      nextMonthExpenses,
      nextMonthBalance: nextMonthIncome - nextMonthExpenses,
      confidence,
      incomeGrowth,
      expenseGrowth,
    };
  }, [monthlyTrends, t]);

  // Insights automáticos
  const insights = useMemo(() => {
    const insights = [];
    
    // Insight 1: Categoria com maior gasto
    if (categoryAnalytics.length > 0) {
      const topExpenseCategory = categoryAnalytics
        .filter(cat => cat.type === 'expense')
        .sort((a, b) => b.totalAmount - a.totalAmount)[0];
      
      if (topExpenseCategory) {
        insights.push({
          type: 'warning',
          title: t('analytics.topExpenseCategory'),
          description: t('analytics.topExpenseCategoryDesc', {
            category: topExpenseCategory.name,
            amount: formatCurrency(topExpenseCategory.totalAmount)
          }),
          icon: 'alert-circle',
          color: '#F59E0B',
        });
      }
    }

    // Insight 2: Tendência de gastos crescente
    const increasingCategories = categoryAnalytics.filter(cat => 
      cat.type === 'expense' && cat.trend === 'increasing'
    );
    
    if (increasingCategories.length > 0) {
      insights.push({
        type: 'warning',
        title: t('analytics.increasingExpenses'),
        description: t('analytics.increasingExpensesDesc', {
          count: increasingCategories.length,
          categories: increasingCategories.slice(0, 2).map(cat => cat.name).join(', ')
        }),
        icon: 'trending-up',
        color: '#EF4444',
      });
    }

    // Insight 3: Oportunidade de economia
    if (predictions.nextMonthBalance < 0) {
      insights.push({
        type: 'danger',
        title: t('analytics.negativeBalance'),
        description: t('analytics.negativeBalanceDesc', {
          amount: formatCurrency(Math.abs(predictions.nextMonthBalance))
        }),
        icon: 'alert-triangle',
        color: '#DC2626',
      });
    }

    // Insight 4: Performance positiva
    if (monthlyTrends.length >= 2) {
      const lastMonth = monthlyTrends[monthlyTrends.length - 1];
      const previousMonth = monthlyTrends[monthlyTrends.length - 2];
      
      if (lastMonth.savings > previousMonth.savings && lastMonth.savings > 20) {
        insights.push({
          type: 'success',
          title: t('analytics.goodSavings'),
          description: t('analytics.goodSavingsDesc', {
            percentage: lastMonth.savings.toFixed(1)
          }),
          icon: 'checkmark-circle',
          color: '#10B981',
        });
      }
    }

    // Insight 5: Transações recorrentes
    const monthlyRecurringTotal = recurringTransactions
      .filter(r => r.isActive && r.frequency === 'monthly')
      .reduce((sum, r) => sum + (r.type === 'expense' ? r.amount : -r.amount), 0);
    
    if (monthlyRecurringTotal > 0) {
      insights.push({
        type: 'info',
        title: t('analytics.recurringExpenses'),
        description: t('analytics.recurringExpensesDesc', {
          amount: formatCurrency(monthlyRecurringTotal)
        }),
        icon: 'repeat',
        color: '#3B82F6',
      });
    }

    return insights;
  }, [categoryAnalytics, predictions, monthlyTrends, recurringTransactions, t]);

  // Análise por conta
  const accountAnalytics = useMemo(() => {
    return accounts.map(account => {
      const accountTransactions = transactions.filter(t => t.accountId === account.id);
      const totalTransactions = accountTransactions.length;
      const totalIncome = accountTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = accountTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...account,
        totalTransactions,
        totalIncome,
        totalExpenses,
        usage: totalTransactions > 0 ? 'active' : 'inactive',
      };
    });
  }, [accounts, transactions, t]);

  const getSpendingPattern = () => {
    const dayOfWeekSpending = Array(7).fill(0);
    const hourOfDaySpending = Array(24).fill(0);
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const date = new Date(transaction.date);
        const dayOfWeek = date.getDay();
        const hour = date.getHours();
        
        dayOfWeekSpending[dayOfWeek] += transaction.amount;
        hourOfDaySpending[hour] += transaction.amount;
      });

    const peakDay = dayOfWeekSpending.indexOf(Math.max(...dayOfWeekSpending));
    const peakHour = hourOfDaySpending.indexOf(Math.max(...hourOfDaySpending));
    
    const dayNames = [
      t('analytics.sunday'), t('analytics.monday'), t('analytics.tuesday'),
      t('analytics.wednesday'), t('analytics.thursday'), t('analytics.friday'), t('analytics.saturday')
    ];

    return {
      dayOfWeekSpending,
      hourOfDaySpending,
      peakDay: dayNames[peakDay],
      peakHour: `${peakHour}:00`,
    };
  };

  const value = {
    monthlyTrends,
    categoryAnalytics,
    predictions,
    insights,
    accountAnalytics,
    getSpendingPattern,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

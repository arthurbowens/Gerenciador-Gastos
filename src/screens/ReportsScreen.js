import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Card, Title, Chip, SegmentedButtons } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../contexts/FinanceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { MonthlyBarChart, BalanceLineChart, ExpensesPieChart } from '../components/Charts';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const { transactions, categories, getMonthlyStats } = useFinance();
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthlyStats = getMonthlyStats(currentYear, currentMonth);

  const getMonthlyChartData = () => {
    try {
      const last6Months = [];
      const currentDate = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthStats = getMonthlyStats(date.getFullYear(), date.getMonth());
        
        last6Months.push({
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          income: Number(monthStats.income) || 0,
          expenses: Number(monthStats.expenses) || 0,
          balance: Number(monthStats.balance) || 0,
        });
      }
      
      // Validar se temos dados válidos
      if (last6Months.length === 0) {
        return null;
      }
      
      const incomeData = last6Months.map(m => m.income);
      const expensesData = last6Months.map(m => m.expenses);
      
      // Verificar se pelo menos um dataset tem dados válidos
      const hasValidData = incomeData.some(v => v > 0) || expensesData.some(v => v > 0);
      
      if (!hasValidData) {
        return null;
      }
      
      return {
        labels: last6Months.map(m => m.month),
        datasets: [
          {
            data: incomeData,
            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
            strokeWidth: 2,
          },
          {
            data: expensesData,
            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
            strokeWidth: 2,
          }
        ],
        legend: [t('home.income'), t('home.expenses')]
      };
    } catch (error) {
      console.error('Erro em getMonthlyChartData:', error);
      return null;
    }
  };

  const getBalanceChartData = () => {
    try {
      const last6Months = [];
      const currentDate = new Date();
      const labels = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthStats = getMonthlyStats(date.getFullYear(), date.getMonth());
        last6Months.push(Number(monthStats.balance) || 0);
        labels.push(date.toLocaleDateString('pt-BR', { month: 'short' }));
      }
      
      if (last6Months.length === 0) {
        return null;
      }
      
      return {
        labels: labels,
        datasets: [{
          data: last6Months,
          color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
          strokeWidth: 3,
        }],
        legend: [t('home.balance')]
      };
    } catch (error) {
      console.error('Erro em getBalanceChartData:', error);
      return null;
    }
  };

  const getCategoryPieData = () => {
    try {
      const categoryStats = getCategoryStats();
      
      if (!Array.isArray(categoryStats) || categoryStats.length === 0) {
        return [];
      }
      
      return categoryStats
        .filter(item => item && item.type === 'expense' && item.total > 0)
        .map(item => ({ 
          name: String(item.name || ''), 
          amount: Number(item.total) || 0 
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6);
    } catch (error) {
      console.error('Erro em getCategoryPieData:', error);
      return [];
    }
  };

  const getCategoryStats = () => {
    const categoryStats = {};
    
    transactions.forEach(transaction => {
      if (!categoryStats[transaction.categoryName]) {
        categoryStats[transaction.categoryName] = {
          total: 0,
          count: 0,
          type: transaction.type,
        };
      }
      categoryStats[transaction.categoryName].total += transaction.amount;
      categoryStats[transaction.categoryName].count += 1;
    });

    return Object.entries(categoryStats)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        count: stats.count,
        type: stats.type,
      }))
      .sort((a, b) => b.total - a.total);
  };

  const getTopExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const getTopIncomes = () => {
    return transactions
      .filter(t => t.type === 'income')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const getCategoryIcon = (categoryName) => {
    const categoryMap = {
      'Alimentação': 'restaurant',
      'Transporte': 'car',
      'Moradia': 'home',
      'Saúde': 'medical',
      'Educação': 'school',
      'Lazer': 'game-controller',
      'Salário': 'cash',
      'Freelance': 'briefcase',
      'Investimentos': 'trending-up',
    };
    return categoryMap[categoryName] || 'help-circle';
  };

  const getCategoryColor = (categoryName) => {
    const categoryMap = {
      'Alimentação': '#FF6B6B',
      'Transporte': '#4ECDC4',
      'Moradia': '#45B7D1',
      'Saúde': '#96CEB4',
      'Educação': '#FFEAA7',
      'Lazer': '#DDA0DD',
      'Salário': '#98D8C8',
      'Freelance': '#F7DC6F',
      'Investimentos': '#BB8FCE',
    };
    return categoryMap[categoryName] || '#95A5A6';
  };

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <Card style={[styles.summaryCard, styles.incomeCard]}>
        <Card.Content>
          <View style={styles.summaryHeader}>
            <Ionicons name="arrow-up-circle" size={24} color="#10B981" />
            <Text style={styles.summaryLabel}>{t('home.income')}</Text>
          </View>
          <Text style={styles.summaryAmount}>{formatCurrency(monthlyStats.income)}</Text>
          <Text style={styles.summaryPeriod}>{t('home.thisMonth')}</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.summaryCard, styles.expenseCard]}>
        <Card.Content>
          <View style={styles.summaryHeader}>
            <Ionicons name="arrow-down-circle" size={24} color="#EF4444" />
            <Text style={styles.summaryLabel}>{t('home.expenses')}</Text>
          </View>
          <Text style={styles.summaryAmount}>{formatCurrency(monthlyStats.expenses)}</Text>
          <Text style={styles.summaryPeriod}>{t('home.thisMonth')}</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.summaryCard, styles.balanceCard]}>
        <Card.Content>
          <View style={styles.summaryHeader}>
            <Ionicons name="wallet" size={24} color="#1E3A8A" />
            <Text style={styles.summaryLabel}>{t('home.balance')}</Text>
          </View>
          <Text style={[
            styles.summaryAmount,
            monthlyStats.balance >= 0 ? styles.positiveBalance : styles.negativeBalance
          ]}>
            {formatCurrency(monthlyStats.balance)}
          </Text>
          <Text style={styles.summaryPeriod}>{t('home.thisMonth')}</Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderCategoryBreakdown = () => {
    const categoryStats = getCategoryStats();
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>{t('reports.expensesByCategory')}</Title>
          {categoryStats.length > 0 ? (
            categoryStats.map((category, index) => (
              <View key={index} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category.name) }]}>
                    <Ionicons 
                      name={getCategoryIcon(category.name)} 
                      size={16} 
                      color="white" 
                    />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={[
                    styles.categoryAmount,
                    category.type === 'income' ? styles.incomeText : styles.expenseText
                  ]}>
                    {category.type === 'income' ? '+' : '-'}{formatCurrency(category.total)}
                  </Text>
                  <Text style={styles.categoryCount}>{category.count} transações</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>{t('reports.noTransactionsToAnalyze')}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderTopTransactions = () => (
    <View style={styles.topTransactionsContainer}>
      <Card style={styles.topTransactionCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>{t('reports.topExpenses')}</Title>
          {getTopExpenses().length > 0 ? (
            getTopExpenses().map((transaction, index) => (
              <View key={transaction.id} style={styles.transactionRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionCategory}>{transaction.categoryName}</Text>
                </View>
                <Text style={styles.transactionAmount}>
                  -{formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>{t('reports.noExpenseRegistered')}</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.topTransactionCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>{t('reports.topIncomes')}</Title>
          {getTopIncomes().length > 0 ? (
            getTopIncomes().map((transaction, index) => (
              <View key={transaction.id} style={styles.transactionRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionCategory}>{transaction.categoryName}</Text>
                </View>
                <Text style={styles.transactionAmount}>
                  +{formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>{t('reports.noIncomeRegistered')}</Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Período */}
      <View style={styles.periodContainer}>
        <Text style={styles.periodLabel}>{t('reports.analysisperiod')}</Text>
        <SegmentedButtons
          value={selectedPeriod}
          onValueChange={setSelectedPeriod}
          buttons={[
            { value: 'month', label: t('reports.month') },
            { value: 'quarter', label: t('reports.quarter') },
            { value: 'year', label: t('reports.year') },
          ]}
          style={styles.periodButtons}
        />
      </View>

      {/* Resumo */}
      {renderSummaryCards()}

      {/* Gráficos */}
      {getMonthlyChartData() && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('reports.monthlyComparison')}</Title>
            <MonthlyBarChart data={getMonthlyChartData()} />
          </Card.Content>
        </Card>
      )}

      {getBalanceChartData() && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('reports.balanceEvolution')}</Title>
            <BalanceLineChart data={getBalanceChartData()} />
          </Card.Content>
        </Card>
      )}

      {getCategoryPieData().length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('reports.expensesByCategory')}</Title>
            <ExpensesPieChart data={getCategoryPieData()} />
          </Card.Content>
        </Card>
      )}

      {/* Análise por categoria */}
      {renderCategoryBreakdown()}

      {/* Top transações */}
      {renderTopTransactions()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  periodContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  periodButtons: {
    marginBottom: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  incomeCard: {
    borderLeftColor: '#10B981',
    borderLeftWidth: 4,
  },
  expenseCard: {
    borderLeftColor: '#EF4444',
    borderLeftWidth: 4,
  },
  balanceCard: {
    borderLeftColor: '#1E3A8A',
    borderLeftWidth: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryPeriod: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  positiveBalance: {
    color: '#10B981',
  },
  negativeBalance: {
    color: '#EF4444',
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  topTransactionCard: {
    marginHorizontal: 0,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  incomeText: {
    color: '#10B981',
  },
  expenseText: {
    color: '#EF4444',
  },
  topTransactionsContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

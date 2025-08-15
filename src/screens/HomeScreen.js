import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../contexts/FinanceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { LinearGradient } from 'expo-linear-gradient';
import HeaderCard from '../components/HeaderCard';
import EmptyState from '../components/EmptyState';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { balance, income, expenses, transactions, getMonthlyStats } = useFinance();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { formatCurrency } = useCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthlyStats = getMonthlyStats(currentYear, currentMonth);

  const getRecentTransactions = () => {
    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  const getCategoryIcon = (categoryName) => {
    // Mapear pelos nomes traduzidos
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
    // Mapear pelos nomes traduzidos
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

  return (
    <ScrollView style={styles.container}>
      {/* Premium Banner */}
      <TouchableOpacity style={styles.premiumBanner} onPress={() => {
        Alert.alert(
          t('premium.title'),
          t('premium.description'),
          [
            { text: t('premium.cancel'), style: 'cancel' },
            { text: t('premium.subscribe'), onPress: () => console.log('Implementar assinatura') }
          ]
        );
      }}>
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.premiumGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.premiumContent}>
            <Ionicons name="diamond" size={20} color="#FFFFFF" />
            <Text style={styles.premiumText}>{t('premium.upgradeToPremium')}</Text>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Header com saldo */}
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{t('home.currentBalance')}</Text>
        <Text style={styles.balanceText}>{formatCurrency(balance)}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Ionicons name="arrow-up-circle" size={24} color="#10B981" />
            <Text style={styles.summaryLabel}>{t('home.income')}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(income)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="arrow-down-circle" size={24} color="#EF4444" />
            <Text style={styles.summaryLabel}>{t('home.expenses')}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(expenses)}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Estatísticas do mês */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>{t('home.thisMonth')}</Title>
          <View style={styles.monthlyStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('home.income')}</Text>
              <Text style={[styles.statValue, styles.incomeText]}>
                {formatCurrency(monthlyStats.income)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('home.expenses')}</Text>
              <Text style={[styles.statValue, styles.expenseText]}>
                {formatCurrency(monthlyStats.expenses)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('home.balance')}</Text>
              <Text style={[styles.statValue, monthlyStats.balance >= 0 ? styles.incomeText : styles.expenseText]}>
                {formatCurrency(monthlyStats.balance)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>



      {/* Transações recentes */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>{t('home.recentTransactions')}</Title>
          {getRecentTransactions().length > 0 ? (
            getRecentTransactions().map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(transaction.categoryName) }]}>
                    <Ionicons 
                      name={getCategoryIcon(transaction.categoryName)} 
                      size={20} 
                      color="white" 
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{transaction.title}</Text>
                    <Text style={styles.transactionCategory}>{transaction.categoryName}</Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'income' ? styles.incomeText : styles.expenseText
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>{t('home.noTransactions')}</Text>
              <Text style={styles.emptyStateSubtext}>{t('home.addFirstTransaction')}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Ações rápidas */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Transactions')}
        >
          <Ionicons name="list" size={24} color="#1E3A8A" />
          <Text style={styles.quickActionText}>{t('home.viewAll')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Reports')}
        >
          <Ionicons name="bar-chart" size={24} color="#1E3A8A" />
          <Text style={styles.quickActionText}>{t('navigation.reports')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Categories')}
        >
          <Ionicons name="grid" size={24} color="#1E3A8A" />
          <Text style={styles.quickActionText}>{t('navigation.categories')}</Text>
        </TouchableOpacity>
      </View>

      {/* Ações premium */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Accounts')}
        >
          <Ionicons name="card" size={24} color="#1E3A8A" />
          <Text style={styles.quickActionText}>{t('navigation.accounts')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Recurring')}
        >
          <Ionicons name="repeat" size={24} color="#1E3A8A" />
          <Text style={styles.quickActionText}>{t('navigation.recurring')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Export')}
        >
          <Ionicons name="download" size={24} color="#1E3A8A" />
          <Text style={styles.quickActionText}>{t('export.title')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings" size={24} color="#1E3A8A" />
          <Text style={styles.quickActionText}>{t('navigation.settings')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  balanceText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    opacity: 0.9,
  },
  summaryValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  card: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#10B981',
  },
  expenseText: {
    color: '#EF4444',
  },
  premiumBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  premiumGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
    textAlign: 'center',
  },

  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  transactionLeft: {
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
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
    marginBottom: 32,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    minWidth: 80,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '500',
  },
});

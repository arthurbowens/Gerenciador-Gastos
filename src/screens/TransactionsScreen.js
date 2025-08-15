import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Title, Chip, FAB, Searchbar, Menu, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../contexts/FinanceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';

export default function TransactionsScreen({ navigation }) {
  const { transactions, deleteTransaction, categories } = useFinance();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { formatCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [menuVisible, setMenuVisible] = useState(false);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filtrar por busca
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'amount') {
        return b.amount - a.amount;
      } else if (sortBy === 'category') {
        return a.categoryName.localeCompare(b.categoryName);
      }
      return 0;
    });

    return filtered;
  }, [transactions, searchQuery, filterType, sortBy]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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

  const handleDeleteTransaction = (transactionId) => {
    Alert.alert(
      t('categories.confirmDelete'),
      t('categories.confirmDeleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => deleteTransaction(transactionId)
        },
      ]
    );
  };

  const renderTransactionItem = ({ item }) => (
    <Card style={styles.transactionCard}>
      <Card.Content>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionLeft}>
            <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(item.categoryName) }]}>
              <Ionicons 
                name={getCategoryIcon(item.categoryName)} 
                size={20} 
                color="white" 
              />
            </View>
            <View style={styles.transactionInfo}>
              <Title style={styles.transactionTitle}>{item.title}</Title>
              <Text style={styles.transactionCategory}>{item.categoryName}</Text>
              <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
            </View>
          </View>
          
          <View style={styles.transactionRight}>
            <Text style={[
              styles.transactionAmount,
              item.type === 'income' ? styles.incomeText : styles.expenseText
            ]}>
              {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
            
            <View style={styles.transactionActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AddTransaction', { transaction: item })}
              >
                <Ionicons name="pencil" size={16} color="#6B7280" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteTransaction(item.id)}
              >
                <Ionicons name="trash" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyStateTitle}>{t('home.noTransactions')}</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery || filterType !== 'all' 
          ? 'Tente ajustar os filtros ou a busca'
          : t('home.addFirstTransaction')
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filtros e busca */}
      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder={`${t('common.search')} ${t('navigation.transactions').toLowerCase()}...`}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <View style={styles.filterChips}>
          <Chip
            selected={filterType === 'all'}
            onPress={() => setFilterType('all')}
            style={styles.filterChip}
          >
            {t('reports.transactions')}
          </Chip>
          <Chip
            selected={filterType === 'income'}
            onPress={() => setFilterType('income')}
            style={styles.filterChip}
            textStyle={{ color: '#10B981' }}
          >
            {t('home.income')}
          </Chip>
          <Chip
            selected={filterType === 'expense'}
            onPress={() => setFilterType('expense')}
            style={styles.filterChip}
            textStyle={{ color: '#EF4444' }}
          >
            {t('home.expenses')}
          </Chip>
        </View>

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>{t('common.sortBy')}:</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.sortButton}
                onPress={() => setMenuVisible(true)}
              >
                <Text style={styles.sortButtonText}>
                  {sortBy === 'date' ? t('common.date') : sortBy === 'amount' ? t('addTransaction.amount') : t('addTransaction.category')}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setSortBy('date');
                setMenuVisible(false);
              }}
              title={t('common.date')}
            />
            <Menu.Item
              onPress={() => {
                setSortBy('amount');
                setMenuVisible(false);
              }}
              title={t('addTransaction.amount')}
            />
            <Menu.Item
              onPress={() => {
                setSortBy('category');
                setMenuVisible(false);
              }}
              title={t('addTransaction.category')}
            />
          </Menu>
        </View>
      </View>

      {/* Lista de transações */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.transactionsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* FAB para adicionar transação */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddTransaction')}
        label={t('home.newTransaction')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: 16,
    elevation: 2,
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  filterChips: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 4,
  },
  transactionsList: {
    padding: 16,
  },
  transactionCard: {
    marginBottom: 12,
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  incomeText: {
    color: '#10B981',
  },
  expenseText: {
    color: '#EF4444',
  },
  transactionActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#374151',
    marginTop: 16,
    fontWeight: '600',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

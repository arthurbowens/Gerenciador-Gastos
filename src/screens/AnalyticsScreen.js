import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { 
  Card, 
  Title, 
  Chip,
  ProgressBar,
  Divider
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useCurrency } from '../contexts/CurrencyContext';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { 
    monthlyTrends,
    categoryAnalytics,
    predictions,
    insights,
    accountAnalytics,
    getSpendingPattern
  } = useAnalytics();
  const { formatCurrency } = useCurrency();

  const [selectedPeriod, setSelectedPeriod] = useState('trends');

  const getInsightColor = (type) => {
    switch (type) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'danger': return '#EF4444';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return 'trending-up';
      case 'decreasing': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return '#EF4444';
      case 'decreasing': return '#10B981';
      default: return '#6B7280';
    }
  };

  const renderInsightsCard = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Title style={styles.sectionTitle}>{t('analytics.insights')}</Title>
        
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <View style={styles.insightHeader}>
                <Ionicons 
                  name={insight.icon} 
                  size={24} 
                  color={insight.color} 
                  style={styles.insightIcon}
                />
                <Text style={[styles.insightTitle, { color: insight.color }]}>
                  {insight.title}
                </Text>
              </View>
              <Text style={styles.insightDescription}>
                {insight.description}
              </Text>
              {index < insights.length - 1 && <Divider style={styles.insightDivider} />}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>{t('analytics.noInsights')}</Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderPredictionsCard = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Title style={styles.sectionTitle}>{t('analytics.predictions')}</Title>
        
        <View style={styles.predictionContainer}>
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>{t('analytics.confidence')}</Text>
            <Chip 
              style={[
                styles.confidenceChip,
                { backgroundColor: predictions.confidence === 'high' ? '#10B981' : 
                  predictions.confidence === 'medium' ? '#F59E0B' : '#EF4444' }
              ]}
              textStyle={{ 
                color: 'white', 
                fontSize: 14, 
                fontWeight: '600',
                textAlign: 'center' 
              }}
            >
              {t(`analytics.${predictions.confidence}`)}
            </Chip>
          </View>

          <View style={styles.predictionItems}>
            <View style={styles.predictionItem}>
              <Text style={styles.predictionLabel}>{t('analytics.nextMonthIncome')}</Text>
              <Text style={[styles.predictionValue, styles.incomeText]}>
                {formatCurrency(predictions.nextMonthIncome)}
              </Text>
            </View>

            <View style={styles.predictionItem}>
              <Text style={styles.predictionLabel}>{t('analytics.nextMonthExpenses')}</Text>
              <Text style={[styles.predictionValue, styles.expenseText]}>
                {formatCurrency(predictions.nextMonthExpenses)}
              </Text>
            </View>

            <View style={styles.predictionItem}>
              <Text style={styles.predictionLabel}>{t('analytics.nextMonthBalance')}</Text>
              <Text style={[
                styles.predictionValue,
                predictions.nextMonthBalance >= 0 ? styles.incomeText : styles.expenseText
              ]}>
                {formatCurrency(predictions.nextMonthBalance)}
              </Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCategoryAnalyticsCard = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Title style={styles.sectionTitle}>{t('analytics.categoryAnalysis')}</Title>
        
        {categoryAnalytics.slice(0, 5).map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <View style={styles.categoryTrend}>
                <Ionicons 
                  name={getTrendIcon(category.trend)} 
                  size={16} 
                  color={getTrendColor(category.trend)}
                />
                <Text style={styles.categoryAmount}>
                  {formatCurrency(category.totalAmount)}
                </Text>
              </View>
            </View>
            
            <View style={styles.categoryStats}>
              <Text style={styles.categoryStatText}>
                {t('analytics.transactions')}: {category.transactionCount}
              </Text>
              <Text style={styles.categoryStatText}>
                {t('analytics.average')}: {formatCurrency(category.averageAmount)}
              </Text>
            </View>
            
            {index < categoryAnalytics.slice(0, 5).length - 1 && (
              <Divider style={styles.categoryDivider} />
            )}
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderMonthlyTrendsCard = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Title style={styles.sectionTitle}>{t('analytics.monthlyTrends')}</Title>
        
        {monthlyTrends.slice(-6).map((month, index) => (
          <View key={index} style={styles.trendItem}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendMonth}>
                {new Date(month.month + '-01').toLocaleDateString('pt-BR', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </Text>
              <Text style={[
                styles.trendBalance,
                month.balance >= 0 ? styles.incomeText : styles.expenseText
              ]}>
                {formatCurrency(month.balance)}
              </Text>
            </View>
            
            <View style={styles.trendDetails}>
              <View style={styles.trendDetailRow}>
                <Text style={styles.trendDetailLabel}>{t('home.income')}:</Text>
                <Text style={styles.trendDetailValue}>{formatCurrency(month.income)}</Text>
              </View>
              <View style={styles.trendDetailRow}>
                <Text style={styles.trendDetailLabel}>{t('home.expenses')}:</Text>
                <Text style={styles.trendDetailValue}>{formatCurrency(month.expenses)}</Text>
              </View>
              <View style={styles.trendDetailRow}>
                <Text style={styles.trendDetailLabel}>{t('analytics.savingsRate')}:</Text>
                <Text style={styles.trendDetailValue}>{month.savings.toFixed(1)}%</Text>
              </View>
            </View>
            
            <ProgressBar 
              progress={Math.min(month.savings / 100, 1)}
              color={month.savings > 20 ? '#10B981' : month.savings > 10 ? '#F59E0B' : '#EF4444'}
              style={styles.savingsProgress}
            />
            
            {index < monthlyTrends.slice(-6).length - 1 && (
              <Divider style={styles.trendDivider} />
            )}
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderAccountAnalyticsCard = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Title style={styles.sectionTitle}>{t('analytics.accountAnalysis')}</Title>
        
        {accountAnalytics.map((account, index) => (
          <View key={index} style={styles.accountItem}>
            <View style={styles.accountHeader}>
              <View style={[styles.accountIcon, { backgroundColor: account.color }]}>
                <Ionicons name={account.icon} size={20} color="white" />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountBalance}>
                  {formatCurrency(account.balance)}
                </Text>
              </View>
              <Chip 
                style={[
                  styles.usageChip,
                  { backgroundColor: account.usage === 'active' ? '#10B981' : '#9CA3AF' }
                ]}
                textStyle={{ 
                  color: 'white', 
                  fontSize: 12, 
                  fontWeight: '600',
                  textAlign: 'center' 
                }}
              >
                {account.totalTransactions}
              </Chip>
            </View>
            
            <View style={styles.accountStats}>
              <Text style={styles.accountStatText}>
                {t('analytics.totalIncome')}: {formatCurrency(account.totalIncome)}
              </Text>
              <Text style={styles.accountStatText}>
                {t('analytics.totalExpenses')}: {formatCurrency(account.totalExpenses)}
              </Text>
            </View>
            
            {index < accountAnalytics.length - 1 && (
              <Divider style={styles.accountDivider} />
            )}
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderInsightsCard()}
        {renderPredictionsCard()}
        {renderCategoryAnalyticsCard()}
        {renderMonthlyTrendsCard()}
        {renderAccountAnalyticsCard()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  sectionCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  // Insights
  insightItem: {
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  insightDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  insightDivider: {
    marginTop: 16,
  },
  // Predictions
  predictionContainer: {
    marginTop: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#374151',
  },
  confidenceChip: {
    minHeight: 32,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  predictionItems: {
    gap: 12,
  },
  predictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeText: {
    color: '#10B981',
  },
  expenseText: {
    color: '#EF4444',
  },
  // Categories
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  categoryTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryStatText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  categoryDivider: {
    marginTop: 16,
  },
  // Trends
  trendItem: {
    marginBottom: 20,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  trendBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
  trendDetails: {
    gap: 4,
    marginBottom: 12,
  },
  trendDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  trendDetailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  savingsProgress: {
    height: 6,
    borderRadius: 3,
  },
  trendDivider: {
    marginTop: 20,
  },
  // Accounts
  accountItem: {
    marginBottom: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  accountBalance: {
    fontSize: 14,
    color: '#6B7280',
  },
  usageChip: {
    minHeight: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  accountStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 48,
  },
  accountStatText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  accountDivider: {
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    paddingVertical: 20,
  },
});

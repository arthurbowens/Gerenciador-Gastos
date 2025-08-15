import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';

const { width: screenWidth } = Dimensions.get('window');

// Configuração base dos gráficos
const getChartConfig = (theme) => ({
  backgroundGradientFrom: theme.colors.surface,
  backgroundGradientTo: theme.colors.surface,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  style: {
    borderRadius: 16,
  },
  propsForLabels: {
    fontSize: 10,
    fontWeight: '600',
  },
});

// Gráfico de Pizza para despesas por categoria
export const ExpensesPieChart = ({ data, title }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();

  // Validações robustas
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  try {
    // Cores vibrantes para as fatias
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#FFB347', '#87CEEB', '#F0E68C'
    ];

    const chartData = data
      .filter(item => item && typeof item.amount === 'number' && item.amount > 0)
      .map((item, index) => ({
        name: String(item.name || '').length > 10 ? String(item.name).substring(0, 10) + '...' : String(item.name || ''),
        amount: Number(item.amount) || 0,
        color: colors[index % colors.length],
        legendFontColor: theme.colors.text || '#000000',
        legendFontSize: 12,
      }));

    if (chartData.length === 0) {
      return null;
    }

    return (
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={getChartConfig(theme)}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 50]}
          absolute
        />
      </View>
    );
  } catch (error) {
    console.error('Erro no ExpensesPieChart:', error);
    return null;
  }
};

// Gráfico de Barras para receitas vs despesas mensais
export const MonthlyBarChart = ({ data, title }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Validações robustas
  if (!data || !data.datasets || !Array.isArray(data.datasets) || data.datasets.length === 0) {
    return null;
  }

  if (!data.labels || !Array.isArray(data.labels) || data.labels.length === 0) {
    return null;
  }

  try {
    // Validar dados dos datasets
    const validDatasets = data.datasets.filter(dataset => 
      dataset && Array.isArray(dataset.data) && dataset.data.length > 0
    );

    if (validDatasets.length === 0) {
      return null;
    }

    const chartData = {
      ...data,
      datasets: validDatasets.map(dataset => ({
        ...dataset,
        data: dataset.data.map(value => Number(value) || 0)
      }))
    };

    return (
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            ...getChartConfig(theme),
            backgroundGradientFrom: theme.colors.surface || '#FFFFFF',
            backgroundGradientTo: theme.colors.surface || '#FFFFFF',
            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          }}
          verticalLabelRotation={30}
          showBarTops={false}
          fromZero
        />
      </View>
    );
  } catch (error) {
    console.error('Erro no MonthlyBarChart:', error);
    return null;
  }
};

// Gráfico de Linha para evolução do saldo
export const BalanceLineChart = ({ data, title }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Validações robustas
  if (!data || !data.datasets || !Array.isArray(data.datasets) || data.datasets.length === 0) {
    return null;
  }

  if (!data.labels || !Array.isArray(data.labels) || data.labels.length === 0) {
    return null;
  }

  try {
    // Validar dados dos datasets
    const validDatasets = data.datasets.filter(dataset => 
      dataset && Array.isArray(dataset.data) && dataset.data.length > 0
    );

    if (validDatasets.length === 0) {
      return null;
    }

    const chartData = {
      ...data,
      datasets: validDatasets.map(dataset => ({
        ...dataset,
        data: dataset.data.map(value => Number(value) || 0)
      }))
    };

    return (
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            ...getChartConfig(theme),
            color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
            strokeWidth: 3,
            backgroundGradientFrom: theme.colors.surface || '#FFFFFF',
            backgroundGradientTo: theme.colors.surface || '#FFFFFF',
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  } catch (error) {
    console.error('Erro no BalanceLineChart:', error);
    return null;
  }
};

// Gráfico de Pizza pequeno para resumo
export const MiniPieChart = ({ data, size = 120 }) => {
  const { theme } = useTheme();

  if (!data || data.length === 0) {
    return null;
  }

  const colors = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];

  const chartData = data.map((item, index) => ({
    name: item.name,
    amount: item.amount,
    color: colors[index % colors.length],
    legendFontColor: 'transparent',
    legendFontSize: 0,
  }));

  return (
    <View style={[styles.miniChartContainer, { width: size, height: size }]}>
      <PieChart
        data={chartData}
        width={size}
        height={size}
        chartConfig={getChartConfig(theme)}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="0"
        absolute
        hasLegend={false}
      />
    </View>
  );
};

// Gráfico de progresso circular
export const CircularProgress = ({ percentage, size = 80, color = '#10B981' }) => {
  const { theme } = useTheme();
  
  const data = [
    {
      name: 'Progress',
      amount: percentage,
      color: color,
      legendFontColor: 'transparent',
      legendFontSize: 0,
    },
    {
      name: 'Remaining',
      amount: 100 - percentage,
      color: theme.colors.surface,
      legendFontColor: 'transparent', 
      legendFontSize: 0,
    }
  ];

  return (
    <View style={[styles.miniChartContainer, { width: size, height: size }]}>
      <PieChart
        data={data}
        width={size}
        height={size}
        chartConfig={getChartConfig(theme)}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="0"
        absolute
        hasLegend={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
    backgroundColor: 'transparent',
  },
  miniChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default {
  ExpensesPieChart,
  MonthlyBarChart,
  BalanceLineChart,
  MiniPieChart,
  CircularProgress,
};

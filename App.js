import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { FinanceProvider } from './src/contexts/FinanceContext';
import { BudgetProvider } from './src/contexts/BudgetContext';
import { AccountsProvider } from './src/contexts/AccountsContext';
import { RecurringProvider } from './src/contexts/RecurringContext';
import { ExportProvider } from './src/contexts/ExportContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { AnalyticsProvider } from './src/contexts/AnalyticsContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import { CurrencyProvider } from './src/contexts/CurrencyContext';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import { AdsProvider } from './src/contexts/AdsContext';
import { StatusBar } from 'expo-status-bar';
import ErrorBoundary from './src/components/ErrorBoundary';
import LoadingScreen from './src/components/LoadingScreen';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import AccountsScreen from './src/screens/AccountsScreen';
import RecurringScreen from './src/screens/RecurringScreen';
import ExportScreen from './src/screens/ExportScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ThemeCustomizationScreen from './src/screens/ThemeCustomizationScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import PremiumScreen from './src/screens/PremiumScreen';

// Icons
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Budget') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'menu' : 'menu-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.background,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('navigation.home') }} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ title: t('navigation.transactions') }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: t('navigation.reports') }} />
      <Tab.Screen name="Budget" component={BudgetScreen} options={{ title: t('budget.title') }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: t('analytics.title') }} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { theme, isDarkMode, isLoading: themeLoading } = useTheme();
  const { t, isLoading: languageLoading } = useLanguage();

  // Mostrar loading enquanto contextos carregam
  if (themeLoading || languageLoading) {
    return <LoadingScreen message="Carregando configurações..." />;
  }
  
  const paperTheme = {
    ...(isDarkMode ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDarkMode ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: theme.colors.primary,
      surface: theme.colors.surface,
      background: theme.colors.background,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <NotificationProvider>
        <FinanceProvider>
          <AccountsProvider>
            <BudgetProvider>
              <RecurringProvider>
                <ExportProvider>
                  <AnalyticsProvider>
                    <NavigationContainer>
          <StatusBar 
            style={isDarkMode ? "light" : "dark"} 
            backgroundColor={theme.colors.primary} 
          />
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: theme.colors.background,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Main" 
              component={TabNavigator} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AddTransaction" 
              component={AddTransactionScreen} 
              options={({ route }) => ({ 
                title: route.params?.transaction 
                  ? t('addTransaction.editTitle') 
                  : t('navigation.addTransaction'),
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: theme.colors.background
              })}
            />
            <Stack.Screen 
              name="Categories" 
              component={CategoriesScreen} 
              options={{ 
                title: t('navigation.categories'),
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: theme.colors.background
              }}
            />
            <Stack.Screen 
              name="Accounts" 
              component={AccountsScreen} 
              options={{ 
                title: t('navigation.accounts'),
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: theme.colors.background
              }}
            />
            <Stack.Screen 
              name="Recurring" 
              component={RecurringScreen} 
              options={{ 
                title: t('navigation.recurring'),
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: theme.colors.background
              }}
            />
            <Stack.Screen 
              name="Export" 
              component={ExportScreen} 
              options={{ 
                title: t('export.title'),
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: theme.colors.background
              }}
            />
            <Stack.Screen 
              name="ThemeCustomization" 
              component={ThemeCustomizationScreen} 
              options={{ 
                title: t('themes.title'),
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: theme.colors.background
              }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ 
                title: t('navigation.settings'),
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: theme.colors.background
              }}
            />
            <Stack.Screen 
              name="Premium" 
              component={PremiumScreen} 
              options={{ 
                title: 'Premium',
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: theme.colors.background
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
                  </AnalyticsProvider>
                </ExportProvider>
              </RecurringProvider>
            </BudgetProvider>
          </AccountsProvider>
        </FinanceProvider>
      </NotificationProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <SubscriptionProvider>
              <AdsProvider>
                <AppContent />
              </AdsProvider>
            </SubscriptionProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
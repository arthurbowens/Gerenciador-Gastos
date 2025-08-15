export const APP_INFO = {
  name: 'Controle Financeiro Pro',
  version: '1.0.0',
  buildNumber: '1',
  description: 'Gerencie suas finanças de forma inteligente e profissional',
  developer: 'Fernando Lopes',
  website: 'https://github.com/fernandolopes',
  supportEmail: 'support@financepro.com',
  privacyPolicy: 'https://financepro.com/privacy',
  termsOfService: 'https://financepro.com/terms',
  features: [
    '5 idiomas suportados',
    'Múltiplas contas e cartões',
    'Orçamento inteligente',
    'Transações recorrentes',
    'Análises avançadas',
    'Export/Import completo',
    '10 temas personalizados',
    'Notificações inteligentes',
    'Backup automático',
    'Interface moderna',
  ],
  supportedLanguages: ['pt', 'en', 'es', 'fr', 'de'],
  lastUpdated: '2024-01-15',
};

export const FEATURE_FLAGS = {
  enableNotifications: true,
  enableBudgets: true,
  enableMultipleAccounts: true,
  enableRecurringTransactions: true,
  enableAnalytics: true,
  enableExport: true,
  enableThemes: true,
  enableCloud: false, // Futuro
  enableCharts: false, // Em desenvolvimento
};

export const API_ENDPOINTS = {
  // Para futuras integrações
  base: 'https://api.financepro.com',
  auth: '/auth',
  sync: '/sync',
  backup: '/backup',
};

export const STORAGE_KEYS = {
  transactions: 'transactions',
  categories: 'categories',
  accounts: 'accounts',
  budgets: 'budgets',
  recurringTransactions: 'recurringTransactions',
  monthlyGoals: 'monthlyGoals',
  darkMode: 'darkMode',
  selectedTheme: 'selectedTheme',
  selectedLanguage: 'selectedLanguage',
  notificationSettings: 'notificationSettings',
  userPreferences: 'userPreferences',
};

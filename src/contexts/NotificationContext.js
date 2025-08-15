import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useLanguage } from './LanguageContext';

// Configurar notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    dailyReminder: false,
    budgetAlerts: true,
    weeklyReport: false,
    recurringReminder: true,
    reminderTime: '20:00', // 8 PM
  });
  const [permissionStatus, setPermissionStatus] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    initializeNotifications();
    loadNotificationSettings();
  }, []);

  const initializeNotifications = async () => {
    // Solicitar permissão
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    setPermissionStatus(finalStatus);

    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação negada');
      return;
    }

    // Configurar canal de notificação para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('financial', {
        name: 'Notificações Financeiras',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        setNotificationSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de notificação:', error);
    }
  };

  const saveNotificationSettings = async (settings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Erro ao salvar configurações de notificação:', error);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value };
    await saveNotificationSettings(newSettings);
    
    // Reagendar notificações se necessário
    if (key === 'enabled' || key === 'dailyReminder' || key === 'reminderTime') {
      await scheduleNotifications(newSettings);
    }
  };

  const scheduleNotifications = async (settings = notificationSettings) => {
    // Cancelar todas as notificações agendadas
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.enabled || permissionStatus !== 'granted') {
      return;
    }

    // Lembrete diário
    if (settings.dailyReminder) {
      await scheduleDailyReminder(settings.reminderTime);
    }

    // Relatório semanal
    if (settings.weeklyReport) {
      await scheduleWeeklyReport();
    }
  };

  const scheduleDailyReminder = async (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('notifications.dailyReminderTitle'),
        body: t('notifications.dailyReminderBody'),
        data: { type: 'daily_reminder' },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  };

  const scheduleWeeklyReport = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('notifications.weeklyReportTitle'),
        body: t('notifications.weeklyReportBody'),
        data: { type: 'weekly_report' },
      },
      trigger: {
        weekday: 1, // Segunda-feira
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  };

  const sendBudgetAlert = async (categoryName, percentage) => {
    if (!notificationSettings.budgetAlerts || permissionStatus !== 'granted') {
      return;
    }

    let title, body;
    
    if (percentage >= 100) {
      title = t('notifications.budgetExceededTitle');
      body = t('notifications.budgetExceededBody', { category: categoryName });
    } else if (percentage >= 80) {
      title = t('notifications.budgetWarningTitle');
      body = t('notifications.budgetWarningBody', { category: categoryName, percentage: Math.round(percentage) });
    } else {
      return; // Não enviar notificação se estiver abaixo de 80%
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { 
          type: 'budget_alert',
          category: categoryName,
          percentage 
        },
      },
      trigger: null, // Enviar imediatamente
    });
  };

  const sendRecurringReminder = async (transactionTitle) => {
    if (!notificationSettings.recurringReminder || permissionStatus !== 'granted') {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('notifications.recurringReminderTitle'),
        body: t('notifications.recurringReminderBody', { transaction: transactionTitle }),
        data: { 
          type: 'recurring_reminder',
          transaction: transactionTitle 
        },
      },
      trigger: null, // Enviar imediatamente
    });
  };

  const sendGoalAchievement = async (goalType, amount) => {
    if (permissionStatus !== 'granted') return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('notifications.goalAchievedTitle'),
        body: t('notifications.goalAchievedBody', { type: goalType, amount }),
        data: { 
          type: 'goal_achievement',
          goalType,
          amount 
        },
      },
      trigger: null,
    });
  };

  const testNotification = async () => {
    if (permissionStatus !== 'granted') {
      alert(t('notifications.permissionRequired'));
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('notifications.testTitle'),
        body: t('notifications.testBody'),
        data: { type: 'test' },
      },
      trigger: { seconds: 2 },
    });
  };

  const getScheduledNotifications = async () => {
    return await Notifications.getAllScheduledNotificationsAsync();
  };

  const value = {
    notificationSettings,
    permissionStatus,
    updateSetting,
    scheduleNotifications,
    sendBudgetAlert,
    sendRecurringReminder,
    sendGoalAchievement,
    testNotification,
    getScheduledNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

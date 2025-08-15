import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoadingScreen({ message = null }) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary}
        style={styles.spinner}
      />
      <Text style={[styles.message, { color: theme.colors.text }]}>
        {message || t('common.loading')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});

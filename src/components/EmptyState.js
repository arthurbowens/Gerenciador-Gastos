import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  actionText, 
  onActionPress,
  style 
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Ionicons 
        name={icon} 
        size={64} 
        color={theme.colors.textLight} 
        style={styles.icon}
      />
      
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {title}
      </Text>
      
      <Text style={[styles.description, { color: theme.colors.textLight }]}>
        {description}
      </Text>
      
      {actionText && onActionPress && (
        <Button
          mode="contained"
          onPress={onActionPress}
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
        >
          {actionText}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  icon: {
    marginBottom: 20,
    opacity: 0.6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 280,
  },
  actionButton: {
    minWidth: 160,
  },
});

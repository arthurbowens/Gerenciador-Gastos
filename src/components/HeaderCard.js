import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function HeaderCard({ 
  title, 
  subtitle, 
  value, 
  icon, 
  onPress,
  style,
  gradientColors,
  children 
}) {
  const { theme } = useTheme();
  
  const defaultGradient = [theme.colors.primary, theme.colors.secondary];
  const colors = gradientColors || defaultGradient;

  const Content = () => (
    <LinearGradient
      colors={colors}
      style={[styles.gradient, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color="white" />
          </View>
        )}
        
        <View style={styles.textContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {value && <Text style={styles.value}>{value}</Text>}
        </View>
        
        {children}
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Content />
      </TouchableOpacity>
    );
  }

  return <Content />;
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.7,
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

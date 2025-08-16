import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function LoadingScreen({ message = null }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size="large" 
        color="#1E3A8A"
        style={styles.spinner}
      />
      <Text style={styles.message}>
        {message || 'Carregando...'}
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
    backgroundColor: '#FFFFFF',
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    color: '#374151',
  },
});

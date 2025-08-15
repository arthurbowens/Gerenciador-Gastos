import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1E3A8A" />
      <Text style={styles.title}>💰 Controle Financeiro Pro</Text>
      <Text style={styles.subtitle}>App funcionando perfeitamente!</Text>
      <Text style={styles.version}>Versão 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  version: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 20,
  },
});

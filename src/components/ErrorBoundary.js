import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Card style={styles.errorCard}>
            <Card.Content style={styles.errorContent}>
              <Ionicons 
                name="alert-circle" 
                size={64} 
                color="#EF4444" 
                style={styles.errorIcon}
              />
              
              <Text style={styles.errorTitle}>
                Ops! Algo deu errado
              </Text>
              
              <Text style={styles.errorMessage}>
                Ocorreu um erro inesperado. Tente reiniciar o aplicativo.
              </Text>
              
              <Button
                mode="contained"
                onPress={() => this.setState({ hasError: false })}
                style={styles.retryButton}
                buttonColor="#3B82F6"
              >
                Tentar Novamente
              </Button>
            </Card.Content>
          </Card>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  errorCard: {
    width: '100%',
    maxWidth: 400,
    elevation: 4,
  },
  errorContent: {
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 150,
  },
});

export default ErrorBoundary;

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Lista de moedas suportadas
export const SUPPORTED_CURRENCIES = {
  BRL: {
    code: 'BRL',
    name: 'Real Brasileiro',
    symbol: 'R$',
    locale: 'pt-BR',
    flag: '🇧🇷'
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    locale: 'en-US',
    flag: '🇺🇸'
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    locale: 'de-DE',
    flag: '🇪🇺'
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    locale: 'en-GB',
    flag: '🇬🇧'
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    locale: 'ja-JP',
    flag: '🇯🇵'
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    locale: 'en-CA',
    flag: '🇨🇦'
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    locale: 'en-AU',
    flag: '🇦🇺'
  },
  CHF: {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    locale: 'de-CH',
    flag: '🇨🇭'
  },
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    locale: 'zh-CN',
    flag: '🇨🇳'
  },
  MXN: {
    code: 'MXN',
    name: 'Mexican Peso',
    symbol: '$',
    locale: 'es-MX',
    flag: '🇲🇽'
  },
  ARS: {
    code: 'ARS',
    name: 'Argentine Peso',
    symbol: '$',
    locale: 'es-AR',
    flag: '🇦🇷'
  },
  CLP: {
    code: 'CLP',
    name: 'Chilean Peso',
    symbol: '$',
    locale: 'es-CL',
    flag: '🇨🇱'
  },
  COP: {
    code: 'COP',
    name: 'Colombian Peso',
    symbol: '$',
    locale: 'es-CO',
    flag: '🇨🇴'
  },
  PEN: {
    code: 'PEN',
    name: 'Peruvian Sol',
    symbol: 'S/',
    locale: 'es-PE',
    flag: '🇵🇪'
  }
};

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState('BRL');
  const [isLoading, setIsLoading] = useState(true);

  // Carregar moeda salva
  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const savedCurrency = await AsyncStorage.getItem('selectedCurrency');
      if (savedCurrency && SUPPORTED_CURRENCIES[savedCurrency]) {
        setCurrentCurrency(savedCurrency);
      }
    } catch (error) {
      console.error('Erro ao carregar moeda:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeCurrency = async (currencyCode) => {
    try {
      if (SUPPORTED_CURRENCIES[currencyCode]) {
        setCurrentCurrency(currencyCode);
        await AsyncStorage.setItem('selectedCurrency', currencyCode);
      }
    } catch (error) {
      console.error('Erro ao salvar moeda:', error);
    }
  };

  // Função para formatar valores com a moeda atual
  const formatCurrency = (value, currencyCode = currentCurrency) => {
    if (value === null || value === undefined || isNaN(value)) {
      const currency = SUPPORTED_CURRENCIES[currencyCode];
      return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currencyCode,
      }).format(0);
    }
    
    const currency = SUPPORTED_CURRENCIES[currencyCode];
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  };

  // Obter informações da moeda atual
  const getCurrentCurrency = () => {
    return SUPPORTED_CURRENCIES[currentCurrency];
  };

  // Obter lista de moedas ordenada por nome
  const getCurrencyList = () => {
    return Object.values(SUPPORTED_CURRENCIES).sort((a, b) => a.name.localeCompare(b.name));
  };

  const value = {
    currentCurrency,
    changeCurrency,
    formatCurrency,
    getCurrentCurrency,
    getCurrencyList,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    isLoading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

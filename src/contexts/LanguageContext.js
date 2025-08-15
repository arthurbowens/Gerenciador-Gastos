import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { languages, defaultLanguage } from '../locales';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar idioma salvo
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage && languages[savedLanguage]) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Erro ao carregar idioma:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (languageCode) => {
    try {
      if (languages[languageCode]) {
        setCurrentLanguage(languageCode);
        await AsyncStorage.setItem('selectedLanguage', languageCode);
      }
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
    }
  };

  // Função para obter tradução com fallback e interpolação
  const t = (key, variables = {}) => {
    const keys = key.split('.');
    let translation = languages[currentLanguage].translations;
    
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        // Fallback para português se a tradução não existir
        translation = languages[defaultLanguage].translations;
        for (const k of keys) {
          if (translation && translation[k]) {
            translation = translation[k];
          } else {
            return key; // Retorna a chave se não encontrar tradução
          }
        }
        break;
      }
    }
    
    let result = translation || key;
    
    // Interpolação de variáveis
    if (typeof result === 'string' && Object.keys(variables).length > 0) {
      Object.keys(variables).forEach(variable => {
        const placeholder = `{${variable}}`;
        result = result.replace(new RegExp(placeholder, 'g'), variables[variable]);
      });
    }
    
    return result;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    languages,
    isLoading,
    currentLanguageName: languages[currentLanguage]?.name || 'Português',
    currentLanguageFlag: languages[currentLanguage]?.flag || '🇧🇷',
  };



  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

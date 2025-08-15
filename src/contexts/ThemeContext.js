import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, DarkColors } from '../constants/Colors';
import { customThemes, isThemeDark } from '../constants/CustomThemes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const [isLoading, setIsLoading] = useState(true);

  // Carregar tema salvo
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      const savedCustomTheme = await AsyncStorage.getItem('selectedTheme');
      
      if (savedDarkMode !== null) {
        setIsDarkMode(JSON.parse(savedDarkMode));
      }
      if (savedCustomTheme !== null) {
        setSelectedTheme(savedCustomTheme);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('darkMode', JSON.stringify(newMode));
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const changeTheme = async (themeKey) => {
    try {
      setSelectedTheme(themeKey);
      await AsyncStorage.setItem('selectedTheme', themeKey);
      
      // Automaticamente definir modo escuro baseado no tema
      const isThemeAutoDark = isThemeDark(themeKey);
      if (isThemeAutoDark !== isDarkMode) {
        setIsDarkMode(isThemeAutoDark);
        await AsyncStorage.setItem('darkMode', JSON.stringify(isThemeAutoDark));
      }
    } catch (error) {
      console.error('Erro ao salvar tema personalizado:', error);
    }
  };

  // Usar tema personalizado se disponível, senão usar padrão
  const getCurrentTheme = () => {
    if (customThemes[selectedTheme]) {
      return customThemes[selectedTheme];
    }
    return {
      colors: isDarkMode ? DarkColors : Colors,
    };
  };

  const theme = {
    ...getCurrentTheme(),
    isDark: isDarkMode,
  };

  const value = {
    theme,
    isDarkMode,
    selectedTheme,
    customThemes,
    toggleDarkMode,
    changeTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const customThemes = {
  // Tema padrão azul
  blue: {
    name: 'Azul Clássico',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#60A5FA',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#1F2937',
      textLight: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      income: '#10B981',
      expense: '#EF4444',
    },
  },

  // Tema verde
  green: {
    name: 'Verde Natureza',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#34D399',
      background: '#FFFFFF',
      surface: '#F0FDF4',
      text: '#1F2937',
      textLight: '#6B7280',
      border: '#D1FAE5',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      income: '#10B981',
      expense: '#EF4444',
    },
  },

  // Tema roxo
  purple: {
    name: 'Roxo Elegante',
    colors: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#A78BFA',
      background: '#FFFFFF',
      surface: '#FAF5FF',
      text: '#1F2937',
      textLight: '#6B7280',
      border: '#E9D5FF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      income: '#10B981',
      expense: '#EF4444',
    },
  },

  // Tema laranja
  orange: {
    name: 'Laranja Energético',
    colors: {
      primary: '#F97316',
      secondary: '#EA580C',
      accent: '#FB923C',
      background: '#FFFFFF',
      surface: '#FFF7ED',
      text: '#1F2937',
      textLight: '#6B7280',
      border: '#FED7AA',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      income: '#10B981',
      expense: '#EF4444',
    },
  },

  // Tema rosa
  pink: {
    name: 'Rosa Moderno',
    colors: {
      primary: '#EC4899',
      secondary: '#DB2777',
      accent: '#F472B6',
      background: '#FFFFFF',
      surface: '#FDF2F8',
      text: '#1F2937',
      textLight: '#6B7280',
      border: '#FBCFE8',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      income: '#10B981',
      expense: '#EF4444',
    },
  },

  // Tema cinza minimalista
  gray: {
    name: 'Cinza Minimalista',
    colors: {
      primary: '#374151',
      secondary: '#1F2937',
      accent: '#6B7280',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#1F2937',
      textLight: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      income: '#10B981',
      expense: '#EF4444',
    },
  },

  // Tema escuro azul
  blueDark: {
    name: 'Azul Escuro',
    colors: {
      primary: '#60A5FA',
      secondary: '#3B82F6',
      accent: '#93C5FD',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
      textLight: '#94A3B8',
      border: '#334155',
      success: '#22C55E',
      warning: '#EAB308',
      error: '#F87171',
      income: '#22C55E',
      expense: '#F87171',
    },
  },

  // Tema escuro verde
  greenDark: {
    name: 'Verde Escuro',
    colors: {
      primary: '#34D399',
      secondary: '#10B981',
      accent: '#6EE7B7',
      background: '#064E3B',
      surface: '#065F46',
      text: '#ECFDF5',
      textLight: '#A7F3D0',
      border: '#047857',
      success: '#22C55E',
      warning: '#EAB308',
      error: '#F87171',
      income: '#22C55E',
      expense: '#F87171',
    },
  },

  // Tema escuro roxo
  purpleDark: {
    name: 'Roxo Escuro',
    colors: {
      primary: '#A78BFA',
      secondary: '#8B5CF6',
      accent: '#C4B5FD',
      background: '#1E1B3A',
      surface: '#2D2548',
      text: '#F5F3FF',
      textLight: '#C4B5FD',
      border: '#4C1D95',
      success: '#22C55E',
      warning: '#EAB308',
      error: '#F87171',
      income: '#22C55E',
      expense: '#F87171',
    },
  },

  // Tema OLED (preto total)
  oled: {
    name: 'OLED Preto',
    colors: {
      primary: '#FFFFFF',
      secondary: '#E5E7EB',
      accent: '#9CA3AF',
      background: '#000000',
      surface: '#111111',
      text: '#FFFFFF',
      textLight: '#9CA3AF',
      border: '#374151',
      success: '#22C55E',
      warning: '#EAB308',
      error: '#F87171',
      income: '#22C55E',
      expense: '#F87171',
    },
  },
};

export const getThemePreview = (themeKey) => {
  const theme = customThemes[themeKey];
  if (!theme) return null;

  return {
    name: theme.name,
    primary: theme.colors.primary,
    background: theme.colors.background,
    surface: theme.colors.surface,
    isDark: theme.colors.background === '#000000' || 
            theme.colors.background === '#0F172A' || 
            theme.colors.background === '#064E3B' ||
            theme.colors.background === '#1E1B3A',
  };
};

export const isThemeDark = (themeKey) => {
  const theme = customThemes[themeKey];
  if (!theme) return false;
  
  return theme.colors.background === '#000000' || 
         theme.colors.background === '#0F172A' || 
         theme.colors.background === '#064E3B' ||
         theme.colors.background === '#1E1B3A';
};

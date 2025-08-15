import { Colors, DarkColors } from './Colors';

export const Theme = {
  light: {
    colors: Colors,
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      round: 50,
    },
    typography: {
      h1: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 40,
      },
      h2: {
        fontSize: 28,
        fontWeight: 'bold',
        lineHeight: 36,
      },
      h3: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
      },
      h4: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
      },
      h5: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
      },
      h6: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
      },
      body1: {
        fontSize: 16,
        fontWeight: 'normal',
        lineHeight: 24,
      },
      body2: {
        fontSize: 14,
        fontWeight: 'normal',
        lineHeight: 20,
      },
      caption: {
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: 16,
      },
      button: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
      },
    },
    shadows: {
      small: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
      },
    },
  },
  dark: {
    colors: DarkColors,
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      round: 50,
    },
    typography: {
      h1: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 40,
      },
      h2: {
        fontSize: 28,
        fontWeight: 'bold',
        lineHeight: 36,
      },
      h3: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
      },
      h4: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
      },
      h5: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
      },
      h6: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
      },
      body1: {
        fontSize: 16,
        fontWeight: 'normal',
        lineHeight: 24,
      },
      body2: {
        fontSize: 14,
        fontWeight: 'normal',
        lineHeight: 20,
      },
      caption: {
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: 16,
      },
      button: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
      },
    },
    shadows: {
      small: {
        shadowColor: DarkColors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: DarkColors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: DarkColors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 8,
      },
    },
  },
};

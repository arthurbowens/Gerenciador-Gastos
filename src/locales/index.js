import pt from './pt';
import en from './en';
import es from './es';
import fr from './fr';
import de from './de';

export const languages = {
  pt: {
    name: 'Português',
    flag: '🇧🇷',
    translations: pt,
  },
  en: {
    name: 'English',
    flag: '🇺🇸',
    translations: en,
  },
  es: {
    name: 'Español',
    flag: '🇪🇸',
    translations: es,
  },
  fr: {
    name: 'Français',
    flag: '🇫🇷',
    translations: fr,
  },
  de: {
    name: 'Deutsch',
    flag: '🇩🇪',
    translations: de,
  },
};

export const defaultLanguage = 'pt';

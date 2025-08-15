/**
 * Utilitários de formatação
 */

/**
 * Formata um valor numérico como moeda (agora usando CurrencyContext)
 * NOTA: Esta função é mantida para compatibilidade, mas use useCurrency().formatCurrency() quando possível
 * @param {number} value - Valor a ser formatado
 * @param {string} currencyCode - Código da moeda (padrão: BRL)
 * @param {string} locale - Locale para formatação (padrão: pt-BR)
 * @returns {string} Valor formatado como moeda
 */
export const formatCurrency = (value, currencyCode = 'BRL', locale = 'pt-BR') => {
  if (value === null || value === undefined || isNaN(value)) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(0);
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
};

/**
 * Formata um número como porcentagem
 * @param {number} value - Valor a ser formatado (0-1 ou 0-100)
 * @param {boolean} isDecimal - Se o valor está em decimal (0-1) ou porcentagem (0-100)
 * @returns {string} Valor formatado como porcentagem (ex: "12,34%")
 */
export const formatPercentage = (value, isDecimal = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  const percentage = isDecimal ? value * 100 : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(percentage / 100);
};

/**
 * Formata uma data para o padrão brasileiro
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada (ex: "31/12/2023")
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
};

/**
 * Formata uma data e hora para o padrão brasileiro
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data e hora formatadas (ex: "31/12/2023 14:30")
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

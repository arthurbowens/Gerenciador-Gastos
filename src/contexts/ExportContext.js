import React, { createContext, useContext } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { useLanguage } from './LanguageContext';
import { useFinance } from './FinanceContext';
import { useBudget } from './BudgetContext';
import { useAccounts } from './AccountsContext';
import { useRecurring } from './RecurringContext';

const ExportContext = createContext();

export const useExport = () => {
  const context = useContext(ExportContext);
  if (!context) {
    throw new Error('useExport must be used within an ExportProvider');
  }
  return context;
};

export const ExportProvider = ({ children }) => {
  const { t } = useLanguage();
  const { transactions, categories } = useFinance();
  const { budgets, monthlyGoals } = useBudget();
  const { accounts } = useAccounts();
  const { recurringTransactions } = useRecurring();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const generateCSV = (data, headers) => {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value || '';
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const exportTransactionsCSV = async (startDate = null, endDate = null) => {
    try {
      let filteredTransactions = [...transactions];
      
      // Filtrar por período se especificado
      if (startDate || endDate) {
        filteredTransactions = transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          if (startDate && transactionDate < new Date(startDate)) return false;
          if (endDate && transactionDate > new Date(endDate)) return false;
          return true;
        });
      }

      const headers = ['date', 'title', 'amount', 'type', 'category', 'description', 'account'];
      const csvData = filteredTransactions.map(transaction => ({
        date: formatDate(transaction.date),
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type === 'income' ? 'Receita' : 'Despesa',
        category: transaction.categoryName,
        description: transaction.description || '',
        account: transaction.accountName || 'Principal',
      }));

      const csvContent = generateCSV(csvData, headers);
      
      const fileName = `transacoes_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: t('export.shareTransactions'),
        });
      }

      return { success: true, fileUri, fileName };
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      return { success: false, error: error.message };
    }
  };

  const exportBudgetsCSV = async () => {
    try {
      const headers = ['category', 'limit', 'spent', 'percentage', 'status', 'month'];
      const csvData = budgets.map(budget => {
        const percentage = budget.limit > 0 ? ((budget.spent / budget.limit) * 100).toFixed(2) : 0;
        let status = 'Dentro do orçamento';
        if (percentage >= 100) status = 'Limite ultrapassado';
        else if (percentage >= 80) status = 'Limite próximo';
        else if (percentage >= 60) status = 'Atenção';

        return {
          category: budget.categoryName,
          limit: budget.limit,
          spent: budget.spent,
          percentage: `${percentage}%`,
          status,
          month: budget.month,
        };
      });

      const csvContent = generateCSV(csvData, headers);
      
      const fileName = `orcamentos_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: t('export.shareBudgets'),
        });
      }

      return { success: true, fileUri, fileName };
    } catch (error) {
      console.error('Erro ao exportar orçamentos:', error);
      return { success: false, error: error.message };
    }
  };

  const exportCompleteData = async () => {
    try {
      const completeData = {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        data: {
          transactions,
          categories,
          budgets,
          monthlyGoals,
          accounts,
          recurringTransactions,
        },
        statistics: {
          totalTransactions: transactions.length,
          totalCategories: categories.length,
          totalAccounts: accounts.length,
          totalRecurring: recurringTransactions.length,
          totalBudgets: budgets.length,
        }
      };

      const jsonContent = JSON.stringify(completeData, null, 2);
      
      const fileName = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: t('export.shareBackup'),
        });
      }

      return { success: true, fileUri, fileName };
    } catch (error) {
      console.error('Erro ao exportar dados completos:', error);
      return { success: false, error: error.message };
    }
  };

  const generateReport = async (period = 'month') => {
    try {
      const now = new Date();
      let startDate, endDate;

      switch (period) {
        case 'week':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          endDate = now;
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
      }

      const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      const income = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = income - expenses;

      // Agrupar por categoria
      const expensesByCategory = {};
      filteredTransactions
        .filter(t => t.type === 'expense')
        .forEach(transaction => {
          const category = transaction.categoryName;
          expensesByCategory[category] = (expensesByCategory[category] || 0) + transaction.amount;
        });

      const reportContent = `
# RELATÓRIO FINANCEIRO - ${period.toUpperCase()}
**Período:** ${formatDate(startDate)} a ${formatDate(endDate)}
**Gerado em:** ${formatDate(new Date())}

## RESUMO GERAL
- **Total de Receitas:** ${formatCurrency(income)}
- **Total de Despesas:** ${formatCurrency(expenses)}
- **Saldo do Período:** ${formatCurrency(balance)}
- **Número de Transações:** ${filteredTransactions.length}

## DESPESAS POR CATEGORIA
${Object.entries(expensesByCategory)
  .sort(([,a], [,b]) => b - a)
  .map(([category, amount]) => `- **${category}:** ${formatCurrency(amount)}`)
  .join('\n')}

## TRANSAÇÕES DETALHADAS
${filteredTransactions
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .map(t => `**${formatDate(t.date)}** | ${t.title} | ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)} | ${t.categoryName}`)
  .join('\n')}

---
*Relatório gerado pelo Controle Financeiro Pro*
      `.trim();

      const fileName = `relatorio_${period}_${new Date().toISOString().split('T')[0]}.txt`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, reportContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: t('export.shareReport'),
        });
      }

      return { success: true, fileUri, fileName };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return { success: false, error: error.message };
    }
  };

  const importData = async (fileUri) => {
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const importedData = JSON.parse(fileContent);

      // Validar estrutura do arquivo
      if (!importedData.data) {
        throw new Error(t('export.invalidFileFormat'));
      }

      // Aqui você implementaria a lógica de importação
      // Por segurança, isso deve ser feito com confirmação do usuário
      Alert.alert(
        t('export.importConfirm'),
        t('export.importWarning'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { 
            text: t('export.import'), 
            onPress: () => performImport(importedData)
          },
        ]
      );

      return { success: true };
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return { success: false, error: error.message };
    }
  };

  const performImport = async (importedData) => {
    try {
      // Implementar lógica de importação
      // Este é um placeholder - você precisaria implementar
      // a lógica real de merge/substituição de dados
      console.log('Importando dados:', importedData);
      
      Alert.alert(t('common.success'), t('export.importSuccess'));
      return { success: true };
    } catch (error) {
      Alert.alert(t('common.error'), t('export.importError'));
      return { success: false, error: error.message };
    }
  };

  const value = {
    exportTransactionsCSV,
    exportBudgetsCSV,
    exportCompleteData,
    generateReport,
    importData,
  };

  return (
    <ExportContext.Provider value={value}>
      {children}
    </ExportContext.Provider>
  );
};

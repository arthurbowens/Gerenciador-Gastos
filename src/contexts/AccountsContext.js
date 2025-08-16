import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from './LanguageContext';

const AccountsContext = createContext();

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
};

export const AccountsProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const { t, currentLanguage } = useLanguage();

  // Carregar dados salvos
  useEffect(() => {
    loadAccountsData();
  }, []);

  const getDefaultAccountName = (type) => {
    const nameMap = {
      'checking': t('accounts.checkingAccount'),
      'savings': t('accounts.savings'),
      'credit': t('accounts.creditCard'),
    };
    return nameMap[type] || type;
  };

  // Atualizar nomes das contas padrão quando idioma muda
  useEffect(() => {
    if (accounts.length > 0) {
      updateDefaultAccountNames();
    }
  }, [currentLanguage, t]);

  const loadAccountsData = async () => {
    try {
      const savedAccounts = await AsyncStorage.getItem('accounts');
      const savedCurrentAccount = await AsyncStorage.getItem('currentAccount');
      
      if (savedAccounts) {
        const parsedAccounts = JSON.parse(savedAccounts);
        
        // Atualizar nomes das contas padrão com as traduções atuais
        const updatedAccounts = parsedAccounts.map(account => {
          if (account.isDefault) {
            return {
              ...account,
              name: getDefaultAccountName(account.type)
            };
          }
          return account;
        });
        
        setAccounts(updatedAccounts);
        
        // Salvar contas atualizadas se houve mudanças
        if (JSON.stringify(updatedAccounts) !== JSON.stringify(parsedAccounts)) {
          await AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts));
        }
        
        if (savedCurrentAccount) {
          const currentId = JSON.parse(savedCurrentAccount);
          const current = updatedAccounts.find(acc => acc.id === currentId);
          setCurrentAccount(current || updatedAccounts[0]);
        } else {
          setCurrentAccount(updatedAccounts[0]);
        }
      } else {
        // Criar conta padrão
        await createDefaultAccounts();
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  };

  const updateDefaultAccountNames = async () => {
    const updatedAccounts = accounts.map(account => {
      if (account.isDefault) {
        return {
          ...account,
          name: getDefaultAccountName(account.type)
        };
      }
      return account;
    });

    if (JSON.stringify(updatedAccounts) !== JSON.stringify(accounts)) {
      setAccounts(updatedAccounts);
      await AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts));
      
      // Atualizar conta atual se necessário
      if (currentAccount && currentAccount.isDefault) {
        const updatedCurrentAccount = updatedAccounts.find(acc => acc.id === currentAccount.id);
        if (updatedCurrentAccount) {
          setCurrentAccount(updatedCurrentAccount);
        }
      }
    }
  };

  const createDefaultAccounts = async () => {
    const defaultAccounts = [
      {
        id: '1',
        name: getDefaultAccountName('checking'),
        type: 'checking',
        icon: 'card',
        color: '#3B82F6',
        balance: 0,
        isDefault: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: getDefaultAccountName('savings'),
        type: 'savings',
        icon: 'trending-up',
        color: '#10B981',
        balance: 0,
        isDefault: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: getDefaultAccountName('credit'),
        type: 'credit',
        icon: 'card-outline',
        color: '#EF4444',
        balance: 0,
        isDefault: true,
        createdAt: new Date().toISOString(),
      },
    ];

    setAccounts(defaultAccounts);
    setCurrentAccount(defaultAccounts[0]);
    
    await AsyncStorage.setItem('accounts', JSON.stringify(defaultAccounts));
    await AsyncStorage.setItem('currentAccount', JSON.stringify(defaultAccounts[0].id));
  };

  const addAccount = async (accountData) => {
    const newAccount = {
      ...accountData,
      id: Date.now().toString(),
      balance: 0,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    await AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    
    return newAccount;
  };

  const updateAccount = async (accountId, updates) => {
    const updatedAccounts = accounts.map(account =>
      account.id === accountId ? { ...account, ...updates } : account
    );
    
    setAccounts(updatedAccounts);
    await AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    
    // Atualizar conta atual se for a mesma
    if (currentAccount?.id === accountId) {
      setCurrentAccount({ ...currentAccount, ...updates });
    }
  };

  const deleteAccount = async (accountId) => {
    if (accounts.length <= 1) {
      return false; // Não permitir deletar a última conta
    }

    const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
    setAccounts(updatedAccounts);
    
    // Se a conta deletada era a atual, definir a primeira como atual
    if (currentAccount && currentAccount.id === accountId) {
      const newCurrentAccount = updatedAccounts[0];
      setCurrentAccount(newCurrentAccount);
      await AsyncStorage.setItem('currentAccount', JSON.stringify(newCurrentAccount.id));
    }
    
    try {
      await AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts));
      return true;
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      return false;
    }
  };

  const clearAllData = async () => {
    try {
      // Recriar contas padrão
      await createDefaultAccounts();
      console.log('✅ Todas as contas foram limpas e resetadas para padrão');
      return true;
    } catch (error) {
      console.error('Erro ao limpar contas:', error);
      return false;
    }
  };

  const switchAccount = async (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      setCurrentAccount(account);
      await AsyncStorage.setItem('currentAccount', JSON.stringify(accountId));
    }
  };

  const updateAccountBalance = async (accountId, amount, type) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;

    let newBalance = account.balance;
    
    if (account.type === 'credit') {
      // Para cartão de crédito, funciona ao contrário
      newBalance = type === 'expense' ? account.balance + amount : account.balance - amount;
    } else {
      // Para contas normais
      newBalance = type === 'income' ? account.balance + amount : account.balance - amount;
    }

    await updateAccount(accountId, { balance: newBalance });
  };

  const transferBetweenAccounts = async (fromAccountId, toAccountId, amount, description = '') => {
    const fromAccount = accounts.find(acc => acc.id === fromAccountId);
    const toAccount = accounts.find(acc => acc.id === toAccountId);
    
    if (!fromAccount || !toAccount) {
      throw new Error(t('accounts.invalidAccounts'));
    }

    if (fromAccount.balance < amount && fromAccount.type !== 'credit') {
      throw new Error(t('accounts.insufficientFunds'));
    }

    // Transferir valores
    await updateAccountBalance(fromAccountId, amount, 'expense');
    await updateAccountBalance(toAccountId, amount, 'income');

    // Registrar transação de transferência (opcional)
    const transfer = {
      id: Date.now().toString(),
      fromAccountId,
      toAccountId,
      amount,
      description,
      date: new Date().toISOString(),
      type: 'transfer',
    };

    // Salvar histórico de transferências
    const savedTransfers = await AsyncStorage.getItem('transfers');
    const transfers = savedTransfers ? JSON.parse(savedTransfers) : [];
    transfers.push(transfer);
    await AsyncStorage.setItem('transfers', JSON.stringify(transfers));

    return transfer;
  };

  const getAccountsByType = (type) => {
    return accounts.filter(account => account.type === type);
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => {
      if (account.type === 'credit') {
        return total - account.balance; // Cartão de crédito é negativo
      }
      return total + account.balance;
    }, 0);
  };

  const value = {
    accounts,
    currentAccount,
    addAccount,
    updateAccount,
    deleteAccount,
    switchAccount,
    updateAccountBalance,
    transferBetweenAccounts,
    getAccountsByType,
    getTotalBalance,
    refreshAccountNames: () => updateDefaultAccountNames(),
    clearAllData,
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
};

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  SegmentedButtons,
  Chip,
  HelperText,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../contexts/FinanceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';

export default function AddTransactionScreen({ navigation, route }) {
  const { addTransaction, updateTransaction, categories } = useFinance();
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  
  // Verificar se é edição ou nova transação
  const editingTransaction = route?.params?.transaction;
  const isEditing = !!editingTransaction;
  
  const [title, setTitle] = useState(editingTransaction?.title || '');
  const [amount, setAmount] = useState(editingTransaction?.amount?.toString() || '');
  const [type, setType] = useState(editingTransaction?.type || 'expense');
  const [categoryId, setCategoryId] = useState(editingTransaction?.categoryId || '');
  const [description, setDescription] = useState(editingTransaction?.description || '');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = t('addTransaction.titleRequired');
    }

    if (!amount.trim()) {
      newErrors.amount = t('addTransaction.amountRequired');
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = t('addTransaction.amountPositive');
    }

    if (!categoryId) {
      newErrors.category = t('addTransaction.categoryRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const category = categories.find(c => c.id === categoryId);
      
      const transactionData = {
        title: title.trim(),
        amount: parseFloat(amount),
        type,
        categoryId,
        categoryName: category.name,
        description: description.trim(),
      };

      if (isEditing) {
        await updateTransaction(editingTransaction.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }
      
      Alert.alert(
        t('addTransaction.success'),
        isEditing ? t('addTransaction.updateSuccessMessage') : t('addTransaction.successMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        t('addTransaction.error'),
        t('addTransaction.errorMessage'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCategories = () => {
    return categories.filter(c => c.type === type);
  };

  const getCategoryIcon = (categoryName) => {
    // Mapear pelos nomes traduzidos
    const categoryMap = {
      [t('defaultCategories.food')]: 'restaurant',
      [t('defaultCategories.transport')]: 'car',
      [t('defaultCategories.housing')]: 'home',
      [t('defaultCategories.health')]: 'medical',
      [t('defaultCategories.education')]: 'school',
      [t('defaultCategories.entertainment')]: 'game-controller',
      [t('defaultCategories.salary')]: 'cash',
      [t('defaultCategories.freelance')]: 'briefcase',
      [t('defaultCategories.investments')]: 'trending-up',
    };
    return categoryMap[categoryName] || 'help-circle';
  };

  const getCategoryColor = (categoryName) => {
    // Mapear pelos nomes traduzidos
    const categoryMap = {
      [t('defaultCategories.food')]: '#FF6B6B',
      [t('defaultCategories.transport')]: '#4ECDC4',
      [t('defaultCategories.housing')]: '#45B7D1',
      [t('defaultCategories.health')]: '#96CEB4',
      [t('defaultCategories.education')]: '#FFEAA7',
      [t('defaultCategories.entertainment')]: '#DDA0DD',
      [t('defaultCategories.salary')]: '#98D8C8',
      [t('defaultCategories.freelance')]: '#F7DC6F',
      [t('defaultCategories.investments')]: '#BB8FCE',
    };
    return categoryMap[categoryName] || '#95A5A6';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>
              {isEditing ? t('addTransaction.editTitle') : t('addTransaction.title')}
            </Title>

            {/* Tipo de transação */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('addTransaction.type')}</Text>
              <SegmentedButtons
                value={type}
                onValueChange={setType}
                buttons={[
                  {
                    value: 'expense',
                    label: t('addTransaction.expense'),
                    icon: 'arrow-down-circle',
                    checkedColor: '#EF4444',
                  },
                  {
                    value: 'income',
                    label: t('addTransaction.income'),
                    icon: 'arrow-up-circle',
                    checkedColor: '#10B981',
                  },
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            {/* Título */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('addTransaction.transactionTitle')} *</Text>
              <TextInput
                mode="outlined"
                value={title}
                onChangeText={setTitle}
                placeholder={t('addTransaction.titlePlaceholder')}
                style={styles.input}
                error={!!errors.title}
              />
              {errors.title && (
                <HelperText type="error" visible={!!errors.title}>
                  {errors.title}
                </HelperText>
              )}
            </View>

            {/* Valor */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('addTransaction.amount')} *</Text>
              <TextInput
                mode="outlined"
                value={amount}
                onChangeText={setAmount}
                placeholder="0,00"
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.amount}
                left={<TextInput.Affix text="R$ " />}
              />
              {errors.amount && (
                <HelperText type="error" visible={!!errors.amount}>
                  {errors.amount}
                </HelperText>
              )}
            </View>

            {/* Categoria */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('addTransaction.category')} *</Text>
              <View style={styles.categoriesContainer}>
                {getFilteredCategories().map((category) => (
                  <Chip
                    key={category.id}
                    selected={categoryId === category.id}
                    onPress={() => setCategoryId(category.id)}
                    style={[
                      styles.categoryChip,
                      categoryId === category.id && {
                        backgroundColor: getCategoryColor(category.name),
                      },
                    ]}
                    textStyle={{
                      color: categoryId === category.id ? 'white' : '#374151',
                    }}
                  >
                    <View style={styles.categoryChipContent}>
                      <Ionicons
                        name={getCategoryIcon(category.name)}
                        size={16}
                        color={categoryId === category.id ? 'white' : getCategoryColor(category.name)}
                        style={styles.categoryIcon}
                      />
                      <Text style={{ color: categoryId === category.id ? 'white' : '#374151' }}>
                        {category.name}
                      </Text>
                    </View>
                  </Chip>
                ))}
              </View>
              {errors.category && (
                <HelperText type="error" visible={!!errors.category}>
                  {errors.category}
                </HelperText>
              )}
            </View>

            {/* Descrição */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('addTransaction.description')}</Text>
              <TextInput
                mode="outlined"
                value={description}
                onChangeText={setDescription}
                placeholder={t('addTransaction.descriptionPlaceholder')}
                style={styles.input}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.cancelButton}
                disabled={loading}
              >
                {t('addTransaction.cancel')}
              </Button>
              
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                loading={loading}
                disabled={loading}
              >
                {isEditing ? t('addTransaction.update') : t('addTransaction.add')}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1F2937',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginBottom: 8,
  },
  categoryChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#6B7280',
  },
  submitButton: {
    flex: 2,
    marginLeft: 8,
    backgroundColor: '#1E3A8A',
  },
});

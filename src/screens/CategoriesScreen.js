import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Title, FAB, Chip, Button, TextInput, Modal, Portal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../contexts/FinanceContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function CategoriesScreen() {
  const { categories, addCategory, deleteCategory } = useFinance();
  const { t } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('expense');
  const [newCategoryColor, setNewCategoryColor] = useState('#FF6B6B');

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#95A5A6'
  ];

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

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert(t('addTransaction.error'), t('categories.categoryNameRequired'));
      return;
    }

    try {
      await addCategory({
        name: newCategoryName.trim(),
        type: newCategoryType,
        color: newCategoryColor,
        icon: getCategoryIcon(newCategoryName.trim()),
      });

      setNewCategoryName('');
      setNewCategoryType('expense');
      setNewCategoryColor('#FF6B6B');
      setModalVisible(false);

      Alert.alert(t('addTransaction.success'), t('categories.categoryAdded'));
    } catch (error) {
      Alert.alert(t('addTransaction.error'), t('categories.errorAddingCategory'));
    }
  };

  const handleDeleteCategory = (categoryId, categoryName) => {
    Alert.alert(
      t('categories.confirmDelete'),
      `${t('categories.confirmDeleteMessage')} "${categoryName}"?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => deleteCategory(categoryId)
        },
      ]
    );
  };

  const renderCategoryItem = ({ item }) => (
    <Card style={styles.categoryCard}>
      <Card.Content>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryLeft}>
            <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
              <Ionicons 
                name={getCategoryIcon(item.name)} 
                size={24} 
                color="white" 
              />
            </View>
            <View style={styles.categoryInfo}>
              <Title style={styles.categoryName}>{item.name}</Title>
              <Chip 
                mode="outlined" 
                style={[
                  styles.typeChip,
                  item.type === 'income' ? styles.incomeChip : styles.expenseChip
                ]}
                textStyle={{
                  color: item.type === 'income' ? '#10B981' : '#EF4444'
                }}
              >
                {item.type === 'income' ? t('addTransaction.income') : t('addTransaction.expense')}
              </Chip>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteCategory(item.id, item.name)}
          >
            <Ionicons name="trash" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="grid-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyStateTitle}>{t('categories.noCategoriesTitle')}</Text>
      <Text style={styles.emptyStateSubtext}>
        {t('categories.noCategoriesSubtext')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoriesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>{t('categories.newCategory')}</Title>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('categories.name')}</Text>
                <TextInput
                  mode="outlined"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder={t('categories.namePlaceholder')}
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('categories.type')}</Text>
                <View style={styles.typeButtons}>
                  <Button
                    mode={newCategoryType === 'expense' ? 'contained' : 'outlined'}
                    onPress={() => setNewCategoryType('expense')}
                    style={[
                      styles.typeButton,
                      newCategoryType === 'expense' && styles.expenseButton
                    ]}
                    textColor={newCategoryType === 'expense' ? 'white' : '#EF4444'}
                  >
                    {t('addTransaction.expense')}
                  </Button>
                  <Button
                    mode={newCategoryType === 'income' ? 'contained' : 'outlined'}
                    onPress={() => setNewCategoryType('income')}
                    style={[
                      styles.typeButton,
                      newCategoryType === 'income' && styles.incomeButton
                    ]}
                    textColor={newCategoryType === 'income' ? 'white' : '#10B981'}
                  >
                    {t('addTransaction.income')}
                  </Button>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('categories.color')}</Text>
                <View style={styles.colorPicker}>
                  {colors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        newCategoryColor === color && styles.selectedColor
                      ]}
                      onPress={() => setNewCategoryColor(color)}
                    >
                      {newCategoryColor === color && (
                        <Ionicons name="checkmark" size={20} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelButton}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddCategory}
                  style={styles.addButton}
                >
                  {t('common.save')}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        label={t('categories.newCategory')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  categoriesList: {
    padding: 16,
  },
  categoryCard: {
    marginBottom: 12,
    elevation: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  typeChip: {
    alignSelf: 'flex-start',
  },
  incomeChip: {
    borderColor: '#10B981',
  },
  expenseChip: {
    borderColor: '#EF4444',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#374151',
    marginTop: 16,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1E3A8A',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1F2937',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: 'white',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
  },
  expenseButton: {
    backgroundColor: '#EF4444',
  },
  incomeButton: {
    backgroundColor: '#10B981',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#1F2937',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#6B7280',
  },
  addButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#1E3A8A',
  },
});

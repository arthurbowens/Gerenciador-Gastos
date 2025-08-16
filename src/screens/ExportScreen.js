import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { 
  Card, 
  Title, 
  Button, 
  TextInput, 
  Modal, 
  Portal,
  Chip,
  Divider,
  List
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useExport } from '../contexts/ExportContext';

export default function ExportScreen() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { 
    exportTransactionsCSV,
    exportBudgetsCSV,
    exportCompleteData,
    generateReport
  } = useExport();

  const [modalVisible, setModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(false);

  const reportPeriods = [
    { value: 'week', label: t('export.lastWeek'), icon: 'calendar-outline' },
    { value: 'month', label: t('export.thisMonth'), icon: 'calendar' },
    { value: 'year', label: t('export.thisYear'), icon: 'calendar-sharp' },
  ];

  const handleExportTransactions = async (withPeriod = false) => {
    setLoading(true);
    try {
      const result = withPeriod 
        ? await exportTransactionsCSV(startDate, endDate)
        : await exportTransactionsCSV();

      if (result.success) {
        Alert.alert(
          t('common.success'),
          `${t('export.exportSuccess')} ${result.fileName}`
        );
        if (withPeriod) {
          setModalVisible(false);
          setStartDate('');
          setEndDate('');
        }
      } else {
        Alert.alert(t('common.error'), result.error);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('export.exportError'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportBudgets = async () => {
    setLoading(true);
    try {
      const result = await exportBudgetsCSV();
      
      if (result.success) {
        Alert.alert(
          t('common.success'),
          `${t('export.exportSuccess')} ${result.fileName}`
        );
      } else {
        Alert.alert(t('common.error'), result.error);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('export.exportError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteBackup = async () => {
    setLoading(true);
    try {
      const result = await exportCompleteData();
      
      if (result.success) {
        Alert.alert(
          t('common.success'),
          `${t('export.backupSuccess')} ${result.fileName}`
        );
      } else {
        Alert.alert(t('common.error'), result.error);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('export.backupError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const result = await generateReport(selectedPeriod);
      
      if (result.success) {
        Alert.alert(
          t('common.success'),
          `${t('export.reportSuccess')} ${result.fileName}`
        );
        setReportModalVisible(false);
      } else {
        Alert.alert(t('common.error'), result.error);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('export.reportError'));
    } finally {
      setLoading(false);
    }
  };

  const renderExportSection = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Title style={styles.sectionTitle}>{t('export.exportData')}</Title>
        <Text style={styles.sectionDescription}>
          {t('export.exportDescription')}
        </Text>

        <List.Item
          title={t('export.exportTransactions')}
          description={t('export.exportTransactionsDesc')}
          left={(props) => <List.Icon {...props} icon="download-outline" color={theme.colors.primary} />}
          right={() => (
            <View style={styles.buttonGroup}>
              <Button
                mode="outlined"
                onPress={() => handleExportTransactions(false)}
                style={styles.actionButton}
                loading={loading}
                disabled={loading}
              >
                {t('export.all')}
              </Button>
              <Button
                mode="contained"
                onPress={() => setModalVisible(true)}
                style={styles.actionButton}
                loading={loading}
                disabled={loading}
              >
                {t('export.period')}
              </Button>
            </View>
          )}
          style={styles.listItem}
        />

        <Divider style={styles.divider} />

        <List.Item
          title={t('export.exportBudgets')}
          description={t('export.exportBudgetsDesc')}
          left={(props) => <List.Icon {...props} icon="card" color={theme.colors.primary} />}
          right={() => (
            <Button
              mode="contained"
              onPress={handleExportBudgets}
              style={styles.actionButton}
              loading={loading}
              disabled={loading}
            >
              {t('export.export')}
            </Button>
          )}
          style={styles.listItem}
        />
      </Card.Content>
    </Card>
  );

  const renderBackupSection = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Title style={styles.sectionTitle}>{t('export.backup')}</Title>
        <Text style={styles.sectionDescription}>
          {t('export.backupDescription')}
        </Text>

        <List.Item
          title={t('export.completeBackup')}
          description={t('export.completeBackupDesc')}
          left={(props) => <List.Icon {...props} icon="cloud-upload-outline" color={theme.colors.primary} />}
          right={() => (
            <Button
              mode="contained"
              onPress={handleCompleteBackup}
              style={styles.actionButton}
              loading={loading}
              disabled={loading}
            >
              {t('export.backup')}
            </Button>
          )}
          style={styles.listItem}
        />

        <Divider style={styles.divider} />

        <List.Item
          title={t('export.importData')}
          description={t('export.importDataDesc')}
          left={(props) => <List.Icon {...props} icon="cloud-download-outline" color={theme.colors.primary} />}
          right={() => (
            <Button
              mode="outlined"
              onPress={() => Alert.alert(t('common.info'), t('export.importComingSoon'))}
              style={styles.actionButton}
              disabled={true}
            >
              {t('export.import')}
            </Button>
          )}
          style={styles.listItem}
        />
      </Card.Content>
    </Card>
  );

  const renderReportSection = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Title style={styles.sectionTitle}>{t('export.reports')}</Title>
        <Text style={styles.sectionDescription}>
          {t('export.reportsDescription')}
        </Text>

        <List.Item
          title={t('export.generateReport')}
          description={t('export.generateReportDesc')}
          left={(props) => <List.Icon {...props} icon="file-document-outline" color={theme.colors.primary} />}
          right={() => (
            <Button
              mode="contained"
              onPress={() => setReportModalVisible(true)}
              style={styles.actionButton}
              loading={loading}
              disabled={loading}
            >
              {t('export.generate')}
            </Button>
          )}
          style={styles.listItem}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderExportSection()}
        {renderBackupSection()}
        {renderReportSection()}
      </ScrollView>

      {/* Modal para período personalizado */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>{t('export.selectPeriod')}</Title>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('export.startDate')}</Text>
                <TextInput
                  mode="outlined"
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('export.endDate')}</Text>
                <TextInput
                  mode="outlined"
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  style={styles.modalInput}
                />
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
                  onPress={() => handleExportTransactions(true)}
                  style={styles.confirmButton}
                  loading={loading}
                  disabled={loading}
                >
                  {t('export.export')}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Modal para relatórios */}
      <Portal>
        <Modal
          visible={reportModalVisible}
          onDismiss={() => setReportModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>{t('export.selectReportPeriod')}</Title>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>{t('export.period')}</Text>
                <View style={styles.periodOptions}>
                  {reportPeriods.map((period) => (
                    <Chip
                      key={period.value}
                      selected={selectedPeriod === period.value}
                      onPress={() => setSelectedPeriod(period.value)}
                      style={styles.periodChip}
                      icon={period.icon}
                    >
                      {period.label}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setReportModalVisible(false)}
                  style={styles.cancelButton}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleGenerateReport}
                  style={styles.confirmButton}
                  loading={loading}
                  disabled={loading}
                >
                  {t('export.generate')}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  listItem: {
    paddingVertical: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
  divider: {
    marginVertical: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
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
  periodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodChip: {
    marginBottom: 8,
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
  confirmButton: {
    flex: 1,
    marginLeft: 8,
  },
});

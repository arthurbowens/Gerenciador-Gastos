import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { 
  Card, 
  Title, 
  Button,
  Switch,
  Divider
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemePreview } from '../constants/CustomThemes';

const { width } = Dimensions.get('window');

export default function ThemeCustomizationScreen({ navigation }) {
  const { t } = useLanguage();
  const { theme, selectedTheme, customThemes, isDarkMode, toggleDarkMode, changeTheme } = useTheme();

  const [previewMode, setPreviewMode] = useState(false);

  const renderThemePreview = (themeKey, themeData) => {
    const preview = getThemePreview(themeKey);
    const isSelected = selectedTheme === themeKey;
    
    return (
      <TouchableOpacity
        key={themeKey}
        style={[
          styles.themePreview,
          isSelected && styles.selectedTheme,
          { borderColor: isSelected ? theme.colors.primary : '#E5E7EB' }
        ]}
        onPress={() => changeTheme(themeKey)}
      >
        <View style={styles.themePreviewContent}>
          {/* Header simulado */}
          <View style={[styles.previewHeader, { backgroundColor: preview.primary }]}>
            <View style={styles.previewHeaderContent}>
              <View style={[styles.previewIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
              <View style={[styles.previewTitle, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            </View>
          </View>
          
          {/* Background simulado */}
          <View style={[styles.previewBody, { backgroundColor: preview.background }]}>
            {/* Cards simulados */}
            <View style={[styles.previewCard, { backgroundColor: preview.surface }]}>
              <View style={[styles.previewCardLine, { backgroundColor: preview.isDark ? '#6B7280' : '#9CA3AF' }]} />
              <View style={[styles.previewCardLineSmall, { backgroundColor: preview.isDark ? '#6B7280' : '#9CA3AF' }]} />
            </View>
            
            <View style={[styles.previewCard, { backgroundColor: preview.surface }]}>
              <View style={[styles.previewCardLine, { backgroundColor: preview.isDark ? '#6B7280' : '#9CA3AF' }]} />
              <View style={[styles.previewCardLineSmall, { backgroundColor: preview.isDark ? '#6B7280' : '#9CA3AF' }]} />
            </View>
          </View>
        </View>
        
        <Text style={[styles.themeName, { color: theme.colors.text }]}>
          {preview.name}
        </Text>
        
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderDarkModeToggle = () => (
    <Card style={styles.controlCard}>
      <Card.Content>
        <View style={styles.controlRow}>
          <View style={styles.controlInfo}>
            <Text style={[styles.controlTitle, { color: theme.colors.text }]}>
              {t('settings.darkMode')}
            </Text>
            <Text style={[styles.controlDescription, { color: theme.colors.textLight }]}>
              {t('themes.darkModeDesc')}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            color={theme.colors.primary}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderPreviewToggle = () => (
    <Card style={styles.controlCard}>
      <Card.Content>
        <View style={styles.controlRow}>
          <View style={styles.controlInfo}>
            <Text style={[styles.controlTitle, { color: theme.colors.text }]}>
              {t('themes.previewMode')}
            </Text>
            <Text style={[styles.controlDescription, { color: theme.colors.textLight }]}>
              {t('themes.previewModeDesc')}
            </Text>
          </View>
          <Switch
            value={previewMode}
            onValueChange={setPreviewMode}
            color={theme.colors.primary}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderLightThemes = () => {
    const lightThemes = Object.entries(customThemes).filter(([key]) => 
      !['blueDark', 'greenDark', 'purpleDark', 'oled'].includes(key)
    );

    return (
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('themes.lightThemes')}
          </Title>
          
          <View style={styles.themesGrid}>
            {lightThemes.map(([key, themeData]) => renderThemePreview(key, themeData))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderDarkThemes = () => {
    const darkThemes = Object.entries(customThemes).filter(([key]) => 
      ['blueDark', 'greenDark', 'purpleDark', 'oled'].includes(key)
    );

    return (
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('themes.darkThemes')}
          </Title>
          
          <View style={styles.themesGrid}>
            {darkThemes.map(([key, themeData]) => renderThemePreview(key, themeData))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderCurrentThemeInfo = () => {
    const currentThemeData = customThemes[selectedTheme];
    if (!currentThemeData) return null;

    return (
      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={[styles.infoTitle, { color: theme.colors.text }]}>
            {t('themes.currentTheme')}
          </Title>
          
          <View style={styles.themeInfo}>
            <Text style={[styles.themeInfoName, { color: theme.colors.text }]}>
              {currentThemeData.name}
            </Text>
            
            <View style={styles.colorPalette}>
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.secondary }]} />
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.accent }]} />
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.surface }]} />
            </View>
            
            <Text style={[styles.themeInfoDetails, { color: theme.colors.textLight }]}>
              {isDarkMode ? t('themes.darkVariant') : t('themes.lightVariant')}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderCurrentThemeInfo()}
        {renderDarkModeToggle()}
        {renderPreviewToggle()}
        
        <Divider style={styles.sectionDivider} />
        
        {renderLightThemes()}
        {renderDarkThemes()}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  themeInfo: {
    alignItems: 'center',
  },
  themeInfoName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  colorPalette: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 4,
    elevation: 2,
  },
  themeInfoDetails: {
    fontSize: 14,
  },
  controlCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 1,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlInfo: {
    flex: 1,
    marginRight: 16,
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  controlDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionDivider: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  sectionCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themePreview: {
    width: (width - 48) / 2 - 8,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    elevation: 1,
  },
  selectedTheme: {
    elevation: 3,
  },
  themePreviewContent: {
    height: 100,
  },
  previewHeader: {
    height: 30,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  previewHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  previewTitle: {
    width: 40,
    height: 8,
    borderRadius: 4,
  },
  previewBody: {
    flex: 1,
    padding: 8,
  },
  previewCard: {
    height: 20,
    borderRadius: 4,
    marginBottom: 6,
    padding: 4,
  },
  previewCardLine: {
    height: 4,
    borderRadius: 2,
    marginBottom: 2,
    width: '70%',
  },
  previewCardLineSmall: {
    height: 3,
    borderRadius: 1.5,
    width: '40%',
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  bottomPadding: {
    height: 20,
  },
});

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Save, Globe, Bell, Lock, Palette, Cloud, Database, Shield } from 'lucide-react-native';

// Define TypeScript interfaces
interface SettingsType {
  general: {
    schoolName: string;
    timezone: string;
    dateFormat: string;
    language: string;
  };
  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    smsAlerts: boolean;
    maintenanceAlerts: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: string;
    ipWhitelist: boolean;
  };
  appearance: {
    theme: string;
    primaryColor: string;
    fontSize: string;
    compactMode: boolean;
  };
}

type SettingsCategory = keyof SettingsType;
type SettingsValue = string | boolean | number;

export default function SystemSettings() {
  const [settings, setSettings] = useState<SettingsType>({
    general: {
      schoolName: 'Greenwood High School',
      timezone: 'UTC+5:30',
      dateFormat: 'DD/MM/YYYY',
      language: 'English',
    },
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      smsAlerts: false,
      maintenanceAlerts: true,
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordPolicy: 'Strong',
      ipWhitelist: false,
    },
    appearance: {
      theme: 'Light',
      primaryColor: '#007AFF',
      fontSize: 'Medium',
      compactMode: false,
    },
  });

  const [activeTab, setActiveTab] = useState<string>('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integration', label: 'Integration', icon: Cloud },
    { id: 'database', label: 'Database', icon: Database },
  ];

  const timezones = ['UTC+5:30', 'UTC+0:00', 'UTC-5:00', 'UTC-8:00', 'UTC+1:00'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Arabic'];
  const themes = ['Light', 'Dark', 'Auto'];
  const passwordPolicies = ['Basic', 'Medium', 'Strong', 'Very Strong'];

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    Alert.alert('Success', 'Settings saved successfully');
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            // Reset to default settings
            Alert.alert('Success', 'Settings reset to default');
          }
        }
      ]
    );
  };

  const updateSetting = (category: SettingsCategory, key: string, value: SettingsValue) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    });
  };

  const renderGeneralSettings = () => (
    <View style={styles.settingsSection}>
      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>School Name</Text>
        <TextInput
          style={styles.textInput}
          value={settings.general.schoolName}
          onChangeText={(value) => updateSetting('general', 'schoolName', value)}
          placeholder="Enter school name"
        />
      </View>

      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Timezone</Text>
        <View style={styles.optionsGrid}>
          {timezones.map((tz) => (
            <TouchableOpacity
              key={tz}
              style={[
                styles.optionButton,
                settings.general.timezone === tz && styles.optionButtonActive
              ]}
              onPress={() => updateSetting('general', 'timezone', tz)}
            >
              <Text style={[
                styles.optionText,
                settings.general.timezone === tz && styles.optionTextActive
              ]}>
                {tz}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Date Format</Text>
        <View style={styles.optionsGrid}>
          {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map((format) => (
            <TouchableOpacity
              key={format}
              style={[
                styles.optionButton,
                settings.general.dateFormat === format && styles.optionButtonActive
              ]}
              onPress={() => updateSetting('general', 'dateFormat', format)}
            >
              <Text style={[
                styles.optionText,
                settings.general.dateFormat === format && styles.optionTextActive
              ]}>
                {format}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Language</Text>
        <View style={styles.optionsGrid}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.optionButton,
                settings.general.language === lang && styles.optionButtonActive
              ]}
              onPress={() => updateSetting('general', 'language', lang)}
            >
              <Text style={[
                styles.optionText,
                settings.general.language === lang && styles.optionTextActive
              ]}>
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderNotificationSettings = () => (
    <View style={styles.settingsSection}>
      {Object.entries(settings.notifications).map(([key, value]) => (
        <View key={key} style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Text>
            <Text style={styles.settingDescription}>
              Receive {key.toLowerCase()} notifications
            </Text>
          </View>
          <Switch
            value={value}
            onValueChange={(val) => updateSetting('notifications', key, val)}
            trackColor={{ false: '#f2f2f7', true: '#34C759' }}
            thumbColor={value ? '#fff' : '#fff'}
          />
        </View>
      ))}
    </View>
  );

  const renderSecuritySettings = () => (
    <View style={styles.settingsSection}>
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
          <Text style={styles.settingDescription}>Add extra security layer</Text>
        </View>
        <Switch
          value={settings.security.twoFactorAuth}
          onValueChange={(val) => updateSetting('security', 'twoFactorAuth', val)}
          trackColor={{ false: '#f2f2f7', true: '#34C759' }}
          thumbColor={settings.security.twoFactorAuth ? '#fff' : '#fff'}
        />
      </View>

      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Session Timeout (minutes)</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderValue}>{settings.security.sessionTimeout}</Text>
          <View style={styles.slider}>
            <View 
              style={[
                styles.sliderFill,
                { width: `${(settings.security.sessionTimeout / 60) * 100}%` }
              ]} 
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>5</Text>
            <Text style={styles.sliderLabel}>15</Text>
            <Text style={styles.sliderLabel}>30</Text>
            <Text style={styles.sliderLabel}>45</Text>
            <Text style={styles.sliderLabel}>60</Text>
          </View>
        </View>
      </View>

      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Password Policy</Text>
        <View style={styles.optionsGrid}>
          {passwordPolicies.map((policy) => (
            <TouchableOpacity
              key={policy}
              style={[
                styles.optionButton,
                settings.security.passwordPolicy === policy && styles.optionButtonActive
              ]}
              onPress={() => updateSetting('security', 'passwordPolicy', policy)}
            >
              <Shield size={16} color={settings.security.passwordPolicy === policy ? 'white' : '#8E8E93'} />
              <Text style={[
                styles.optionText,
                settings.security.passwordPolicy === policy && styles.optionTextActive
              ]}>
                {policy}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>IP Whitelist</Text>
          <Text style={styles.settingDescription}>Restrict access to specific IPs</Text>
        </View>
        <Switch
          value={settings.security.ipWhitelist}
          onValueChange={(val) => updateSetting('security', 'ipWhitelist', val)}
          trackColor={{ false: '#f2f2f7', true: '#34C759' }}
          thumbColor={settings.security.ipWhitelist ? '#fff' : '#fff'}
        />
      </View>
    </View>
  );

  const renderAppearanceSettings = () => (
    <View style={styles.settingsSection}>
      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Theme</Text>
        <View style={styles.optionsGrid}>
          {themes.map((theme) => (
            <TouchableOpacity
              key={theme}
              style={[
                styles.optionButton,
                settings.appearance.theme === theme && styles.optionButtonActive
              ]}
              onPress={() => updateSetting('appearance', 'theme', theme)}
            >
              <Text style={[
                styles.optionText,
                settings.appearance.theme === theme && styles.optionTextActive
              ]}>
                {theme}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Primary Color</Text>
        <View style={styles.colorGrid}>
          {['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5856D6'].map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                settings.appearance.primaryColor === color && styles.colorButtonActive
              ]}
              onPress={() => updateSetting('appearance', 'primaryColor', color)}
            >
              {settings.appearance.primaryColor === color && (
                <View style={styles.colorCheckmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Font Size</Text>
        <View style={styles.optionsGrid}>
          {['Small', 'Medium', 'Large'].map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.optionButton,
                settings.appearance.fontSize === size && styles.optionButtonActive
              ]}
              onPress={() => updateSetting('appearance', 'fontSize', size)}
            >
              <Text style={[
                styles.optionText,
                settings.appearance.fontSize === size && styles.optionTextActive,
                { fontSize: size === 'Small' ? 14 : size === 'Medium' ? 16 : 18 }
              ]}>
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Compact Mode</Text>
          <Text style={styles.settingDescription}>Show more content on screen</Text>
        </View>
        <Switch
          value={settings.appearance.compactMode}
          onValueChange={(val) => updateSetting('appearance', 'compactMode', val)}
          trackColor={{ false: '#f2f2f7', true: '#34C759' }}
          thumbColor={settings.appearance.compactMode ? '#fff' : '#fff'}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Tabs Navigation */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tabButton,
                    activeTab === tab.id && styles.tabButtonActive
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} color={activeTab === tab.id ? '#007AFF' : '#8E8E93'} />
                  <Text style={[
                    styles.tabText,
                    activeTab === tab.id && styles.tabTextActive
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Settings Content */}
        <View style={styles.contentContainer}>
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'appearance' && renderAppearanceSettings()}
          
          {/* Placeholders for other tabs */}
          {(activeTab === 'integration' || activeTab === 'database') && (
            <View style={styles.placeholder}>
              <Cloud size={48} color="#8E8E93" />
              <Text style={styles.placeholderText}>
                {activeTab === 'integration' ? 'Integration Settings' : 'Database Settings'}
              </Text>
              <Text style={styles.placeholderSubtext}>
                Configuration options will be available here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleResetSettings}
        >
          <Text style={styles.resetButtonText}>Reset to Default</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveSettings}
        >
          <Save size={20} color="white" />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  tabsContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f2f2f7',
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: '#007AFF20',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  tabTextActive: {
    color: '#007AFF',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  settingsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  settingGroup: {
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    gap: 8,
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  optionTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  slider: {
    height: 4,
    backgroundColor: '#f2f2f7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButtonActive: {
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  colorCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
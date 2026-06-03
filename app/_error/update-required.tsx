import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { AlertTriangle, Download, Info } from 'lucide-react-native';

export default function UpdateRequired() {
  const currentVersion = '2.0.1';
  const requiredVersion = '2.1.0';
  const storeUrl = 'https://apps.apple.com/app/id123456789'; // Replace with actual store URL

  const handleUpdate = () => {
    Linking.openURL(storeUrl).catch((err) => {
      console.error('Failed to open store:', err);
    });
  };

  const updateFeatures = [
    'Improved security features',
    'New assignment tracking system',
    'Enhanced video calling',
    'Bug fixes and performance improvements',
    'New user interface',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AlertTriangle size={80} color="#FF9500" />
        <Text style={styles.title}>Update Required</Text>
        <Text style={styles.message}>
          A new version of SchoolSync is available and required to continue.
        </Text>

        {/* Version Info */}
        <View style={styles.versionCard}>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Current Version:</Text>
            <Text style={styles.versionValue}>{currentVersion}</Text>
          </View>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Required Version:</Text>
            <Text style={[styles.versionValue, styles.versionRequired]}>
              {requiredVersion}
            </Text>
          </View>
        </View>

        {/* New Features */}
        <View style={styles.featuresCard}>
          <View style={styles.featuresHeader}>
            <Info size={20} color="#007AFF" />
            <Text style={styles.featuresTitle}>Whats New</Text>
          </View>
          <View style={styles.featuresList}>
            {updateFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Download size={24} color="white" />
          <Text style={styles.updateText}>Update Now</Text>
        </TouchableOpacity>

        {/* Size Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📱 Update Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Update Size</Text>
              <Text style={styles.infoValue}>~85 MB</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Time Required</Text>
              <Text style={styles.infoValue}>2-5 minutes</Text>
            </View>
          </View>
          <Text style={styles.infoNote}>
            • Connect to Wi-Fi for faster download{'\n'}
            • Keep the app open during update{'\n'}
            • Your data will be preserved
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  versionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  versionLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  versionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  versionRequired: {
    color: '#007AFF',
  },
  featuresCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  featureText: {
    fontSize: 16,
    color: '#1d1d1f',
    flex: 1,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  updateText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  infoNote: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});
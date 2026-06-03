import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WifiOff, RefreshCw, Wifi } from 'lucide-react-native';
import { useState } from 'react';

export default function OfflineMode() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastSynced, setLastSynced] = useState('10:30 AM');

  const handleRetryConnection = () => {
    setIsChecking(true);
    // Simulate connection check
    setTimeout(() => {
      setIsChecking(false);
      // In real app, check actual connection
    }, 1500);
  };

  const availableFeatures = [
    'View saved assignments',
    'Access downloaded materials',
    'Check class schedule',
    'View grades (cached)',
    'Write messages (will send when online)',
  ];

  const unavailableFeatures = [
    'Upload new assignments',
    'Stream videos',
    'Real-time updates',
    'Video calls',
    'Cloud backup',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <WifiOff size={64} color="#8E8E93" />
        <Text style={styles.title}>Youre Offline</Text>
        <Text style={styles.subtitle}>
          No internet connection detected
        </Text>
      </View>

      <View style={styles.content}>
        {/* Connection Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Connection Status</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRetryConnection}
              disabled={isChecking}
            >
              {isChecking ? (
                <RefreshCw size={16} color="#007AFF" />
              ) : (
                <Wifi size={16} color="#007AFF" />
              )}
              <Text style={styles.retryText}>
                {isChecking ? 'Checking...' : 'Check Connection'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Last Synced:</Text>
            <Text style={styles.statusValue}>{lastSynced}</Text>
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Network:</Text>
            <Text style={styles.statusValue}>Not connected</Text>
          </View>
        </View>

        {/* Available Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Available Offline</Text>
          <View style={styles.featuresList}>
            {availableFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureDotAvailable} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Unavailable Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Requires Internet</Text>
          <View style={styles.featuresList}>
            {unavailableFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureDotUnavailable} />
                <Text style={[styles.featureText, styles.featureTextUnavailable]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <Text style={styles.tip}>• Move to an area with better signal</Text>
          <Text style={styles.tip}>• Turn Wi-Fi off and on again</Text>
          <Text style={styles.tip}>• Check your data plan</Text>
          <Text style={styles.tip}>• Restart your device</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f2f2f7',
    borderRadius: 6,
    gap: 6,
  },
  retryText: {
    fontSize: 14,
    color: '#007AFF',
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  statusLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d1d1f',
  },
  featuresContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDotAvailable: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  featureDotUnavailable: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8E8E93',
  },
  featureText: {
    fontSize: 16,
    color: '#1d1d1f',
    flex: 1,
  },
  featureTextUnavailable: {
    color: '#8E8E93',
  },
  tipsCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  tip: {
    fontSize: 16,
    color: '#1d1d1f',
    marginBottom: 8,
    lineHeight: 22,
  },
});
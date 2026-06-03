import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

export default function ErrorScreen() {
  const handleRetry = () => {
    // Reset error boundary
    console.log('Retrying...');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AlertTriangle size={64} color="#FF9500" />
        <Text style={styles.title}>Something Went Wrong</Text>
        <Text style={styles.message}>
          We encountered an error while loading this page. Please try again.
        </Text>

        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <RefreshCw size={20} color="white" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>If the problem persists:</Text>
          <Text style={styles.tip}>1. Check your internet connection</Text>
          <Text style={styles.tip}>2. Restart the application</Text>
          <Text style={styles.tip}>3. Clear app cache</Text>
          <Text style={styles.tip}>4. Contact support if needed</Text>
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
    fontSize: 24,
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
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tips: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    lineHeight: 20,
  },
});
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react-native';

export default function ErrorBoundary() {
  const handleRetry = () => {
    // Reload app logic
    console.log('Retrying...');
  };

  const handleGoHome = () => {
    // Navigate to home
    console.log('Going home...');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AlertTriangle size={80} color="#FF9500" />
        <Text style={styles.title}>Oops! Something went wrong</Text>
        <Text style={styles.message}>
          We encountered an unexpected error. Our team has been notified and is working on a fix.
        </Text>
        
        <View style={styles.errorDetails}>
          <Text style={styles.errorTitle}>Error Details:</Text>
          <Text style={styles.errorCode}>Error Code: APP_CRASH_001</Text>
          <Text style={styles.errorTime}>Time: {new Date().toLocaleString()}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <RefreshCw size={20} color="white" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Home size={20} color="#007AFF" />
            <Text style={styles.homeText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.helpText}>
          If the problem persists, please contact support at support@schoolapp.com
        </Text>
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
  errorDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  errorCode: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  errorTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f7',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  homeText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  helpText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});
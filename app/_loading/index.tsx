import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Loader } from 'lucide-react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Loader size={48} color="#007AFF" />
        <Text style={styles.title}>Loading Content</Text>
        <Text style={styles.subtitle}>Please wait while we fetch your data</Text>
        <ActivityIndicator size="large" color="#007AFF" style={styles.spinner} />
      </View>
      
      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Did you know?</Text>
        <Text style={styles.tip}>You can access your assignments offline</Text>
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
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  spinner: {
    marginTop: 20,
  },
  tips: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  tip: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
  },
});
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { reportError } from '../utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Report error to your error tracking service
    reportError('react_error_boundary', {
      error: error.toString(),
      componentStack: errorInfo.componentStack || 'No component stack available',
      timestamp: new Date().toISOString(),
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.errorContainer}>
            <Ionicons name="bug" size={64} color={Colors.danger} />
            <Text style={styles.title}>خطایی رخ داده است</Text>
            <Text style={styles.message}>
              متأسفیم، مشکلی در اجرای برنامه پیش آمده است.
            </Text>
            
            {__DEV__ && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>جزئیات خطا:</Text>
                <Text style={styles.debugError}>
                  {this.state.error?.toString() ?? 'Unknown error'}
                </Text>
                <Text style={styles.debugStack}>
                  {this.state.errorInfo?.componentStack ?? 'No component stack available'}
                </Text>
              </View>
            )}
            
            <View style={styles.actions}>
              <TouchableOpacity style={styles.resetButton} onPress={this.handleReset}>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.resetText}>تلاش مجدد</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.reportButton}>
                <Ionicons name="send" size={20} color={Colors.primary} />
                <Text style={styles.reportText}>گزارش خطا</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  debugContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  debugError: {
    fontSize: 12,
    color: Colors.danger,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  debugStack: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  resetText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  reportText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
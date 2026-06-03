import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Upload, Download, FileSpreadsheet, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { adminUserApi, AdminUser, CreateUserData } from '@/src/config/adminUserApi';

type ImportStatus = 'idle' | 'uploading' | 'processed' | 'importing' | 'completed';
type ImportFile = {
  name: string;
  size: string;
  uploadedAt: string;
  uri?: string;
} | null;

interface ImportStats {
  total: number;
  success: number;
  failed: number;
  duplicate: number;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
}

interface ParsedUserData {
  fullName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  password: string;
  classId?: number;
  subjects?: number[];
}

export default function BulkUserImport() {
  const [importFile, setImportFile] = useState<ImportFile>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [importStats, setImportStats] = useState<ImportStats>({
    total: 0,
    success: 0,
    failed: 0,
    duplicate: 0,
  });
  const [parsedData, setParsedData] = useState<ParsedUserData[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate file picker - in real app, use react-native-document-picker
  const handleFileUpload = async () => {
    try {
      setIsLoading(true);
      setImportStatus('uploading');
      
      // In a real app, you would use DocumentPicker to select a file
      // For now, simulate with sample data
      setTimeout(() => {
        const sampleData: ParsedUserData[] = [
          {
            fullName: 'John Doe',
            email: 'john.doe@school.com',
            phone: '1234567890',
            role: 'student',
            password: 'password123',
            classId: 1,
          },
          {
            fullName: 'Jane Smith',
            email: 'jane.smith@school.com',
            phone: '0987654321',
            role: 'teacher',
            password: 'password123',
            subjects: [1, 2],
          },
          {
            fullName: 'Invalid Email',
            email: 'invalid-email',
            role: 'student',
            password: 'password123',
          },
        ];

        setParsedData(sampleData);
        
        // Validate data
        const validationErrors: ImportError[] = [];
        const validData: ParsedUserData[] = [];
        
        sampleData.forEach((user, index) => {
          const errors: ImportError[] = [];
          
          if (!user.fullName) {
            errors.push({ row: index + 1, field: 'fullName', message: 'Name is required' });
          }
          if (!user.email || !user.email.includes('@')) {
            errors.push({ row: index + 1, field: 'email', message: 'Valid email is required' });
          }
          if (!user.role || !['admin', 'teacher', 'student', 'parent'].includes(user.role)) {
            errors.push({ row: index + 1, field: 'role', message: 'Invalid role' });
          }
          
          if (errors.length > 0) {
            validationErrors.push(...errors);
          } else {
            validData.push(user);
          }
        });
        
        setErrors(validationErrors);
        setImportStats({
          total: sampleData.length,
          success: validData.length,
          failed: validationErrors.filter(e => e.message !== 'Duplicate entry').length,
          duplicate: validationErrors.filter(e => e.message === 'Duplicate entry').length,
        });
        
        setImportFile({
          name: 'users_import_20240120.csv',
          size: '245 KB',
          uploadedAt: new Date().toISOString(),
        });
        
        setImportStatus('processed');
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload file. Please try again.');
      setImportStatus('idle');
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      Alert.alert('Error', 'No valid data to import');
      return;
    }

    Alert.alert(
      'Confirm Import',
      `Import ${importStats.success} users? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Import', 
          style: 'default',
          onPress: async () => {
            try {
              setImportStatus('importing');
              setIsLoading(true);
              
              let successCount = 0;
              let failedCount = 0;
              
              // Import each user one by one
              for (const userData of parsedData) {
                try {
                  const response = await adminUserApi.createUser(userData);
                  if (response.success) {
                    successCount++;
                  } else {
                    failedCount++;
                    console.error('Failed to import user:', userData.email, response.message);
                  }
                } catch (error) {
                  failedCount++;
                  console.error('Error importing user:', userData.email, error);
                }
              }
              
              setImportStats(prev => ({
                ...prev,
                success: successCount,
                failed: failedCount,
              }));
              
              setImportStatus('completed');
              setIsLoading(false);
              
              Alert.alert(
                'Import Completed',
                `Successfully imported ${successCount} out of ${parsedData.length} users.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Reset form
                      setImportFile(null);
                      setParsedData([]);
                      setImportStatus('idle');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error during import:', error);
              Alert.alert('Error', 'Failed to import users. Please try again.');
              setImportStatus('processed');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const downloadTemplate = async () => {
    try {
      setIsLoading(true);
      const response = await adminUserApi.exportUsers('csv');
      if (response.success && response.data) {
        // In a real app, you would save the file to device
        Alert.alert('Success', 'Template downloaded successfully');
      } else {
        Alert.alert('Error', 'Failed to download template');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      Alert.alert('Error', 'Failed to download template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {importStatus === 'uploading' && 'Uploading file...'}
            {importStatus === 'importing' && 'Importing users...'}
            {importStatus === 'idle' && 'Processing...'}
          </Text>
        </View>
      )}
      
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bulk User Import</Text>
            <Text style={styles.subtitle}>Import multiple users via CSV/Excel file</Text>
          </View>
          <TouchableOpacity 
            style={styles.templateButton} 
            onPress={downloadTemplate}
            disabled={isLoading}
          >
            <Download size={20} color="#007AFF" />
            <Text style={styles.templateText}>Download Template</Text>
          </TouchableOpacity>
        </View>

        {/* Upload Section */}
        <View style={styles.uploadCard}>
          <View style={styles.uploadHeader}>
            <FileSpreadsheet size={24} color="#007AFF" />
            <Text style={styles.uploadTitle}>Upload File</Text>
          </View>
          
          <Text style={styles.uploadDescription}>
            Upload a CSV or Excel file with user data. Make sure the file follows the template format.
          </Text>
          
          {!importFile ? (
            <TouchableOpacity 
              style={styles.uploadArea}
              onPress={handleFileUpload}
              disabled={importStatus === 'uploading' || isLoading}
            >
              <Upload size={48} color="#8E8E93" />
              <Text style={styles.uploadAreaText}>
                {importStatus === 'uploading' ? 'Uploading...' : 'Click to upload file'}
              </Text>
              <Text style={styles.uploadAreaSubtext}>
                Supported formats: CSV, XLS, XLSX (Max 5MB)
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.fileCard}>
              <View style={styles.fileInfo}>
                <FileSpreadsheet size={24} color="#34C759" />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{importFile.name}</Text>
                  <Text style={styles.fileSize}>{importFile.size}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => {
                  setImportFile(null);
                  setParsedData([]);
                  setErrors([]);
                  setImportStatus('idle');
                }}
                disabled={isLoading}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Import Preview */}
        {(importStatus === 'processed' || importStatus === 'importing') && (
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Users size={20} color="#007AFF" />
              <Text style={styles.previewTitle}>Import Preview</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{importStats.total}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#D4F7E2' }]}>
                <CheckCircle size={20} color="#34C759" />
                <Text style={[styles.statValue, { color: '#34C759' }]}>{importStats.success}</Text>
                <Text style={styles.statLabel}>Valid</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#FFE5E5' }]}>
                <XCircle size={20} color="#FF3B30" />
                <Text style={[styles.statValue, { color: '#FF3B30' }]}>{importStats.failed}</Text>
                <Text style={styles.statLabel}>Failed</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#FFF3CD' }]}>
                <AlertCircle size={20} color="#FF9500" />
                <Text style={[styles.statValue, { color: '#FF9500' }]}>{importStats.duplicate}</Text>
                <Text style={styles.statLabel}>Duplicate</Text>
              </View>
            </View>

            {/* Errors List */}
            {errors.length > 0 && (
              <View style={styles.errorsContainer}>
                <Text style={styles.errorsTitle}>Validation Errors:</Text>
                {errors.slice(0, 5).map((error, index) => (
                  <View key={index} style={styles.errorItem}>
                    <Text style={styles.errorText}>
                      Row {error.row}: {error.field} - {error.message}
                    </Text>
                  </View>
                ))}
                {errors.length > 5 && (
                  <Text style={styles.moreErrors}>
                    And {errors.length - 5} more errors...
                  </Text>
                )}
              </View>
            )}

            {/* Sample Data Preview */}
            {parsedData.length > 0 && (
              <View style={styles.sampleContainer}>
                <Text style={styles.sampleTitle}>Sample Data (First 5 rows)</Text>
                <View style={styles.sampleTable}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderCell}>Name</Text>
                    <Text style={styles.tableHeaderCell}>Email</Text>
                    <Text style={styles.tableHeaderCell}>Role</Text>
                    <Text style={styles.tableHeaderCell}>Status</Text>
                  </View>
                  {parsedData.slice(0, 5).map((user, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{user.fullName}</Text>
                      <Text style={styles.tableCell}>{user.email}</Text>
                      <Text style={styles.tableCell}>{user.role}</Text>
                      <Text style={[
                        styles.tableCell,
                        user.email?.includes('@') ? styles.validText : styles.invalidText
                      ]}>
                        {user.email?.includes('@') ? 'Valid' : 'Invalid'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instruction}>1. Download the template file for correct format</Text>
            <Text style={styles.instruction}>2. Fill in user details (Name, Email, Role, etc.)</Text>
            <Text style={styles.instruction}>3. Upload the file using the upload area</Text>
            <Text style={styles.instruction}>4. Review the import preview</Text>
            <Text style={styles.instruction}>5. Click Import Users to complete</Text>
          </View>
          
          <View style={styles.requirements}>
            <Text style={styles.requirementsTitle}>File Requirements:</Text>
            <Text style={styles.requirement}>• Maximum file size: 5MB</Text>
            <Text style={styles.requirement}>• Required columns: Full Name, Email, Role</Text>
            <Text style={styles.requirement}>• Optional columns: Phone, Class ID, Subjects</Text>
            <Text style={styles.requirement}>• Supported formats: CSV, XLS, XLSX</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {importStatus === 'processed' && (
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => {
              setImportFile(null);
              setParsedData([]);
              setErrors([]);
              setImportStatus('idle');
            }}
            disabled={isLoading}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.importButton,
              (parsedData.length === 0 || isLoading) && styles.importButtonDisabled
            ]}
            onPress={handleImport}
            disabled={parsedData.length === 0 || isLoading}
          >
            <Text style={styles.importText}>
              Import Users
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1d1d1f',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f2f2f7',
    borderRadius: 6,
    gap: 6,
  },
  templateText: {
    fontSize: 14,
    color: '#007AFF',
  },
  uploadCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  uploadDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
    lineHeight: 20,
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderWidth: 2,
    borderColor: '#d1d1d6',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  uploadAreaText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d1d1f',
    marginTop: 16,
    marginBottom: 4,
  },
  uploadAreaSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileDetails: {
    gap: 4,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  fileSize: {
    fontSize: 14,
    color: '#8E8E93',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderRadius: 6,
  },
  removeText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  previewCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  errorsContainer: {
    marginTop: 16,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
    marginBottom: 8,
  },
  errorItem: {
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF9500',
  },
  moreErrors: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  sampleContainer: {
    marginTop: 8,
  },
  sampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  sampleTable: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e5ea',
    padding: 12,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#1d1d1f',
  },
  validText: {
    color: '#34C759',
  },
  invalidText: {
    color: '#FF3B30',
  },
  instructionsCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 100,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  instructionsList: {
    marginBottom: 20,
  },
  instruction: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    lineHeight: 20,
  },
  requirements: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  importButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  importButtonDisabled: {
    backgroundColor: '#d1d1d6',
  },
  importText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
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
  Modal,
} from 'react-native';
import { Plus, Edit2, Trash2, Save, Filter, Download, Copy } from 'lucide-react-native';

// Define TypeScript interfaces
interface FeeCategory {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  isMandatory: boolean;
  classes: string[];
}

interface NewFeeCategory {
  name: string;
  amount: string;
  frequency: string;
  isMandatory: boolean;
  classes: string[];
}

export default function FeeStructure() {
  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>([
    { id: '1', name: 'Tuition Fee', amount: 1200, frequency: 'Monthly', isMandatory: true, classes: ['All'] },
    { id: '2', name: 'Transport Fee', amount: 300, frequency: 'Monthly', isMandatory: false, classes: ['1-12'] },
    { id: '3', name: 'Library Fee', amount: 50, frequency: 'Annual', isMandatory: true, classes: ['All'] },
    { id: '4', name: 'Sports Fee', amount: 100, frequency: 'Term', isMandatory: false, classes: ['6-12'] },
    { id: '5', name: 'Exam Fee', amount: 200, frequency: 'Semester', isMandatory: true, classes: ['All'] },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FeeCategory | null>(null);
  const [newCategory, setNewCategory] = useState<NewFeeCategory>({
    name: '',
    amount: '',
    frequency: 'Monthly',
    isMandatory: true,
    classes: [],
  });

  const frequencies = ['Monthly', 'Quarterly', 'Term', 'Semester', 'Annual'];
  const classOptions = ['All', 'Nursery', 'KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.amount) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const category: FeeCategory = {
      id: editingCategory ? editingCategory.id : Date.now().toString(),
      name: newCategory.name,
      amount: parseFloat(newCategory.amount),
      frequency: newCategory.frequency,
      isMandatory: newCategory.isMandatory,
      classes: [...newCategory.classes],
    };

    if (editingCategory) {
      setFeeCategories(feeCategories.map(c => c.id === category.id ? category : c));
      Alert.alert('Success', 'Fee category updated successfully');
    } else {
      setFeeCategories([...feeCategories, category]);
      Alert.alert('Success', 'Fee category added successfully');
    }

    setShowAddModal(false);
    setEditingCategory(null);
    setNewCategory({ name: '', amount: '', frequency: 'Monthly', isMandatory: true, classes: [] });
  };

  const handleEdit = (category: FeeCategory) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      amount: category.amount.toString(),
      frequency: category.frequency,
      isMandatory: category.isMandatory,
      classes: [...category.classes],
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this fee category?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setFeeCategories(feeCategories.filter(c => c.id !== id));
            Alert.alert('Success', 'Fee category deleted successfully');
          }
        }
      ]
    );
  };

  const toggleClass = (classOption: string) => {
    const updatedClasses = newCategory.classes.includes(classOption)
      ? newCategory.classes.filter(c => c !== classOption)
      : [...newCategory.classes, classOption];
    setNewCategory({ ...newCategory, classes: updatedClasses });
  };

  const duplicateCategory = (category: FeeCategory) => {
    const duplicate: FeeCategory = {
      ...category,
      id: Date.now().toString(),
      name: `${category.name} (Copy)`,
    };
    setFeeCategories([...feeCategories, duplicate]);
    Alert.alert('Success', 'Fee category duplicated successfully');
  };

  const exportData = () => {
    // In a real app, this would export to CSV/Excel
    Alert.alert('Export', 'Fee structure exported successfully');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Fee Structure</Text>
            <Text style={styles.subtitle}>Configure fee categories and amounts</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={exportData}>
              <Download size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Plus size={20} color="white" />
              <Text style={styles.addButtonText}>Add Category</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Categories</Text>
            <Text style={styles.summaryValue}>{feeCategories.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Mandatory Fees</Text>
            <Text style={styles.summaryValue}>
              {feeCategories.filter(c => c.isMandatory).length}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={styles.summaryValue}>
              ${feeCategories.reduce((sum, c) => sum + c.amount, 0)}
            </Text>
          </View>
        </View>

        {/* Fee Categories Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Fee Categories</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={16} color="#8E8E93" />
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>

          {feeCategories.map((category) => (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryInfo}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  {category.isMandatory && (
                    <View style={styles.mandatoryBadge}>
                      <Text style={styles.mandatoryText}>Mandatory</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.categoryAmount}>${category.amount}</Text>
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryFrequency}>{category.frequency}</Text>
                  <Text style={styles.categoryClasses}>
                    Classes: {category.classes.join(', ')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.categoryActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => duplicateCategory(category)}
                >
                  <Copy size={16} color="#8E8E93" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEdit(category)}
                >
                  <Edit2 size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDelete(category.id)}
                >
                  <Trash2 size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>
            • Click &quot;Add Category&quot; to create new fee categories{'\n'}
            • Mandatory fees are automatically applied to all students{'\n'}
            • Set applicable classes to restrict fees to specific grades{'\n'}
            • Use the filter option to view specific fee categories
          </Text>
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          setEditingCategory(null);
          setNewCategory({ name: '', amount: '', frequency: 'Monthly', isMandatory: true, classes: [] });
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Edit Fee Category' : 'Add Fee Category'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                  setNewCategory({ name: '', amount: '', frequency: 'Monthly', isMandatory: true, classes: [] });
                }}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Tuition Fee"
                  value={newCategory.name}
                  onChangeText={(text) => setNewCategory({ ...newCategory, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount ($) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 1200"
                  value={newCategory.amount}
                  onChangeText={(text) => setNewCategory({ ...newCategory, amount: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Frequency</Text>
                <View style={styles.frequencyGrid}>
                  {frequencies.map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.frequencyButton,
                        newCategory.frequency === freq && styles.frequencyButtonActive
                      ]}
                      onPress={() => setNewCategory({ ...newCategory, frequency: freq })}
                    >
                      <Text style={[
                        styles.frequencyText,
                        newCategory.frequency === freq && styles.frequencyTextActive
                      ]}>
                        {freq}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.switchContainer}>
                  <Text style={styles.label}>Mandatory Fee</Text>
                  <Switch
                    value={newCategory.isMandatory}
                    onValueChange={(value) => setNewCategory({ ...newCategory, isMandatory: value })}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Applicable Classes</Text>
                <View style={styles.classesGrid}>
                  {classOptions.map((classOption) => (
                    <TouchableOpacity
                      key={classOption}
                      style={[
                        styles.classButton,
                        newCategory.classes.includes(classOption) && styles.classButtonActive
                      ]}
                      onPress={() => toggleClass(classOption)}
                    >
                      <Text style={[
                        styles.classText,
                        newCategory.classes.includes(classOption) && styles.classTextActive
                      ]}>
                        {classOption}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                  setNewCategory({ name: '', amount: '', frequency: 'Monthly', isMandatory: true, classes: [] });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddCategory}>
                <Save size={20} color="white" />
                <Text style={styles.saveButtonText}>
                  {editingCategory ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollView: {
    flex: 1,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1d1d1f',
  },
  tableContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tableHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f2f2f7',
    borderRadius: 6,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  mandatoryBadge: {
    backgroundColor: '#D4F7E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mandatoryText: {
    fontSize: 10,
    color: '#34C759',
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  categoryDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  categoryFrequency: {
    fontSize: 14,
    color: '#8E8E93',
  },
  categoryClasses: {
    fontSize: 14,
    color: '#8E8E93',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
  },
  instructions: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#8E8E93',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
  },
  frequencyButtonActive: {
    backgroundColor: '#007AFF',
  },
  frequencyText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  frequencyTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
  },
  classButtonActive: {
    backgroundColor: '#007AFF',
  },
  classText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  classTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
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
  cancelButtonText: {
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
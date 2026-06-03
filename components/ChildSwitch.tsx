import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

interface ChildSwitchProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChildSwitch({ visible, onClose }: ChildSwitchProps) {
  const { getChildren, getActiveChild, setActiveChild } = useAuth();
  
  const children = getChildren();
  const activeChild = getActiveChild();

  const handleSelectChild = (childId: number) => {
    setActiveChild(childId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>انتخاب فرزند</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Children List */}
          <View style={styles.childrenList}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childItem,
                  activeChild?.id === child.id && styles.activeChildItem,
                ]}
                onPress={() => handleSelectChild(child.id)}
              >
                <View style={styles.childInfo}>
                  <View style={styles.avatar}>
                    {child.profile_image ? (
                      <Image 
                        source={{ uri: child.profile_image }} 
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Ionicons name="person" size={24} color={Colors.primary} />
                    )}
                  </View>
                  <View style={styles.childDetails}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childClass}>
                      {child.grade} - {child.class_name}
                    </Text>
                  </View>
                </View>
                {activeChild?.id === child.id && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Add Child Button */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              onClose();
              // Navigate to add child screen
              // router.push('/parent/add-child');
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>افزودن فرزند جدید</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  childrenList: {
    marginBottom: 20,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeChildItem: {
    borderColor: Colors.primary,
    backgroundColor: '#eff6ff',
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  childClass: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
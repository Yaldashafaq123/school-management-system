import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { Shield, User, Users, Eye, Edit, Trash2, Plus, Save, Lock } from 'lucide-react-native';

// Define types
type PermissionKey = 'dashboard' | 'users' | 'courses' | 'financial' | 'academic' | 'system' | 'reports' | 'settings';

type Permissions = {
  [key in PermissionKey]: boolean;
};

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: Permissions;
}

export default function RolePermissions() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Administrator',
      description: 'Full system access',
      userCount: 3,
      permissions: {
        dashboard: true,
        users: true,
        courses: true,
        financial: true,
        academic: true,
        system: true,
        reports: true,
        settings: true,
      }
    },
    {
      id: '2',
      name: 'Teacher',
      description: 'Teaching staff access',
      userCount: 28,
      permissions: {
        dashboard: true,
        users: false,
        courses: true,
        financial: false,
        academic: true,
        system: false,
        reports: true,
        settings: false,
      }
    },
    {
      id: '3',
      name: 'Student',
      description: 'Student access',
      userCount: 450,
      permissions: {
        dashboard: true,
        users: false,
        courses: true,
        financial: false,
        academic: false,
        system: false,
        reports: false,
        settings: false,
      }
    },
    {
      id: '4',
      name: 'Parent',
      description: 'Parent access',
      userCount: 380,
      permissions: {
        dashboard: true,
        users: false,
        courses: true,
        financial: true,
        academic: false,
        system: false,
        reports: true,
        settings: false,
      }
    },
  ]);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRole, setNewRole] = useState<{
    name: string;
    description: string;
    permissions: Permissions;
  }>({
    name: '',
    description: '',
    permissions: {
      dashboard: false,
      users: false,
      courses: false,
      financial: false,
      academic: false,
      system: false,
      reports: false,
      settings: false,
    }
  });

  const permissionGroups = [
    {
      title: 'Core Access',
      permissions: ['dashboard', 'users', 'courses'] as PermissionKey[]
    },
    {
      title: 'Management',
      permissions: ['financial', 'academic', 'system'] as PermissionKey[]
    },
    {
      title: 'Data & Settings',
      permissions: ['reports', 'settings'] as PermissionKey[]
    }
  ];

  const getPermissionLabel = (key: PermissionKey): string => {
    const labels: Record<PermissionKey, string> = {
      dashboard: 'Dashboard Access',
      users: 'User Management',
      courses: 'Course Management',
      financial: 'Financial Management',
      academic: 'Academic Management',
      system: 'System Management',
      reports: 'Report Access',
      settings: 'System Settings',
    };
    return labels[key];
  };

  const handleSaveRole = () => {
    if (!newRole.name.trim()) {
      Alert.alert('Error', 'Please enter role name');
      return;
    }

    if (editingRole) {
      // Update existing role
      setRoles(roles.map(r => 
        r.id === editingRole.id 
          ? { 
              ...newRole, 
              id: editingRole.id,
              userCount: editingRole.userCount 
            } 
          : r
      ));
      Alert.alert('Success', 'Role updated successfully');
    } else {
      // Add new role
      const role: Role = {
        id: Date.now().toString(),
        name: newRole.name,
        description: newRole.description,
        userCount: 0,
        permissions: { ...newRole.permissions },
      };
      setRoles([...roles, role]);
      Alert.alert('Success', 'Role added successfully');
    }

    setShowAddModal(false);
    setEditingRole(null);
    setNewRole({
      name: '',
      description: '',
      permissions: {
        dashboard: false,
        users: false,
        courses: false,
        financial: false,
        academic: false,
        system: false,
        reports: false,
        settings: false,
      }
    });
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: { ...role.permissions },
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (!role) return;

    if (role.userCount > 0) {
      Alert.alert('Cannot Delete', 'This role has assigned users. Remove users first.');
      return;
    }

    Alert.alert(
      'Delete Role',
      'Are you sure you want to delete this role?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setRoles(roles.filter(r => r.id !== id));
            Alert.alert('Success', 'Role deleted successfully');
          }
        }
      ]
    );
  };

  const togglePermission = (permission: PermissionKey) => {
    setNewRole({
      ...newRole,
      permissions: {
        ...newRole.permissions,
        [permission]: !newRole.permissions[permission],
      }
    });
  };

  const toggleAllPermissions = (value: boolean) => {
    const allPermissions: Permissions = {
      dashboard: value,
      users: value,
      courses: value,
      financial: value,
      academic: value,
      system: value,
      reports: value,
      settings: value,
    };
    
    setNewRole({
      ...newRole,
      permissions: allPermissions,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Role & Permissions</Text>
            <Text style={styles.subtitle}>Manage user roles and access levels</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>Add Role</Text>
          </TouchableOpacity>
        </View>

        {/* Roles Grid */}
        <View style={styles.rolesContainer}>
          {roles.map(role => (
            <View key={role.id} style={styles.roleCard}>
              <View style={styles.roleHeader}>
                <View style={styles.roleIcon}>
                  {role.name === 'Administrator' ? (
                    <Shield size={20} color="#007AFF" />
                  ) : role.name === 'Teacher' ? (
                    <User size={20} color="#FF9500" />
                  ) : (
                    <Users size={20} color="#34C759" />
                  )}
                </View>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleName}>{role.name}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
                <View style={styles.roleStats}>
                  <Users size={16} color="#8E8E93" />
                  <Text style={styles.userCount}>{role.userCount} users</Text>
                </View>
              </View>

              <View style={styles.permissionsPreview}>
                <Text style={styles.permissionsTitle}>Key Permissions:</Text>
                <View style={styles.permissionTags}>
                  {(Object.entries(role.permissions) as [PermissionKey, boolean][])
                    .filter(([_, value]) => value)
                    .slice(0, 3)
                    .map(([key]) => (
                      <View key={key} style={styles.permissionTag}>
                        <Text style={styles.permissionTagText}>
                          {getPermissionLabel(key)}
                        </Text>
                      </View>
                    ))}
                  {Object.values(role.permissions).filter(v => v).length > 3 && (
                    <Text style={styles.moreText}>
                      +{Object.values(role.permissions).filter(v => v).length - 3} more
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.roleActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEdit(role)}
                >
                  <Edit size={16} color="#007AFF" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(role.id)}
                >
                  <Trash2 size={16} color="#FF3B30" />
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Permission Matrix */}
        <View style={styles.matrixContainer}>
          <Text style={styles.sectionTitle}>Permission Matrix</Text>
          <View style={styles.matrixCard}>
            <View style={styles.matrixHeader}>
              <Text style={styles.matrixHeaderCell}>Permission</Text>
              {roles.map(role => (
                <Text key={role.id} style={styles.matrixHeaderCell}>
                  {role.name}
                </Text>
              ))}
            </View>
            
            {(Object.keys(roles[0].permissions) as PermissionKey[]).map(permission => (
              <View key={permission} style={styles.matrixRow}>
                <Text style={styles.permissionLabel}>
                  {getPermissionLabel(permission)}
                </Text>
                {roles.map(role => (
                  <View key={role.id} style={styles.permissionCell}>
                    {role.permissions[permission] ? (
                      <View style={styles.allowedBadge}>
                        <Lock size={12} color="#34C759" />
                      </View>
                    ) : (
                      <View style={styles.deniedBadge}>
                        <Lock size={12} color="#FF3B30" />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingRole(null);
                  setNewRole({
                    name: '',
                    description: '',
                    permissions: {
                      dashboard: false,
                      users: false,
                      courses: false,
                      financial: false,
                      academic: false,
                      system: false,
                      reports: false,
                      settings: false,
                    }
                  });
                }}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Role Details */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Role Details</Text>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Role Name *</Text>
                  <View style={styles.textInputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter role name"
                      value={newRole.name}
                      onChangeText={(text) => setNewRole({ ...newRole, name: text })}
                    />
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description</Text>
                  <View style={styles.textInputContainer}>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      placeholder="Enter role description"
                      value={newRole.description}
                      onChangeText={(text) => setNewRole({ ...newRole, description: text })}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>
              </View>

              {/* Permissions */}
              <View style={styles.formSection}>
                <View style={styles.permissionsHeader}>
                  <Text style={styles.sectionTitle}>Permissions</Text>
                  <TouchableOpacity 
                    style={styles.toggleAllButton}
                    onPress={() => toggleAllPermissions(!Object.values(newRole.permissions).every(v => v))}
                  >
                    <Text style={styles.toggleAllText}>
                      {Object.values(newRole.permissions).every(v => v) ? 'Deselect All' : 'Select All'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {permissionGroups.map((group, index) => (
                  <View key={index} style={styles.permissionGroup}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    {group.permissions.map(permission => (
                      <View key={permission} style={styles.permissionItem}>
                        <View style={styles.permissionInfo}>
                          <Lock size={16} color="#8E8E93" />
                          <Text style={styles.permissionName}>
                            {getPermissionLabel(permission)}
                          </Text>
                        </View>
                        <Switch
                          value={newRole.permissions[permission]}
                          onValueChange={() => togglePermission(permission)}
                          trackColor={{ false: '#f2f2f7', true: '#34C759' }}
                          thumbColor={newRole.permissions[permission] ? '#fff' : '#fff'}
                        />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingRole(null);
                  setNewRole({
                    name: '',
                    description: '',
                    permissions: {
                      dashboard: false,
                      users: false,
                      courses: false,
                      financial: false,
                      academic: false,
                      system: false,
                      reports: false,
                      settings: false,
                    }
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveRole}>
                <Save size={20} color="white" />
                <Text style={styles.saveButtonText}>
                  {editingRole ? 'Update Role' : 'Save Role'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
  rolesContainer: {
    padding: 16,
  },
  roleCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  roleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  permissionsPreview: {
    marginBottom: 16,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  permissionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  permissionTag: {
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  permissionTagText: {
    fontSize: 12,
    color: '#1d1d1f',
  },
  moreText: {
    fontSize: 12,
    color: '#8E8E93',
    alignSelf: 'center',
  },
  roleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  deleteText: {
    color: '#FF3B30',
  },
  matrixContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  matrixCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
  },
  matrixHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e5ea',
    padding: 16,
  },
  matrixHeaderCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  matrixRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  permissionLabel: {
    flex: 1,
    fontSize: 14,
    color: '#1d1d1f',
  },
  permissionCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allowedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D4F7E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deniedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
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
    maxHeight: 400,
  },
  formSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
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
  textInputContainer: {
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  textInput: {
    padding: 12,
    fontSize: 16,
    color: '#1d1d1f',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  permissionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f2f2f7',
    borderRadius: 6,
  },
  toggleAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  permissionGroup: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permissionName: {
    fontSize: 16,
    color: '#1d1d1f',
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
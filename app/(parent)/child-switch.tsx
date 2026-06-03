import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  StyleSheet 
} from 'react-native';
import { User, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ChildSwitch() {
  const router = useRouter();
  const children = [
    { id: 1, name: 'Emma Wilson', class: 'Grade 5A', active: true },
    { id: 2, name: 'Noah Wilson', class: 'Grade 3B', active: false },
    { id: 3, name: 'Sophia Wilson', class: 'Grade 1C', active: false },
  ];

  const handleSelectChild = (childId: number) => {
    // Update active child in state/context
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Child Profile</Text>
      <Text style={styles.subtitle}>Choose which childs information to view</Text>
      
      <ScrollView style={styles.childrenList}>
        {children.map((child) => (
          <TouchableOpacity
            key={child.id}
            style={[styles.childCard, child.active && styles.activeChild]}
            onPress={() => handleSelectChild(child.id)}
          >
            <View style={styles.childInfo}>
              <View style={styles.avatar}>
                <User size={24} color="#4b5563" />
              </View>
              <View style={styles.childDetails}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childClass}>{child.class}</Text>
              </View>
            </View>
            {child.active && <Check size={24} color="#10b981" />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {/* Add child logic */}}
      >
        <Text style={styles.addButtonText}>+ Add Another Child</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  childrenList: { flex: 1 },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeChild: { borderColor: '#10b981' },
  childInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childDetails: { gap: 4 },
  childName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  childClass: { fontSize: 14, color: '#6b7280' },
  addButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
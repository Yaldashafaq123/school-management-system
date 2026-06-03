import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Hash,
  Book,
  Clock,
  User,
  Filter,
  Check,
  GraduationCap,
  School,
  Layers,
} from 'lucide-react-native';

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  gradeCategory: 'preschool' | 'primary' | 'middle' | 'high' | 'all';
  classCategories: string[]; // e.g., ['science', 'arts']
  gradeLevels: string[]; // e.g., ['9', '10', '11', '12']
  credits: number;
  hoursPerWeek: number;
  teacher: string;
  subjectType: 'core' | 'elective' | 'extra';
  department?: string;
}

interface NewSubject {
  name: string;
  code: string;
  description: string;
  gradeCategory: Subject['gradeCategory'];
  classCategories: string[];
  gradeLevels: string[];
  credits: string;
  hoursPerWeek: string;
  teacher: string;
  subjectType: Subject['subjectType'];
  department: string;
}

export default function SubjectsManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: '1',
      name: 'ریاضی',
      code: 'MATH-10',
      description: 'ریاضیات عمومی و حسابان برای صنف دهم',
      gradeCategory: 'high',
      classCategories: ['science', 'general'],
      gradeLevels: ['10'],
      credits: 4,
      hoursPerWeek: 6,
      teacher: 'استاد جان اسمیت',
      subjectType: 'core',
      department: 'ریاضیات',
    },
    {
      id: '2',
      name: 'فزیک',
      code: 'PHY-11',
      description: 'فزیک عمومی و آزمایشگاه',
      gradeCategory: 'high',
      classCategories: ['science'],
      gradeLevels: ['11'],
      credits: 3,
      hoursPerWeek: 5,
      teacher: 'استاد سارا جانسن',
      subjectType: 'core',
      department: 'ساینس',
    },
    {
      id: '3',
      name: 'دری',
      code: 'DARI-1',
      description: 'زبان دری - دوره ابتدایی',
      gradeCategory: 'primary',
      classCategories: ['general'],
      gradeLevels: ['1', '2', '3'],
      credits: 3,
      hoursPerWeek: 4,
      teacher: 'استاد رحیمه احمدی',
      subjectType: 'core',
    },
    {
      id: '4',
      name: 'هنر و نقاشی',
      code: 'ART-6',
      description: 'هنرهای تجسمی و خلاقیت',
      gradeCategory: 'middle',
      classCategories: ['general', 'arts'],
      gradeLevels: ['6', '7', '8'],
      credits: 2,
      hoursPerWeek: 3,
      teacher: 'استاد اما دیویس',
      subjectType: 'elective',
    },
    {
      id: '5',
      name: 'کیمیا',
      code: 'CHEM-12',
      description: 'کیمیا عمومی و آزمایشگاه',
      gradeCategory: 'high',
      classCategories: ['science'],
      gradeLevels: ['12'],
      credits: 4,
      hoursPerWeek: 6,
      teacher: 'استاد محمد کریمی',
      subjectType: 'core',
      department: 'ساینس',
    },
    {
      id: '6',
      name: 'ریاضی ابتدایی',
      code: 'MATH-PR',
      description: 'مفاهیم پایه ریاضی',
      gradeCategory: 'primary',
      classCategories: ['general'],
      gradeLevels: ['1', '2', '3', '4', '5'],
      credits: 3,
      hoursPerWeek: 5,
      teacher: 'استاد علی احمدی',
      subjectType: 'core',
    },
    {
      id: '7',
      name: 'موسیقی',
      code: 'MUSIC-9',
      description: 'آموزش موسیقی و آواز',
      gradeCategory: 'middle',
      classCategories: ['arts'],
      gradeLevels: ['9'],
      credits: 2,
      hoursPerWeek: 2,
      teacher: 'استاد کبیر احمد',
      subjectType: 'elective',
    },
    {
      id: '8',
      name: 'تاریخ',
      code: 'HIST-10',
      description: 'تاریخ افغانستان و جهان',
      gradeCategory: 'high',
      classCategories: ['general', 'social'],
      gradeLevels: ['10', '11'],
      credits: 3,
      hoursPerWeek: 4,
      teacher: 'استاد نوریه احمدی',
      subjectType: 'core',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeCategory, setSelectedGradeCategory] = useState<string>('all');
  const [selectedClassCategory, setSelectedClassCategory] = useState<string>('all');
  const [selectedSubjectType, setSelectedSubjectType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [newSubject, setNewSubject] = useState<NewSubject>({
    name: '',
    code: '',
    description: '',
    gradeCategory: 'primary',
    classCategories: [],
    gradeLevels: [],
    credits: '',
    hoursPerWeek: '',
    teacher: '',
    subjectType: 'core',
    department: '',
  });

  // School Categories
  const gradeCategories = [
    { id: 'preschool', label: 'پیش مکتب', icon: '👶', color: '#FF9500', grades: ['نرسری', 'باغچه'] },
    { id: 'primary', label: 'ابتدایی', icon: '🎒', color: '#34C759', grades: ['1', '2', '3', '4', '5'] },
    { id: 'middle', label: 'متوسطه', icon: '📚', color: '#007AFF', grades: ['6', '7', '8', '9'] },
    { id: 'high', label: 'ثانوی/لیسه', icon: '🎓', color: '#5856D6', grades: ['10', '11', '12'] },
    { id: 'all', label: 'تمام سطوح', icon: '🏫', color: '#8E8E93', grades: [] },
  ];

  // Class/Section Categories (Streams)
  const classCategories = [
    { id: 'science', label: 'ساینس', icon: '🔬', color: '#FF2D55' },
    { id: 'arts', label: 'ادبیات/هنر', icon: '🎨', color: '#FF9500' },
    { id: 'commercial', label: 'تجارت/تجارتی', icon: '💼', color: '#34C759' },
    { id: 'general', label: 'عمومی', icon: '📖', color: '#007AFF' },
    { id: 'technical', label: 'تخنیکی', icon: '🔧', color: '#AF52DE' },
    { id: 'social', label: 'علوم اجتماعی', icon: '👥', color: '#5856D6' },
    { id: 'religious', label: 'علوم دینی', icon: '🕌', color: '#5AC8FA' },
  ];

  // Subject Types
  const subjectTypes = [
    { id: 'core', label: 'اصلی/اجباری', color: '#FF3B30' },
    { id: 'elective', label: 'اختیاری', color: '#FF9500' },
    { id: 'extra', label: 'فوق برنامه', color: '#34C759' },
  ];

  const departments = [
    'ریاضیات',
    'ساینس',
    'زبان‌ها',
    'علوم اجتماعی',
    'هنر',
    'تخنیک',
    'علوم دینی',
    'ورزش',
  ];

  const teachers = [
    'استاد جان اسمیت',
    'استاد سارا جانسن',
    'استاد رحیمه احمدی',
    'استاد اما دیویس',
    'استاد علی احمدی',
    'استاد محمد کریمی',
    'استاد کبیر احمد',
    'استاد نوریه احمدی',
    'استاد احمد علی',
    'استاد زهرا محمدی',
  ];

  const handleSaveSubject = () => {
    if (!newSubject.name || !newSubject.code || newSubject.gradeLevels.length === 0) {
      Alert.alert('خطا', 'لطفاً نام، کد و حداقل یک سطح تحصیلی را انتخاب کنید');
      return;
    }

    const subject: Subject = {
      id: editingSubject ? editingSubject.id : Date.now().toString(),
      name: newSubject.name,
      code: newSubject.code,
      description: newSubject.description,
      gradeCategory: newSubject.gradeCategory,
      classCategories: newSubject.classCategories,
      gradeLevels: newSubject.gradeLevels,
      credits: parseInt(newSubject.credits) || 0,
      hoursPerWeek: parseInt(newSubject.hoursPerWeek) || 0,
      teacher: newSubject.teacher,
      subjectType: newSubject.subjectType,
      department: newSubject.department,
    };

    if (editingSubject) {
      setSubjects(subjects.map(s => (s.id === subject.id ? subject : s)));
      Alert.alert('موفقیت', 'مضمون با موفقیت ویرایش شد');
    } else {
      setSubjects([...subjects, subject]);
      Alert.alert('موفقیت', 'مضمون جدید با موفقیت ایجاد شد');
    }

    resetForm();
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setNewSubject({
      name: subject.name,
      code: subject.code,
      description: subject.description,
      gradeCategory: subject.gradeCategory,
      classCategories: subject.classCategories,
      gradeLevels: subject.gradeLevels,
      credits: subject.credits.toString(),
      hoursPerWeek: subject.hoursPerWeek.toString(),
      teacher: subject.teacher,
      subjectType: subject.subjectType,
      department: subject.department || '',
    });
    setShowAddModal(true);
  };

  const handleDeleteSubject = (id: string) => {
    Alert.alert(
      'حذف مضمون',
      'آیا مطمئن هستید که می‌خواهید این مضمون را حذف کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setSubjects(subjects.filter(s => s.id !== id));
            Alert.alert('موفقیت', 'مضمون با موفقیت حذف شد');
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setNewSubject({
      name: '',
      code: '',
      description: '',
      gradeCategory: 'primary',
      classCategories: [],
      gradeLevels: [],
      credits: '',
      hoursPerWeek: '',
      teacher: '',
      subjectType: 'core',
      department: '',
    });
    setEditingSubject(null);
    setShowAddModal(false);
  };

  const toggleGradeLevel = (grade: string) => {
    setNewSubject(prev => ({
      ...prev,
      gradeLevels: prev.gradeLevels.includes(grade)
        ? prev.gradeLevels.filter(g => g !== grade)
        : [...prev.gradeLevels, grade],
    }));
  };

  const toggleClassCategory = (category: string) => {
    setNewSubject(prev => ({
      ...prev,
      classCategories: prev.classCategories.includes(category)
        ? prev.classCategories.filter(c => c !== category)
        : [...prev.classCategories, category],
    }));
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = 
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGradeCategory = selectedGradeCategory === 'all' || subject.gradeCategory === selectedGradeCategory;
    const matchesClassCategory = selectedClassCategory === 'all' || subject.classCategories.includes(selectedClassCategory);
    const matchesSubjectType = selectedSubjectType === 'all' || subject.subjectType === selectedSubjectType;
    
    return matchesSearch && matchesGradeCategory && matchesClassCategory && matchesSubjectType;
  });

  const getGradeCategory = (categoryId: string) => {
    return gradeCategories.find(c => c.id === categoryId) || gradeCategories[0];
  };

  const getSubjectTypeColor = (typeId: string) => {
    const type = subjectTypes.find(t => t.id === typeId);
    return type?.color || '#007AFF';
  };

  const SubjectCard = ({ subject }: { subject: Subject }) => {
    const gradeCategory = getGradeCategory(subject.gradeCategory);
    const subjectType = subjectTypes.find(t => t.id === subject.subjectType);

    return (
      <View style={styles.subjectCard}>
        <View style={styles.subjectHeader}>
          <View style={styles.subjectInfo}>
            <Text style={styles.subjectName}>{subject.name}</Text>
            <Text style={styles.subjectCode}>{subject.code}</Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: gradeCategory.color + '20' }]}>
            <Text style={[styles.categoryText, { color: gradeCategory.color }]}>
              {gradeCategory.label}
            </Text>
          </View>
        </View>
        
        <Text style={styles.subjectDescription} numberOfLines={2}>
          {subject.description}
        </Text>
        
        <View style={styles.subjectDetails}>
          <View style={styles.detailItem}>
            <User size={14} color="#8E8E93" />
            <Text style={styles.detailText}>{subject.teacher}</Text>
          </View>
          <View style={styles.detailItem}>
            <Hash size={14} color="#8E8E93" />
            <Text style={styles.detailText}>{subject.credits} واحد</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={14} color="#8E8E93" />
            <Text style={styles.detailText}>{subject.hoursPerWeek} ساعت/هفته</Text>
          </View>
        </View>
        
        <View style={styles.classCategories}>
          <Text style={styles.sectionLabel}>بخش‌ها:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {subject.classCategories.map(catId => {
              const cat = classCategories.find(c => c.id === catId);
              return cat ? (
                <View key={cat.id} style={[styles.classChip, { borderColor: cat.color }]}>
                  <Text style={[styles.classChipText, { color: cat.color }]}>
                    {cat.icon} {cat.label}
                  </Text>
                </View>
              ) : null;
            })}
          </ScrollView>
        </View>
        
        <View style={styles.gradeLevels}>
          <Text style={styles.sectionLabel}>سطح‌ها:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {subject.gradeLevels.map(grade => (
              <View key={grade} style={styles.gradeChip}>
                <Text style={styles.gradeChipText}>
                  {grade === 'نرسری' ? 'نرسری' : grade === 'باغچه' ? 'باغچه' : `صنف ${grade}`}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.subjectActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditSubject(subject)}
          >
            <Edit2 size={16} color="#007AFF" />
            <Text style={styles.actionText}>ویرایش</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteSubject(subject.id)}
          >
            <Trash2 size={16} color="#FF3B30" />
            <Text style={[styles.actionText, { color: '#FF3B30' }]}>حذف</Text>
          </TouchableOpacity>
          
          <View style={[styles.typeBadge, { backgroundColor: subjectType?.color + '20' }]}>
            <Text style={[styles.typeText, { color: subjectType?.color }]}>
              {subjectType?.label}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>مدیریت مضامین درسی</Text>
          <Text style={styles.subtitle}>
            سازماندهی مضامین بر اساس سطح تحصیلی و بخش‌ها
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <Plus size={20} color="white" />
          <Text style={styles.addButtonText}>مضمون جدید</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="جستجوی مضمون، کد، استاد..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? '#007AFF' : '#8E8E93'} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          {/* Grade Category Filters */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>
              <GraduationCap size={16} color="#8E8E93" /> سطح تحصیلی:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              <TouchableOpacity 
                style={[styles.filterChip, selectedGradeCategory === 'all' && styles.filterChipActive]}
                onPress={() => setSelectedGradeCategory('all')}
              >
                <Text style={[styles.filterChipText, selectedGradeCategory === 'all' && styles.filterChipTextActive]}>
                  🏫 همه
                </Text>
              </TouchableOpacity>
              {gradeCategories.slice(0, -1).map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterChip, 
                    selectedGradeCategory === category.id && styles.filterChipActive,
                    { borderColor: category.color }
                  ]}
                  onPress={() => setSelectedGradeCategory(category.id)}
                >
                  <Text style={[
                    styles.filterChipText, 
                    selectedGradeCategory === category.id && styles.filterChipTextActive,
                    selectedGradeCategory === category.id && { color: category.color }
                  ]}>
                    {category.icon} {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Class Category Filters */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>
              <Layers size={16} color="#8E8E93" /> بخش/رشته:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              <TouchableOpacity 
                style={[styles.filterChip, selectedClassCategory === 'all' && styles.filterChipActive]}
                onPress={() => setSelectedClassCategory('all')}
              >
                <Text style={[styles.filterChipText, selectedClassCategory === 'all' && styles.filterChipTextActive]}>
                  📖 همه بخش‌ها
                </Text>
              </TouchableOpacity>
              {classCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterChip, 
                    selectedClassCategory === category.id && styles.filterChipActive,
                    { borderColor: category.color }
                  ]}
                  onPress={() => setSelectedClassCategory(category.id)}
                >
                  <Text style={[
                    styles.filterChipText, 
                    selectedClassCategory === category.id && styles.filterChipTextActive,
                    selectedClassCategory === category.id && { color: category.color }
                  ]}>
                    {category.icon} {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Subject Type Filters */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>نوع مضمون:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              <TouchableOpacity 
                style={[styles.filterChip, selectedSubjectType === 'all' && styles.filterChipActive]}
                onPress={() => setSelectedSubjectType('all')}
              >
                <Text style={[styles.filterChipText, selectedSubjectType === 'all' && styles.filterChipTextActive]}>
                  همه
                </Text>
              </TouchableOpacity>
              {subjectTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.filterChip, 
                    selectedSubjectType === type.id && styles.filterChipActive,
                    { borderColor: type.color }
                  ]}
                  onPress={() => setSelectedSubjectType(type.id)}
                >
                  <Text style={[
                    styles.filterChipText, 
                    selectedSubjectType === type.id && styles.filterChipTextActive,
                    selectedSubjectType === type.id && { color: type.color }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{subjects.length}</Text>
          <Text style={styles.statLabel}>مضامین کل</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {subjects.filter(s => s.subjectType === 'core').length}
          </Text>
          <Text style={styles.statLabel}>مضامین اصلی</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {subjects.filter(s => s.gradeCategory === 'high').length}
          </Text>
          <Text style={styles.statLabel}>مضامین ثانوی</Text>
        </View>
      </View>

      {/* Subjects List */}
      <FlatList
        data={filteredSubjects}
        renderItem={({ item }) => <SubjectCard subject={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <BookOpen size={48} color="#C7C7CC" />
            <Text style={styles.emptyStateText}>مضمونی با این فیلترها یافت نشد</Text>
            <TouchableOpacity 
              style={styles.resetFiltersButton}
              onPress={() => {
                setSelectedGradeCategory('all');
                setSelectedClassCategory('all');
                setSelectedSubjectType('all');
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetFiltersText}>بازنشانی فیلترها</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal 
        visible={showAddModal} 
        transparent 
        animationType="slide"
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingSubject ? 'ویرایش مضمون' : 'ایجاد مضمون جدید'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <X size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Basic Info */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>نام مضمون *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newSubject.name}
                  onChangeText={(text) => setNewSubject({...newSubject, name: text})}
                  placeholder="مثال: ریاضی عمومی"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>کد مضمون *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newSubject.code}
                    onChangeText={(text) => setNewSubject({...newSubject, code: text.toUpperCase()})}
                    placeholder="MATH-10"
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>نوع مضمون</Text>
                  <View style={styles.selectContainer}>
                    {subjectTypes.map(type => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.selectOption,
                          newSubject.subjectType === type.id && styles.selectOptionActive,
                          { borderColor: type.color }
                        ]}
                        onPress={() => setNewSubject({...newSubject, subjectType: type.id as any})}
                      >
                        <View style={[styles.colorDot, { backgroundColor: type.color }]} />
                        <Text style={styles.selectOptionText}>{type.label}</Text>
                        {newSubject.subjectType === type.id && (
                          <Check size={16} color={type.color} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>توضیحات</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newSubject.description}
                  onChangeText={(text) => setNewSubject({...newSubject, description: text})}
                  placeholder="توضیحات مربوط به مضمون..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Grade Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>سطح تحصیلی *</Text>
                <View style={styles.gradeCategoryGrid}>
                  {gradeCategories.slice(0, -1).map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.gradeCategoryButton,
                        newSubject.gradeCategory === category.id && styles.gradeCategoryButtonActive,
                        { borderColor: category.color }
                      ]}
                      onPress={() => {
                        setNewSubject({
                          ...newSubject,
                          gradeCategory: category.id as any,
                          gradeLevels: []
                        });
                      }}
                    >
                      <Text style={[styles.gradeCategoryIcon, { fontSize: 20 }]}>
                        {category.icon}
                      </Text>
                      <Text style={[
                        styles.gradeCategoryText,
                        newSubject.gradeCategory === category.id && styles.gradeCategoryTextActive,
                        newSubject.gradeCategory === category.id && { color: category.color }
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Grade Levels */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>صنف‌ها *</Text>
                <View style={styles.gradeGrid}>
                  {getGradeCategory(newSubject.gradeCategory).grades.map(grade => (
                    <TouchableOpacity
                      key={grade}
                      style={[
                        styles.gradeButton,
                        newSubject.gradeLevels.includes(grade) && styles.gradeButtonActive
                      ]}
                      onPress={() => toggleGradeLevel(grade)}
                    >
                      <Text style={[
                        styles.gradeButtonText,
                        newSubject.gradeLevels.includes(grade) && styles.gradeButtonTextActive
                      ]}>
                        {grade === 'نرسری' ? 'نرسری' : grade === 'باغچه' ? 'باغچه' : `صنف ${grade}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Class Categories */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>بخش/رشته</Text>
                <View style={styles.classCategoryGrid}>
                  {classCategories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.classCategoryButton,
                        newSubject.classCategories.includes(category.id) && styles.classCategoryButtonActive,
                        { borderColor: category.color }
                      ]}
                      onPress={() => toggleClassCategory(category.id)}
                    >
                      <Text style={[styles.classCategoryIcon, { fontSize: 20 }]}>
                        {category.icon}
                      </Text>
                      <Text style={[
                        styles.classCategoryText,
                        newSubject.classCategories.includes(category.id) && styles.classCategoryTextActive,
                        newSubject.classCategories.includes(category.id) && { color: category.color }
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Hours and Credits */}
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>تعداد واحد</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newSubject.credits}
                    onChangeText={(text) => setNewSubject({...newSubject, credits: text})}
                    placeholder="4"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>ساعت در هفته</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newSubject.hoursPerWeek}
                    onChangeText={(text) => setNewSubject({...newSubject, hoursPerWeek: text})}
                    placeholder="6"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Teacher Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>استاد مسئول</Text>
                <View style={styles.selectContainer}>
                  {teachers.map(teacher => (
                    <TouchableOpacity
                      key={teacher}
                      style={[
                        styles.selectOption,
                        newSubject.teacher === teacher && styles.selectOptionActive
                      ]}
                      onPress={() => setNewSubject({...newSubject, teacher})}
                    >
                      <User size={16} color="#8E8E93" />
                      <Text style={styles.selectOptionText}>{teacher}</Text>
                      {newSubject.teacher === teacher && (
                        <Check size={16} color="#007AFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Department */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>دیپارتمنت (اختیاری)</Text>
                <View style={styles.selectContainer}>
                  {departments.map(dept => (
                    <TouchableOpacity
                      key={dept}
                      style={[
                        styles.selectOption,
                        newSubject.department === dept && styles.selectOptionActive
                      ]}
                      onPress={() => setNewSubject({...newSubject, department: dept})}
                    >
                      <School size={16} color="#8E8E93" />
                      <Text style={styles.selectOptionText}>{dept}</Text>
                      {newSubject.department === dept && (
                        <Check size={16} color="#007AFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetForm}
              >
                <Text style={styles.cancelButtonText}>لغو</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveSubject}
              >
                <Text style={styles.saveButtonText}>
                  {editingSubject ? 'به‌روزرسانی' : 'ایجاد مضمون'}
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
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  headerContent: {
    marginBottom: 12,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#1c1c1e'
  },
  subtitle: { 
    fontSize: 14, 
    color: '#8E8E93',
    marginTop: 4
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  addButtonText: { 
    color: 'white', 
    fontWeight: '600',
    fontSize: 16
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#f2f2f7',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  searchInput: { 
    marginLeft: 12, 
    flex: 1,
    fontSize: 16,
    color: '#1c1c1e',
  },
  filterButton: {
    padding: 4,
  },
  filterButtonActive: {
    backgroundColor: '#e3f2ff',
    borderRadius: 8,
  },
  filtersPanel: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterChips: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f2f2f7',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  filterChipActive: {
    backgroundColor: '#e3f2ff',
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filterChipTextActive: {
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e5ea',
    marginHorizontal: 8,
  },
  listContent: {
    padding: 16,
  },
  subjectCard: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: { 
    fontSize: 18, 
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 2
  },
  subjectCode: { 
    fontSize: 14,
    color: '#8E8E93',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subjectDescription: {
    fontSize: 14,
    color: '#1c1c1e',
    lineHeight: 20,
    marginBottom: 12,
  },
  subjectDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    marginRight: 8,
  },
  classCategories: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gradeLevels: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  classChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
  },
  classChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  gradeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    marginRight: 6,
  },
  gradeChipText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  subjectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f7',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: { 
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  typeBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  resetFiltersButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  resetFiltersText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    borderBottomColor: '#f2f2f7',
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '600',
    color: '#1c1c1e'
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1c1c1e',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectContainer: {
    gap: 8,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  selectOptionActive: {
    backgroundColor: '#e3f2ff',
    borderColor: '#007AFF',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#1c1c1e',
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  gradeCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gradeCategoryButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  gradeCategoryButtonActive: {
    backgroundColor: '#e3f2ff',
    borderWidth: 2,
  },
  gradeCategoryIcon: {
    marginBottom: 8,
  },
  gradeCategoryText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
  },
  gradeCategoryTextActive: {
    fontWeight: '600',
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gradeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    minWidth: 70,
    alignItems: 'center',
  },
  gradeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  gradeButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  gradeButtonTextActive: {
    color: 'white',
  },
  classCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classCategoryButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  classCategoryButtonActive: {
    backgroundColor: '#e3f2ff',
    borderWidth: 2,
  },
  classCategoryIcon: {
    marginBottom: 4,
  },
  classCategoryText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
  },
  classCategoryTextActive: {
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: { 
    color: 'white', 
    fontWeight: '600',
    fontSize: 16
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  cancelButtonText: { 
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500'
  },
});
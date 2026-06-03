import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const qualifications = [
  {
    id: '1',
    degree: 'Master of Education',
    field: 'Mathematics Education',
    institution: 'University of Tehran',
    year: '2018',
    duration: '2 years'
  },
  {
    id: '2',
    degree: 'Bachelor of Science',
    field: 'Pure Mathematics',
    institution: 'Sharif University',
    year: '2015',
    duration: '4 years'
  },
  {
    id: '3',
    degree: 'Teaching Certification',
    field: 'Secondary Education',
    institution: 'Iranian Ministry of Education',
    year: '2016',
    duration: '1 year'
  },
];

const certifications = [
  { id: '1', name: 'Google Certified Educator Level 2', issuer: 'Google for Education', year: '2022' },
  { id: '2', name: 'Microsoft Innovative Educator', issuer: 'Microsoft Education', year: '2021' },
  { id: '3', name: 'Advanced Mathematics Teaching', issuer: 'National Teacher Academy', year: '2020' },
];

const schedule = [
  { day: 'Monday', classes: ['Math 101 (8:00-9:00)', 'Math 201 (10:00-11:00)', 'Office Hours (2:00-3:00)'] },
  { day: 'Tuesday', classes: ['Math 101 (8:00-9:00)', 'Advanced Calculus (11:00-12:00)'] },
  { day: 'Wednesday', classes: ['Math 201 (10:00-11:00)', 'Faculty Meeting (1:00-2:00)'] },
  { day: 'Thursday', classes: ['Math 101 (8:00-9:00)', 'Advanced Calculus (11:00-12:00)'] },
  { day: 'Friday', classes: ['Math 201 (10:00-11:00)', 'Research Time (1:00-3:00)'] },
];

export default function QualificationsPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Qualifications & Schedule</Text>
        </View>

        {/* Profile Summary */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>DR</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Dr. Reza Mohammadi</Text>
            <Text style={styles.profileTitle}>Mathematics Department Head</Text>
            <View style={styles.profileStats}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Years Exp.</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>4</Text>
                <Text style={styles.statLabel}>Classes</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>120</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Qualifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Educational Qualifications</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>
          
          {qualifications.map((qual) => (
            <View key={qual.id} style={styles.qualificationCard}>
              <View style={styles.qualIcon}>
                <Ionicons name="school-outline" size={24} color="#2196F3" />
              </View>
              <View style={styles.qualDetails}>
                <Text style={styles.qualDegree}>{qual.degree}</Text>
                <Text style={styles.qualField}>{qual.field}</Text>
                <View style={styles.qualMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="business-outline" size={14} color="#666" />
                    <Text style={styles.metaText}>{qual.institution}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color="#666" />
                    <Text style={styles.metaText}>{qual.year} • {qual.duration}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.menuButton}>
                <Ionicons name="ellipsis-vertical" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Certifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Professional Certifications</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>
          
          {certifications.map((cert) => (
            <View key={cert.id} style={styles.certificationCard}>
              <View style={styles.certIcon}>
                <Ionicons name="ribbon-outline" size={20} color="#4CAF50" />
              </View>
              <View style={styles.certDetails}>
                <Text style={styles.certName}>{cert.name}</Text>
                <View style={styles.certMeta}>
                  <Text style={styles.certIssuer}>{cert.issuer}</Text>
                  <Text style={styles.certYear}>• {cert.year}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Teaching Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            <TouchableOpacity>
              <Text style={styles.editScheduleText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scheduleContainer}>
            {schedule.map((day) => (
              <View key={day.day} style={styles.scheduleDay}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>{day.day}</Text>
                  <Text style={styles.classCount}>{day.classes.length} classes</Text>
                </View>
                <View style={styles.classesList}>
                  {day.classes.map((className, index) => (
                    <View key={index} style={styles.classItem}>
                      <View style={styles.classDot} />
                      <Text style={styles.className}>{className}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.contactText}>reza.mohammadi@school.edu</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.contactText}>+98 21 1234 5678</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.contactText}>Room 201, Mathematics Building</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.contactText}>Office Hours: Mon-Wed 2:00-3:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Skills & Expertise */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Expertise</Text>
          <View style={styles.skillsContainer}>
            {['Advanced Mathematics', 'Curriculum Development', 'Educational Technology', 'Student Mentoring', 'Research Methodology'].map((skill) => (
              <View key={skill} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  profileStats: {
    flexDirection: 'row',
  },
  stat: {
    alignItems: 'center',
    marginRight: 24,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    padding: 4,
  },
  editScheduleText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  qualificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  qualIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  qualDetails: {
    flex: 1,
  },
  qualDegree: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  qualField: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  qualMeta: {
    flexDirection: 'row',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  menuButton: {
    padding: 8,
  },
  certificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  certIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  certDetails: {
    flex: 1,
  },
  certName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  certMeta: {
    flexDirection: 'row',
  },
  certIssuer: {
    fontSize: 12,
    color: '#666',
  },
  certYear: {
    fontSize: 12,
    color: '#666',
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  viewButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  scheduleContainer: {
    marginTop: 8,
  },
  scheduleDay: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  classCount: {
    fontSize: 12,
    color: '#666',
  },
  classesList: {
    marginLeft: 12,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  classDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2196F3',
    marginRight: 12,
  },
  className: {
    fontSize: 14,
    color: '#666',
  },
  contactInfo: {
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillTag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: '#333',
  },
});
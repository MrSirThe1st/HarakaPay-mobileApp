import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, CreditCard, Users, Clock, FileText } from 'lucide-react-native';
import { useStudentLinking } from '../hooks/useStudentLinking';
import { StudentMatch } from '../types/user';

export default function PaymentSelectionScreen(props: any) {
  const { navigation } = props;
  const { linkedStudents, loading } = useStudentLinking();
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const filteredStudents = linkedStudents.filter(student =>
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStudentCard = (student: StudentMatch) => (
    <TouchableOpacity
      key={student.id}
      style={styles.studentCard}
      onPress={() => navigation.navigate('StudentPayment', { student })}
    >
      <View style={styles.studentHeader}>
        <View style={styles.studentAvatar}>
          <Text style={styles.studentAvatarText}>
            {student.first_name[0]}{student.last_name[0]}
          </Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {student.first_name} {student.last_name}
          </Text>
          <Text style={styles.studentDetails}>
            {student.school_name} • Grade {student.grade_level}
          </Text>
          <Text style={styles.studentId}>ID: {student.student_id}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <ArrowLeft size={20} color="#6B7280" style={{ transform: [{ rotate: '180deg' }] }} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay School Fees</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search students..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Pay Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pay Options</Text>


          <TouchableOpacity style={styles.payOption}>
            <View style={styles.payOptionIcon}>
              <CreditCard size={24} color="#3B82F6" />
            </View>
            <Text style={styles.payOptionText}>Pay for specific month</Text>
            <ArrowLeft size={20} color="#6B7280" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.payOption}>
            <View style={styles.payOptionIcon}>
              <FileText size={24} color="#3B82F6" />
            </View>
            <Text style={styles.payOptionText}>View payment history</Text>
            <ArrowLeft size={20} color="#6B7280" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        </View>

        {/* Students List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            My Students ({filteredStudents.length})
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading students...</Text>
            </View>
          ) : filteredStudents.length > 0 ? (
            <View style={styles.studentsList}>
              {filteredStudents.map(renderStudentCard)}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Users size={48} color="#6B7280" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No students found' : 'No students linked'}
              </Text>
              <Text style={styles.emptyDescription}>
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Link your children to make payments'
                }
              </Text>
            </View>
          )}
        </View>

        {/* Recent Payments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Payments</Text>
          
          <View style={styles.recentPayment}>
            <View style={styles.recentAvatar}>
              <Text style={styles.recentAvatarText}>JD</Text>
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentName}>John Doe</Text>
              <Text style={styles.recentDetails}>HARAKA SCHOOL • Grade 5</Text>
              <Text style={styles.recentAmount}>R 1,200.00</Text>
            </View>
            <View style={styles.recentStatus}>
              <Text style={styles.recentStatusText}>Paid</Text>
            </View>
          </View>

          <View style={styles.recentPayment}>
            <View style={styles.recentAvatar}>
              <Text style={styles.recentAvatarText}>MJ</Text>
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentName}>Mary Jane</Text>
              <Text style={styles.recentDetails}>HARAKA SCHOOL • Grade 3</Text>
              <Text style={styles.recentAmount}>R 1,200.00</Text>
            </View>
            <View style={styles.recentStatus}>
              <Text style={styles.recentStatusText}>Paid</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  payOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  studentsList: {
    gap: 12,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  studentAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  studentDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  studentId: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  arrowContainer: {
    marginLeft: 12,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  recentPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8D1C3D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recentAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  recentDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  recentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  recentStatus: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
});

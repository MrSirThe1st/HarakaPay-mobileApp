import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, SafeAreaView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users } from 'lucide-react-native';
import { useStudentLinking } from '../hooks/useStudentLinking';
import { StudentMatch } from '../types/user';

export default function StudentsScreen() {
  const { linkedStudents, refreshLinkedStudents, loading } = useStudentLinking();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshLinkedStudents();
    setRefreshing(false);
  };

  const renderStudentCard = (student: StudentMatch) => (
    <View key={student.id} style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {student.first_name.charAt(0)}{student.last_name.charAt(0)}
          </Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {student.first_name} {student.last_name}
          </Text>
          <Text style={styles.studentId}>ID: {student.student_id}</Text>
          <Text style={styles.schoolName}>{student.school_name}</Text>
        </View>
      </View>
      
      <View style={styles.studentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Grade:</Text>
          <Text style={styles.detailValue}>{student.grade_level || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>School ID:</Text>
          <Text style={styles.detailValue}>{student.school_id.substring(0, 8)}...</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>My Children</Text>
        <Text style={styles.subtitle}>
          {linkedStudents.length} child(ren) linked
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading children...</Text>
            </View>
          ) : linkedStudents.length > 0 ? (
            linkedStudents.map(renderStudentCard)
          ) : (
            <View style={styles.emptyCard}>
              <Users size={48} color="#6B7280" />
              <Text style={styles.emptyTitle}>No children linked yet</Text>
              <Text style={styles.emptyDescription}>
                Your linked children will appear here
              </Text>
            </View>
          )}
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
    padding: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  loadingCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  schoolName: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  studentDetails: {
    padding: 20,
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
});

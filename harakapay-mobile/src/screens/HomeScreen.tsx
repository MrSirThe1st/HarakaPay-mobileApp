import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useStudentLinking } from '../hooks/useStudentLinking';
import StudentLinkingModal from '../components/StudentLinkingModal';
import { StudentMatch } from '../types/user';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { linkedStudents, refreshLinkedStudents } = useStudentLinking();
  const [showStudentModal, setShowStudentModal] = useState(false);

  const handleStudentLinked = (student: StudentMatch) => {
    console.log('Student linked:', student.first_name, student.last_name);
    // Refresh the linked students list
    refreshLinkedStudents();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to HarakaPay</Text>
        <Text style={styles.subtitle}>
          Hello, {profile?.first_name || profile?.email}!
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => setShowStudentModal(true)}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👨‍👩‍👧‍👦</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>
                {linkedStudents.length > 0 ? 'My Children' : 'Link Your Children'}
              </Text>
              <Text style={styles.cardDescription}>
                {linkedStudents.length > 0 
                  ? `${linkedStudents.length} child(ren) linked` 
                  : 'Connect your account to your children\'s records'
                }
              </Text>
              {linkedStudents.length > 0 && (
                <Text style={styles.schoolStatus}>
                  ✓ {linkedStudents.map(s => s.first_name).join(', ')} linked
                </Text>
              )}
            </View>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👨‍��‍👧‍👦</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>View Students</Text>
              <Text style={styles.cardDescription}>
                Manage your children's information
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </View>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>💳</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Make Payment</Text>
              <Text style={styles.cardDescription}>
                Pay school fees securely
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.card}>
            <Text style={styles.emptyText}>No recent activity yet</Text>
          </View>
        </View>
      </View>

      <StudentLinkingModal
        visible={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        onStudentLinked={handleStudentLinked}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  content: {
    padding: 24,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 20,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  arrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 32,
  },
  schoolStatus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
});

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, Users, School, History, MessageCircle, Eye, Plus, RefreshCw } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useStudentLinking } from '../hooks/useStudentLinking';
import StudentLinkingModal from '../components/StudentLinkingModal';
import { StudentMatch } from '../types/user';

export default function HomeScreen({ navigation }: any) {
  const { profile } = useAuth();
  const { linkedStudents, refreshLinkedStudents, loading } = useStudentLinking();
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const handleStudentLinked = (student: StudentMatch) => {
    console.log('Student linked:', student.first_name, student.last_name);
    // Refresh the linked students list with force refresh
    refreshLinkedStudents(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshLinkedStudents(true);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      
      {/* Header Section */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(profile?.first_name?.[0] || 'U') + (profile?.last_name?.[0] || '')}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {profile?.first_name} {profile?.last_name}
              </Text>
              <Text style={styles.userRole}>Parent Account</Text>
            </View>
          </View>

        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Top Action Buttons */}
        <View style={styles.topActions}>
          <TouchableOpacity 
            style={styles.topActionButton}
            onPress={() => navigation.navigate('PaymentSelection')}
          >
            <View style={styles.topActionIcon}>
              <CreditCard size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.topActionLabel}>Make Payment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.topActionButton}
            onPress={() => setShowStudentModal(true)}
          >
            <View style={styles.topActionIcon}>
              <Users size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.topActionLabel}>Add Children</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        {/* <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('PaymentSelection')}
            >
              <View style={styles.quickActionIcon}>
                <CreditCard size={24} color="#3B82F6" />
              </View>
              <Text style={styles.quickActionLabel}>Pay Fees</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={styles.quickActionIcon}>
                <School size={24} color="#3B82F6" />
              </View>
              <Text style={styles.quickActionLabel}>Schools</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={styles.quickActionIcon}>
                <Users size={24} color="#3B82F6" />
              </View>
              <Text style={styles.quickActionLabel}>Students</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={styles.quickActionIcon}>
                <History size={24} color="#3B82F6" />
              </View>
              <Text style={styles.quickActionLabel}>History</Text>
            </TouchableOpacity>
          </View>
        </View> */}

        {/* Children Cards Section */}
        <View style={styles.childrenSection}>
          <View style={styles.childrenHeader}>
            <Text style={styles.sectionTitle}>
              My Children ({linkedStudents.length})
            </Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => refreshLinkedStudents(true)}
              disabled={loading}
            >
              <RefreshCw size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          {linkedStudents.length > 0 ? (
            <View style={styles.childrenCards}>
              {linkedStudents.map((student, index) => (
                <TouchableOpacity 
                  key={student.id} 
                  style={styles.childCard}
                  onPress={() => navigation.navigate('StudentPayment', { student })}
                >
                  <View style={styles.childCardHeader}>
                    <View style={styles.childAvatar}>
                      <Text style={styles.childAvatarText}>
                        {student.first_name[0]}{student.last_name[0]}
                      </Text>
                    </View>
                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>
                        {student.first_name} {student.last_name}
                      </Text>
                      <Text style={styles.childId}>ID: {student.student_id}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.childCardBody}>
                    <View style={styles.childDetail}>
                      <Text style={styles.childDetailLabel}>School</Text>
                      <Text style={styles.childDetailValue}>{student.school_name}</Text>
                    </View>
                    <View style={styles.childDetail}>
                      <Text style={styles.childDetailLabel}>Grade</Text>
                      <Text style={styles.childDetailValue}>{student.grade_level}</Text>
                    </View>
                  </View>
                  
                 
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Users size={48} color="#6B7280" />
              <Text style={styles.emptyStateTitle}>No Children Linked</Text>
              <Text style={styles.emptyStateDescription}>
                Tap "Add Children" above to link your children's accounts
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => setShowStudentModal(true)}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.emptyStateButtonText}>Link Children</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Promotional Section */}
        <View style={styles.promotionalSection}>
          <View style={styles.promotionalCard}>
            <View style={styles.promotionalContent}>
              <Text style={styles.promotionalTitle}>School Fee Hub</Text>
              <Text style={styles.promotionalDescription}>
                Manage all your children's school fees in one place
              </Text>
            </View>
            <View style={styles.promotionalIcon}>
              <School size={40} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </ScrollView>

      <StudentLinkingModal
        visible={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        onStudentLinked={handleStudentLinked}
      />
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userRole: {
    color: '#E0E7FF',
    fontSize: 14,
  },
  supportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  topActionButton: {
    flex: 1,
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  topActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  topActionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  childrenSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  childrenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  childrenCards: {
    gap: 15,
  },
  childCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  childCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  childAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  childId: {
    fontSize: 14,
    color: '#6B7280',
  },
  childStatus: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  childCardBody: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  childDetail: {
    flex: 1,
  },
  childDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  childDetailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  childCardFooter: {
    flexDirection: 'row',
    gap: 10,
  },
  childActionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  childActionText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  promotionalSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  promotionalCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promotionalContent: {
    flex: 1,
  },
  promotionalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  promotionalDescription: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
  },
  promotionalIcon: {
    marginLeft: 15,
  },
  promotionalEmoji: {
    fontSize: 40,
  },
});
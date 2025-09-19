import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useSchools } from '../hooks/useSchools';
import { useAuth } from '../context/AuthContext';
import { School } from '../types/user';

export default function SchoolsScreen() {
  const { profile } = useAuth();
  const { 
    schools, 
    loading, 
    error, 
    refreshSchools
  } = useSchools(profile?.user_id);

  const renderSchoolCard = (school: School) => {
    return (
      <View key={school.id} style={styles.schoolCard}>
        <View style={styles.schoolHeader}>
          <Text style={styles.schoolIcon}>🏫</Text>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{school.name}</Text>
            {school.address && (
              <Text style={styles.schoolAddress}>{school.address}</Text>
            )}
          </View>
        </View>
        
        {(school.contact_email || school.contact_phone) && (
          <View style={styles.schoolContact}>
            {school.contact_phone && (
              <Text style={styles.contactText}>📞 {school.contact_phone}</Text>
            )}
            {school.contact_email && (
              <Text style={styles.contactText}>✉️ {school.contact_email}</Text>
            )}
          </View>
        )}
        
        <View style={styles.schoolStatus}>
          <View style={[
            styles.statusBadge,
            school.status === 'approved' ? styles.approvedStatus : styles.pendingStatus
          ]}>
            <Text style={styles.statusText}>
              {school.status === 'approved' ? 'Approved' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && schools.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading schools...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshSchools} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Schools</Text>
        <Text style={styles.subtitle}>
          Available schools in the system
        </Text>
      </View>
      
      <View style={styles.content}>
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshSchools}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {schools.length === 0 && !loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🏫</Text>
            <Text style={styles.emptyTitle}>No schools available</Text>
            <Text style={styles.emptyDescription}>
              Schools will appear here once they're added to the system
            </Text>
          </View>
        ) : (
          <View style={styles.schoolsList}>
            {schools.map(renderSchoolCard)}
          </View>
        )}
      </View>
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
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    marginTop: 8,
  },
  content: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  schoolsList: {
    gap: 16,
  },
  schoolCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 16,
  },
  schoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  schoolIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  schoolContact: {
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  schoolStatus: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  approvedStatus: {
    backgroundColor: '#D1FAE5',
  },
  pendingStatus: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  },
});

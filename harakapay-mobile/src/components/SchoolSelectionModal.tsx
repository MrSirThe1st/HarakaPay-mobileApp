import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSchools } from '../hooks/useSchools';
import { useAuth } from '../context/AuthContext';
import { School } from '../types/user';

interface SchoolSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSchoolSelected?: (school: School) => void;
}

export default function SchoolSelectionModal({
  visible,
  onClose,
  onSchoolSelected,
}: SchoolSelectionModalProps) {
  const { profile } = useAuth();
  const {
    schools,
    selectedSchool,
    loading,
    error,
    refreshSchools,
    selectSchool,
  } = useSchools(profile?.user_id);

  const handleSchoolSelect = async (school: School) => {
    try {
      await selectSchool(school.id);
      Alert.alert(
        'School Selected',
        `You have selected ${school.name}. You can now view your children and make payments.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onSchoolSelected?.(school);
              onClose();
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to select school. Please try again.');
    }
  };

  const renderSchoolCard = (school: School) => {
    const isSelected = selectedSchool?.id === school.id;

    return (
      <TouchableOpacity
        key={school.id}
        style={[styles.schoolCard, isSelected && styles.selectedSchoolCard]}
        onPress={() => handleSchoolSelect(school)}
        disabled={loading}
      >
        <View style={styles.schoolHeader}>
          <Text style={styles.schoolIcon}>🏫</Text>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{school.name}</Text>
            {school.address && (
              <Text style={styles.schoolAddress}>{school.address}</Text>
            )}
          </View>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedText}>✓</Text>
            </View>
          )}
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
          <View
            style={[
              styles.statusBadge,
              school.status === 'approved'
                ? styles.approvedStatus
                : styles.pendingStatus,
            ]}
          >
            <Text style={styles.statusText}>
              {school.status === 'approved' ? 'Approved' : 'Pending'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select School</Text>
          <Text style={styles.subtitle}>Choose your child's school</Text>
        </View>

        <View style={styles.content}>
          {loading && schools.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading schools...</Text>
            </View>
          ) : (
            <ScrollView style={styles.schoolsList}>
              {error && (
                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={refreshSchools}
                  >
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
                schools.map(renderSchoolCard)
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
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
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
  },
  schoolCard: {
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSchoolCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
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
  selectedBadge: {
    backgroundColor: '#3B82F6',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
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

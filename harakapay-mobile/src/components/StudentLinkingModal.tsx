import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useStudentLinking } from '../hooks/useStudentLinking';
import { useSchools } from '../hooks/useSchools';
import { StudentMatch, School } from '../types/user';

interface StudentLinkingModalProps {
  visible: boolean;
  onClose: () => void;
  onStudentLinked?: (student: StudentMatch) => void;
}

export default function StudentLinkingModal({
  visible,
  onClose,
  onStudentLinked,
}: StudentLinkingModalProps) {
  const { options, searchAutomaticMatches, searchManualMatches, createRelationship, setChildName, setSelectedSchool } = useStudentLinking();
  const { schools } = useSchools();
  const [activeTab, setActiveTab] = useState<'automatic' | 'manual'>('automatic');

  const handleAutomaticSearch = async () => {
    await searchAutomaticMatches();
  };

  const handleManualSearch = async () => {
    if (!options.manual.childName || !options.manual.selectedSchool) {
      Alert.alert('Missing Information', 'Please enter your child\'s name and select a school');
      return;
    }
    await searchManualMatches(options.manual.childName, options.manual.selectedSchool.id);
  };

  const handleLinkStudent = async (student: StudentMatch) => {
    try {
      const success = await createRelationship(student.id);
      if (success) {
        Alert.alert(
          'Success',
          `Successfully linked to ${student.first_name} ${student.last_name}`,
          [
            {
              text: 'OK',
              onPress: () => {
                onStudentLinked?.(student);
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to link student. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while linking the student.');
    }
  };

  const renderStudentCard = (student: StudentMatch, index: number) => {
    const getConfidenceColor = (confidence: string) => {
      switch (confidence) {
        case 'high': return '#10B981';
        case 'medium': return '#F59E0B';
        case 'low': return '#EF4444';
        default: return '#6B7280';
      }
    };

    return (
      <View key={student.id} style={styles.studentCard}>
        <View style={styles.studentHeader}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>
              {student.first_name} {student.last_name}
            </Text>
            <Text style={styles.studentDetails}>
              {student.school_name} • Grade {student.grade_level || 'N/A'}
            </Text>
            <Text style={styles.studentId}>ID: {student.student_id}</Text>
          </View>
          <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(student.match_confidence) }]}>
            <Text style={styles.confidenceText}>
              {student.match_confidence.toUpperCase()}
            </Text>
          </View>
        </View>

        {student.match_reasons.length > 0 && (
          <View style={styles.matchReasons}>
            <Text style={styles.matchReasonsTitle}>Match reasons:</Text>
            {student.match_reasons.map((reason, idx) => (
              <Text key={idx} style={styles.matchReason}>• {reason}</Text>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => handleLinkStudent(student)}
        >
          <Text style={styles.linkButtonText}>Link Student</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAutomaticTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Automatic Student Linking</Text>
        <Text style={styles.sectionDescription}>
          We'll search for students using your profile information (name and email)
        </Text>
        
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleAutomaticSearch}
          disabled={options.automatic.loading}
        >
          {options.automatic.loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.searchButtonText}>Search for My Children</Text>
          )}
        </TouchableOpacity>
      </View>

      {options.automatic.error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{options.automatic.error}</Text>
        </View>
      )}

      {options.automatic.matches.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>
            Found {options.automatic.matches.length} potential match(es)
          </Text>
          {options.automatic.matches.map(renderStudentCard)}
        </View>
      )}
    </View>
  );

  const renderManualTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Manual Student Search</Text>
        <Text style={styles.sectionDescription}>
          Enter your child's name and select their school
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Child's Name</Text>
          <TextInput
            style={styles.textInput}
            value={options.manual.childName}
            onChangeText={setChildName}
            placeholder="Enter your child's full name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>School</Text>
          <ScrollView style={styles.schoolSelector} horizontal showsHorizontalScrollIndicator={false}>
            {schools.map((school) => (
              <TouchableOpacity
                key={school.id}
                style={[
                  styles.schoolOption,
                  options.manual.selectedSchool?.id === school.id && styles.selectedSchoolOption
                ]}
                onPress={() => setSelectedSchool(school)}
              >
                <Text style={[
                  styles.schoolOptionText,
                  options.manual.selectedSchool?.id === school.id && styles.selectedSchoolOptionText
                ]}>
                  {school.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[
            styles.searchButton,
            (!options.manual.childName || !options.manual.selectedSchool) && styles.disabledButton
          ]}
          onPress={handleManualSearch}
          disabled={options.manual.loading || !options.manual.childName || !options.manual.selectedSchool}
        >
          {options.manual.loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.searchButtonText}>Search Students</Text>
          )}
        </TouchableOpacity>
      </View>

      {options.manual.error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{options.manual.error}</Text>
        </View>
      )}

      {options.manual.matches.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>
            Found {options.manual.matches.length} student(s)
          </Text>
          {options.manual.matches.map(renderStudentCard)}
        </View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              console.log('Close button pressed');
              onClose();
            }} 
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Link Your Children</Text>
          <Text style={styles.subtitle}>Connect your account to your children's records</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'automatic' && styles.activeTab]}
            onPress={() => setActiveTab('automatic')}
          >
            <Text style={[styles.tabText, activeTab === 'automatic' && styles.activeTabText]}>
              Automatic
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'manual' && styles.activeTab]}
            onPress={() => setActiveTab('manual')}
          >
            <Text style={[styles.tabText, activeTab === 'manual' && styles.activeTabText]}>
              Manual
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === 'automatic' ? renderAutomaticTab() : renderManualTab()}
        </ScrollView>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  tabContent: {
    flex: 1,
  },
  searchSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  schoolSelector: {
    marginTop: 8,
  },
  schoolOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  selectedSchoolOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  schoolOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedSchoolOptionText: {
    color: 'white',
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  },
  resultsSection: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  studentCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  studentDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  matchReasons: {
    marginBottom: 16,
  },
  matchReasonsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  matchReason: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  linkButton: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  linkButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

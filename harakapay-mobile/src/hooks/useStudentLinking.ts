import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentLinkingService } from '../services/studentLinkingService';
import { StudentMatch, School, StudentLinkingOptions } from '../types/user';

interface UseStudentLinkingReturn {
  options: StudentLinkingOptions;
  linkedStudents: StudentMatch[];
  searchAutomaticMatches: () => Promise<void>;
  searchManualMatches: (childName: string, schoolId: string) => Promise<void>;
  createRelationship: (studentId: string) => Promise<boolean>;
  clearMatches: () => void;
  setChildName: (name: string) => void;
  setSelectedSchool: (school: School | null) => void;
  refreshLinkedStudents: () => Promise<void>;
}

export const useStudentLinking = (): UseStudentLinkingReturn => {
  const { profile } = useAuth();
  const [options, setOptions] = useState<StudentLinkingOptions>({
    automatic: {
      enabled: false,
      matches: [],
      loading: false,
      error: null,
    },
    manual: {
      enabled: false,
      childName: '',
      selectedSchool: null,
      matches: [],
      loading: false,
      error: null,
    },
  });
  const [linkedStudents, setLinkedStudents] = useState<StudentMatch[]>([]);

  // Get parent ID from profile
  const parentId = profile?.id;

  // Load linked students on mount
  useEffect(() => {
    if (parentId) {
      refreshLinkedStudents();
    }
  }, [parentId]);

  const searchAutomaticMatches = async () => {
    if (!profile) {
      setOptions(prev => ({
        ...prev,
        automatic: {
          ...prev.automatic,
          error: 'Profile not found',
          loading: false,
        },
      }));
      return;
    }

    setOptions(prev => ({
      ...prev,
      automatic: {
        ...prev.automatic,
        enabled: true,
        loading: true,
        error: null,
      },
    }));

    try {
      const matches = await StudentLinkingService.findAutomaticMatches(
        `${profile.first_name} ${profile.last_name}`,
        profile.email,
        profile.phone
      );

      setOptions(prev => ({
        ...prev,
        automatic: {
          ...prev.automatic,
          matches,
          loading: false,
          error: matches.length === 0 ? 'No students found matching your information' : null,
        },
      }));
    } catch (error) {
      setOptions(prev => ({
        ...prev,
        automatic: {
          ...prev.automatic,
          loading: false,
          error: 'Failed to search for students',
        },
      }));
    }
  };

  const searchManualMatches = async (childName: string, schoolId: string) => {
    if (!childName || !schoolId) {
      setOptions(prev => ({
        ...prev,
        manual: {
          ...prev.manual,
          error: 'Please enter child name and select a school',
          loading: false,
        },
      }));
      return;
    }

    setOptions(prev => ({
      ...prev,
      manual: {
        ...prev.manual,
        enabled: true,
        loading: true,
        error: null,
      },
    }));

    try {
      const matches = await StudentLinkingService.findManualMatches(childName, schoolId);

      setOptions(prev => ({
        ...prev,
        manual: {
          ...prev.manual,
          matches,
          loading: false,
          error: matches.length === 0 ? 'No students found with that name in the selected school' : null,
        },
      }));
    } catch (error) {
      setOptions(prev => ({
        ...prev,
        manual: {
          ...prev.manual,
          loading: false,
          error: 'Failed to search for students',
        },
      }));
    }
  };

  const createRelationship = async (studentId: string): Promise<boolean> => {
    if (!parentId) {
      console.error('Parent ID not found');
      return false;
    }

    try {
      const success = await StudentLinkingService.createRelationship(parentId, studentId);
      
      if (success) {
        // Refresh linked students
        await refreshLinkedStudents();
        
        // Clear matches
        clearMatches();
      }
      
      return success;
    } catch (error) {
      console.error('Error creating relationship:', error);
      return false;
    }
  };

  const clearMatches = () => {
    setOptions({
      automatic: {
        enabled: false,
        matches: [],
        loading: false,
        error: null,
      },
      manual: {
        enabled: false,
        childName: '',
        selectedSchool: null,
        matches: [],
        loading: false,
        error: null,
      },
    });
  };

  const setChildName = (name: string) => {
    setOptions(prev => ({
      ...prev,
      manual: {
        ...prev.manual,
        childName: name,
        error: null,
      },
    }));
  };

  const setSelectedSchool = (school: School | null) => {
    setOptions(prev => ({
      ...prev,
      manual: {
        ...prev.manual,
        selectedSchool: school,
        error: null,
      },
    }));
  };

  const refreshLinkedStudents = async () => {
    if (!parentId) return;

    try {
      const students = await StudentLinkingService.getLinkedStudents(parentId);
      setLinkedStudents(students);
    } catch (error) {
      console.error('Error refreshing linked students:', error);
    }
  };

  return {
    options,
    linkedStudents,
    searchAutomaticMatches,
    searchManualMatches,
    createRelationship,
    clearMatches,
    setChildName,
    setSelectedSchool,
    refreshLinkedStudents,
  };
};

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentLinkingService } from '../services/studentLinkingService';
import { StudentMatch, School, StudentLinkingOptions } from '../types/user';
import { supabase } from '../lib/supabase';
import { PersistenceService } from '../services/persistenceService';

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

  // Get parent ID from API
  const [parentId, setParentId] = useState<string | null>(null);

  // Fetch parent ID from API
  const fetchParentId = async () => {
    if (!profile) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No active session found');
        return;
      }

      const response = await fetch('http://192.168.1.120:3000/api/parent/get-parent-id', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching parent ID:', errorData);
        return;
      }

      const data = await response.json();
      setParentId(data.parentId);
    } catch (error) {
      console.error('Error fetching parent ID:', error);
    }
  };

  // Load parent ID and linked students on mount
  useEffect(() => {
    if (profile) {
      fetchParentId();
    }
  }, [profile]);

  // Load linked students when parent ID is available
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
      // Check if data is stale (older than 30 minutes)
      const isStale = await PersistenceService.isDataStale(30);
      
      if (isStale) {
        // Fetch fresh data from server
        const students = await StudentLinkingService.getLinkedStudents(parentId);
        setLinkedStudents(students);
        
        // Save to persistence
        await PersistenceService.saveLinkedStudents(students);
        await PersistenceService.saveLastSync(new Date().toISOString());
      } else {
        // Load from persistence
        const cachedStudents = await PersistenceService.getLinkedStudents();
        setLinkedStudents(cachedStudents);
        console.log('📱 Loaded linked students from cache');
      }
    } catch (error) {
      console.error('Error refreshing linked students:', error);
      
      // Fallback to cached data if available
      try {
        const cachedStudents = await PersistenceService.getLinkedStudents();
        setLinkedStudents(cachedStudents);
        console.log('📱 Fallback to cached students');
      } catch (cacheError) {
        console.error('Error loading cached students:', cacheError);
      }
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

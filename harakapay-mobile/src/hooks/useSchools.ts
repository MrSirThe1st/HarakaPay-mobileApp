import { useState, useEffect } from 'react';
import { School } from '../types/user';
import { SchoolService } from '../services/schoolService';
import { useAuth } from '../context/AuthContext';

export interface UseSchoolsReturn {
  schools: School[];
  selectedSchool: School | null;
  loading: boolean;
  error: string | null;
  refreshSchools: () => Promise<void>;
  selectSchool: (schoolId: string) => Promise<void>;
  clearSelection: () => Promise<void>;
}

export const useSchools = (userId?: string): UseSchoolsReturn => {
  const { refreshProfile } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      const schoolsData = await SchoolService.getAvailableSchools();
      setSchools(schoolsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch schools';
      setError(errorMessage);
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedSchool = async () => {
    if (!userId) return;
    
    try {
      const school = await SchoolService.getSelectedSchool(userId);
      setSelectedSchool(school);
    } catch (err) {
      console.error('Error fetching selected school:', err);
    }
  };

  const selectSchool = async (schoolId: string) => {
    if (!userId) {
      setError('User ID is required to select a school');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await SchoolService.selectSchool(userId, schoolId);
      
      // Find and set the selected school
      const school = schools.find(s => s.id === schoolId);
      if (school) {
        setSelectedSchool(school);
      }
      
      // Refresh the user profile to update school_id
      await refreshProfile();
      
      console.log('School selected successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select school';
      setError(errorMessage);
      console.error('Error selecting school:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      await SchoolService.selectSchool(userId, '');
      setSelectedSchool(null);
      
      console.log('School selection cleared');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear school selection';
      setError(errorMessage);
      console.error('Error clearing school selection:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSchools = async () => {
    await Promise.all([
      fetchSchools(),
      fetchSelectedSchool()
    ]);
  };

  useEffect(() => {
    refreshSchools();
  }, [userId]);

  return {
    schools,
    selectedSchool,
    loading,
    error,
    refreshSchools,
    selectSchool,
    clearSelection,
  };
};

import { useState, useEffect } from 'react';
import { StudentFeesService, StudentFeeData, StudentFeesResponse } from '../services/studentFeesService';
import { PersistenceService } from '../services/persistenceService';

interface UseStudentFeesReturn {
  studentFees: StudentFeeData[];
  loading: boolean;
  error: string | null;
  summary: {
    total_students: number;
    total_assignments: number;
    total_amount_due: number;
  } | null;
  refreshStudentFees: (forceRefresh?: boolean) => Promise<void>;
  getStudentFeesById: (studentId: string) => StudentFeeData | null;
  getUpcomingPayments: () => Promise<any[]>;
  getPaymentSummary: () => Promise<any>;
}

export const useStudentFees = (): UseStudentFeesReturn => {
  const [studentFees, setStudentFees] = useState<StudentFeeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    total_students: number;
    total_assignments: number;
    total_amount_due: number;
  } | null>(null);

  const refreshStudentFees = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if data is stale (older than 15 minutes for fees data)
      const isStale = await PersistenceService.isDataStale(15);
      
      if (isStale || forceRefresh) {
        console.log('🔄 Fetching fresh student fees from server...');
        // Fetch fresh data from server
        const data = await StudentFeesService.getStudentFees();
        setStudentFees(data.students);
        setSummary(data.summary);
        
        // Save to persistence
        await PersistenceService.saveStudentFees(data);
        await PersistenceService.saveLastSync(new Date().toISOString());
        console.log(`✅ Successfully fetched fees for ${data.count} students`);
      } else {
        // Load from persistence
        const cachedData = await PersistenceService.getStudentFees();
        if (cachedData) {
          setStudentFees(cachedData.students);
          setSummary(cachedData.summary);
          console.log('📱 Loaded student fees from cache');
        }
      }
    } catch (err) {
      console.error('Error refreshing student fees:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch student fees');
      
      // Fallback to cached data if available
      try {
        const cachedData = await PersistenceService.getStudentFees();
        if (cachedData) {
          setStudentFees(cachedData.students);
          setSummary(cachedData.summary);
          console.log('📱 Fallback to cached student fees');
        }
      } catch (cacheError) {
        console.error('Error loading cached student fees:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStudentFeesById = (studentId: string): StudentFeeData | null => {
    return studentFees.find(student => student.student.id === studentId) || null;
  };

  const getUpcomingPayments = async (): Promise<any[]> => {
    try {
      return await StudentFeesService.getUpcomingPayments();
    } catch (error) {
      console.error('Error getting upcoming payments:', error);
      return [];
    }
  };

  const getPaymentSummary = async (): Promise<any> => {
    try {
      return await StudentFeesService.getPaymentSummary();
    } catch (error) {
      console.error('Error getting payment summary:', error);
      return {
        total_due: 0,
        total_paid: 0,
        remaining_amount: 0,
        students_count: 0,
        assignments_count: 0,
      };
    }
  };

  // Load student fees on mount
  useEffect(() => {
    refreshStudentFees();
  }, []);

  return {
    studentFees,
    loading,
    error,
    summary,
    refreshStudentFees,
    getStudentFeesById,
    getUpcomingPayments,
    getPaymentSummary,
  };
};

import { supabase } from '../lib/supabase';
import { StudentMatch, School } from '../types/user';

export class StudentLinkingService {
  /**
   * Automatically find students that match parent's information
   */
  static async findAutomaticMatches(
    parentName: string,
    parentEmail: string,
    parentPhone?: string
  ): Promise<StudentMatch[]> {
    try {
      console.log('Searching for automatic matches with:', { parentName, parentEmail, parentPhone });

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔍 Session data:', session ? 'Session exists' : 'No session');
      console.log('🔍 Access token:', session?.access_token ? 'Token exists' : 'No token');
      
      if (!session?.access_token) {
        console.error('No active session found');
        return [];
      }

      const response = await fetch('http://192.168.1.120:3000/api/parent/search-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          searchType: 'automatic',
          parentName,
          parentEmail,
          parentPhone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error searching for automatic matches:', errorData);
        return [];
      }

      const data = await response.json();
      console.log('📊 Automatic matches found:', data.matches);
      return data.matches || [];

    } catch (error) {
      console.error('StudentLinkingService.findAutomaticMatches error:', error);
      return [];
    }
  }

  /**
   * Manually find students by name and school
   */
  static async findManualMatches(
    childName: string,
    schoolId: string
  ): Promise<StudentMatch[]> {
    try {
      console.log('Searching for manual matches with:', { childName, schoolId });

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No active session found');
        return [];
      }

      const response = await fetch('http://192.168.1.120:3000/api/parent/search-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          searchType: 'manual',
          childName,
          schoolId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error searching for manual matches:', errorData);
        return [];
      }

      const data = await response.json();
      console.log('📊 Manual matches found:', data.matches);
      return data.matches || [];

    } catch (error) {
      console.error('StudentLinkingService.findManualMatches error:', error);
      return [];
    }
  }

  /**
   * Create parent-student relationship
   */
  static async createRelationship(
    parentId: string,
    studentId: string,
    relationship: string = 'parent',
    isPrimary: boolean = true
  ): Promise<boolean> {
    try {
      console.log('Creating parent-student relationship:', { parentId, studentId, relationship, isPrimary });

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No active session found');
        return false;
      }

      const response = await fetch('http://192.168.1.120:3000/api/parent/link-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          parent_id: parentId,
          student_id: studentId,
          relationship: relationship,
          is_primary: isPrimary,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating parent-student relationship:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('Parent-student relationship created successfully:', result);
      return true;

    } catch (error) {
      console.error('StudentLinkingService.createRelationship error:', error);
      return false;
    }
  }

  /**
   * Get parent's linked students
   */
  static async getLinkedStudents(parentId: string): Promise<StudentMatch[]> {
    try {
      console.log('Fetching linked students for parent:', parentId);

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No active session found');
        return [];
      }

      // Use API endpoint instead of direct database access
      const response = await fetch('http://192.168.1.120:3000/api/parent/linked-students', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching linked students:', errorData);
        return [];
      }

      const data = await response.json();
      const students = data.students || [];

      console.log(`Successfully fetched ${students.length} linked students`);
      return students;

    } catch (error) {
      console.error('StudentLinkingService.getLinkedStudents error:', error);
      return [];
    }
  }

}

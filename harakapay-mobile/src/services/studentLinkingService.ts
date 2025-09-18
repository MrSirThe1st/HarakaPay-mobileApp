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

      const { data: relationships, error } = await supabase
        .from('parent_students')
        .select(`
          student_id,
          students!inner(
            id,
            student_id,
            first_name,
            last_name,
            grade_level,
            school_id,
            parent_name,
            parent_email,
            parent_phone,
            schools!inner(name)
          )
        `)
        .eq('parent_id', parentId);

      if (error) {
        console.error('Error fetching linked students:', error);
        return [];
      }

      if (!relationships || relationships.length === 0) {
        console.log('No linked students found');
        return [];
      }

      const students: StudentMatch[] = relationships.map((rel: any) => ({
        id: rel.students.id,
        student_id: rel.students.student_id,
        first_name: rel.students.first_name,
        last_name: rel.students.last_name,
        grade_level: rel.students.grade_level,
        school_id: rel.students.school_id,
        school_name: rel.students.schools.name,
        parent_name: rel.students.parent_name,
        parent_email: rel.students.parent_email,
        parent_phone: rel.students.parent_phone,
        match_confidence: 'high' as const,
        match_reasons: ['Already linked'],
      }));

      return students;

    } catch (error) {
      console.error('StudentLinkingService.getLinkedStudents error:', error);
      return [];
    }
  }

}

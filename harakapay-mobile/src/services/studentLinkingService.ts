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

      // First, let's debug by checking what students exist
      console.log('🔍 Debug: Checking all students in database...');
      const { data: allStudents, error: allError } = await supabase
        .from('students')
        .select(`
          id,
          student_id,
          first_name,
          last_name,
          parent_name,
          parent_email,
          parent_phone
        `)
        .limit(10);

      if (allError) {
        console.error('Error fetching all students:', allError);
      } else {
        console.log('📊 All students in database:', allStudents);
      }

      // Search students where parent_name or parent_email matches
      console.log('🔍 Searching with query:', `parent_name.ilike.%${parentName}%,parent_email.ilike.%${parentEmail}%`);
      
      const { data: students, error } = await supabase
        .from('students')
        .select(`
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
        `)
        .or(`parent_name.ilike.%${parentName}%,parent_email.ilike.%${parentEmail}%`);

      if (error) {
        console.error('Error fetching students for automatic matching:', error);
        return [];
      }

      console.log('📊 Students found by query:', students);

      if (!students || students.length === 0) {
        console.log('No students found for automatic matching');
        return [];
      }

      // Calculate match confidence and reasons
      const matches: StudentMatch[] = students.map((student: any) => {
        const matchReasons: string[] = [];
        let confidence: 'high' | 'medium' | 'low' = 'low';

        // Check name match
        if (student.parent_name && this.normalizeName(student.parent_name) === this.normalizeName(parentName)) {
          matchReasons.push('Parent name matches');
          confidence = 'high';
        } else if (student.parent_name && this.normalizeName(student.parent_name).includes(this.normalizeName(parentName))) {
          matchReasons.push('Parent name partially matches');
          confidence = 'medium';
        }

        // Check email match
        if (student.parent_email && student.parent_email.toLowerCase() === parentEmail.toLowerCase()) {
          matchReasons.push('Email matches exactly');
          confidence = 'high';
        } else if (student.parent_email && student.parent_email.toLowerCase().includes(parentEmail.toLowerCase())) {
          matchReasons.push('Email partially matches');
          if (confidence === 'low') confidence = 'medium';
        }

        // Check phone match
        if (parentPhone && student.parent_phone && this.normalizePhone(student.parent_phone) === this.normalizePhone(parentPhone)) {
          matchReasons.push('Phone number matches');
          if (confidence === 'low') confidence = 'medium';
        }

        return {
          id: student.id,
          student_id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          grade_level: student.grade_level,
          school_id: student.school_id,
          school_name: student.schools.name,
          parent_name: student.parent_name,
          parent_email: student.parent_email,
          parent_phone: student.parent_phone,
          match_confidence: confidence,
          match_reasons: matchReasons,
        };
      });

      // Sort by confidence (high first)
      return matches.sort((a, b) => {
        const confidenceOrder = { high: 3, medium: 2, low: 1 };
        return confidenceOrder[b.match_confidence] - confidenceOrder[a.match_confidence];
      });

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

      // Search students by name and school
      const { data: students, error } = await supabase
        .from('students')
        .select(`
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
        `)
        .eq('school_id', schoolId)
        .ilike('first_name', `%${childName}%`);

      if (error) {
        console.error('Error fetching students for manual matching:', error);
        return [];
      }

      if (!students || students.length === 0) {
        console.log('No students found for manual matching');
        return [];
      }

      // Create matches with basic confidence
      const matches: StudentMatch[] = students.map((student: any) => {
        const matchReasons: string[] = [];
        let confidence: 'high' | 'medium' | 'low' = 'low';

        // Check name match
        const normalizedChildName = this.normalizeName(childName);
        const normalizedStudentName = this.normalizeName(`${student.first_name} ${student.last_name}`);
        
        if (normalizedStudentName.includes(normalizedChildName)) {
          matchReasons.push('Student name matches');
          confidence = 'high';
        } else if (normalizedStudentName.includes(normalizedChildName.split(' ')[0])) {
          matchReasons.push('First name matches');
          confidence = 'medium';
        }

        return {
          id: student.id,
          student_id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          grade_level: student.grade_level,
          school_id: student.school_id,
          school_name: student.schools.name,
          parent_name: student.parent_name,
          parent_email: student.parent_email,
          parent_phone: student.parent_phone,
          match_confidence: confidence,
          match_reasons: matchReasons,
        };
      });

      // Sort by confidence (high first)
      return matches.sort((a, b) => {
        const confidenceOrder = { high: 3, medium: 2, low: 1 };
        return confidenceOrder[b.match_confidence] - confidenceOrder[a.match_confidence];
      });

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

      const response = await fetch('http://localhost:3000/api/parent/link-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  /**
   * Helper function to normalize names for comparison
   */
  private static normalizeName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Helper function to normalize phone numbers for comparison
   */
  private static normalizePhone(phone: string): string {
    return phone.replace(/\D/g, ''); // Remove all non-digits
  }
}

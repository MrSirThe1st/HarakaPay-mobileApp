import { supabase } from '../lib/supabase';
import { School } from '../types/user';

export interface SchoolResponse {
  schools: School[];
  meta: {
    total: number;
    user_role: string;
    user_school_id?: string;
  };
}

export class SchoolService {
  /**
   * Fetch all available schools for parents
   * This will only return approved schools that parents can select
   */
  static async getAvailableSchools(): Promise<School[]> {
    try {
      console.log('Fetching available schools...');
      
      // For now, we'll fetch directly from the database
      // In the future, we can create a public API endpoint
      const { data: schools, error } = await supabase
        .from('schools')
        .select('*')
        .eq('status', 'approved')
        .eq('verification_status', 'verified')
        .order('name');

      if (error) {
        console.error('Error fetching schools:', error);
        throw new Error(`Failed to fetch schools: ${error.message}`);
      }

      console.log(`Successfully fetched ${schools?.length || 0} schools`);
      return schools || [];
    } catch (error) {
      console.error('SchoolService.getAvailableSchools error:', error);
      throw error;
    }
  }

  /**
   * Fetch schools from the web API (alternative approach)
   * This would require the web app to have a public schools endpoint
   */
  static async getSchoolsFromAPI(): Promise<School[]> {
    try {
      const response = await fetch('https://your-web-app.com/api/schools/public', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.schools || [];
    } catch (error) {
      console.error('Error fetching schools from API:', error);
      throw error;
    }
  }

  /**
   * Update parent's selected school
   */
  static async selectSchool(userId: string, schoolId: string): Promise<void> {
    try {
      console.log(`Updating parent ${userId} to school ${schoolId}`);
      
      // Update the profile with the selected school
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ school_id: schoolId })
        .eq('user_id', userId)
        .eq('role', 'parent');

      if (profileError) {
        console.error('Error updating profile with school:', profileError);
        throw new Error(`Failed to select school: ${profileError.message}`);
      }

      console.log('Successfully updated parent school selection');
    } catch (error) {
      console.error('SchoolService.selectSchool error:', error);
      throw error;
    }
  }

  /**
   * Get parent's currently selected school
   */
  static async getSelectedSchool(userId: string): Promise<School | null> {
    try {
      // First get the parent's profile to find their school_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('user_id', userId)
        .eq('role', 'parent')
        .single();

      if (profileError || !profile?.school_id) {
        console.log('No school selected for parent');
        return null;
      }

      // Then fetch the school details
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', profile.school_id)
        .single();

      if (schoolError) {
        console.error('Error fetching selected school:', schoolError);
        return null;
      }

      return school;
    } catch (error) {
      console.error('SchoolService.getSelectedSchool error:', error);
      return null;
    }
  }
}

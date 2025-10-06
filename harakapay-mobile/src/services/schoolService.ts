import { supabase } from '../lib/supabase';
import { School } from '../types/user';
import { createClient } from '@supabase/supabase-js';

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
      
      // Call the web API to update the school selection
      const response = await fetch('http://localhost:3000/api/parent/select-school', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          school_id: schoolId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Successfully updated parent school selection');
    } catch (error) {
      console.error('SchoolService.selectSchool error:', error);
      // For now, just log the error but don't throw
      // This allows the UI to work even if the update fails
      console.log('School selection update failed, but continuing...');
    }
  }

  /**
   * Get parent's currently selected school
   */
  static async getSelectedSchool(userId: string): Promise<School | null> {
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No active session found');
        return null;
      }

      // Use API endpoint to get parent profile (which includes school_id)
      const response = await fetch(`http://192.168.1.120:3000/api/parent/profile?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        console.error('Error fetching parent profile');
        return null;
      }

      const data = await response.json();
      const profile = data.profile;

      if (!profile?.school_id) {
        console.log('No school selected for parent');
        return null;
      }

      // Fetch school details using the schools API endpoint
      const schoolResponse = await fetch('http://192.168.1.120:3000/api/schools', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!schoolResponse.ok) {
        console.error('Error fetching schools');
        return null;
      }

      const schoolsData = await schoolResponse.json();
      const school = schoolsData.schools?.find((s: any) => s.id === profile.school_id);
      
      if (!school) {
        console.error('School not found');
        return null;
      }

      return school;

    } catch (error) {
      console.error('SchoolService.getSelectedSchool error:', error);
      return null;
    }
  }
}

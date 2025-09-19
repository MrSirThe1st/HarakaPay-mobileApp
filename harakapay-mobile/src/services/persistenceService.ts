import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudentMatch, School } from '../types/user';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PROFILE: 'user_profile',
  LINKED_STUDENTS: 'linked_students',
  SCHOOLS: 'schools',
  PARENT_ID: 'parent_id',
  LAST_SYNC: 'last_sync',
  APP_SETTINGS: 'app_settings',
} as const;

export class PersistenceService {
  // Authentication persistence
  static async saveAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.AUTH_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      ]);
      console.log('✅ Auth tokens saved to storage');
    } catch (error) {
      console.error('❌ Error saving auth tokens:', error);
    }
  }

  static async getAuthTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    try {
      const [accessToken, refreshToken] = await AsyncStorage.multiGet([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
      return {
        accessToken: accessToken[1],
        refreshToken: refreshToken[1],
      };
    } catch (error) {
      console.error('❌ Error getting auth tokens:', error);
      return { accessToken: null, refreshToken: null };
    }
  }

  static async clearAuthTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
      console.log('✅ Auth tokens cleared from storage');
    } catch (error) {
      console.error('❌ Error clearing auth tokens:', error);
    }
  }

  // User profile persistence
  static async saveUserProfile(profile: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      console.log('✅ User profile saved to storage');
    } catch (error) {
      console.error('❌ Error saving user profile:', error);
    }
  }

  static async getUserProfile(): Promise<any | null> {
    try {
      const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      return null;
    }
  }

  // Parent ID persistence
  static async saveParentId(parentId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PARENT_ID, parentId);
      console.log('✅ Parent ID saved to storage');
    } catch (error) {
      console.error('❌ Error saving parent ID:', error);
    }
  }

  static async getParentId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.PARENT_ID);
    } catch (error) {
      console.error('❌ Error getting parent ID:', error);
      return null;
    }
  }

  // Linked students persistence
  static async saveLinkedStudents(students: StudentMatch[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LINKED_STUDENTS, JSON.stringify(students));
      console.log('✅ Linked students saved to storage');
    } catch (error) {
      console.error('❌ Error saving linked students:', error);
    }
  }

  static async getLinkedStudents(): Promise<StudentMatch[]> {
    try {
      const students = await AsyncStorage.getItem(STORAGE_KEYS.LINKED_STUDENTS);
      return students ? JSON.parse(students) : [];
    } catch (error) {
      console.error('❌ Error getting linked students:', error);
      return [];
    }
  }

  // Schools persistence
  static async saveSchools(schools: School[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
      console.log('✅ Schools saved to storage');
    } catch (error) {
      console.error('❌ Error saving schools:', error);
    }
  }

  static async getSchools(): Promise<School[]> {
    try {
      const schools = await AsyncStorage.getItem(STORAGE_KEYS.SCHOOLS);
      return schools ? JSON.parse(schools) : [];
    } catch (error) {
      console.error('❌ Error getting schools:', error);
      return [];
    }
  }

  // Last sync timestamp
  static async saveLastSync(timestamp: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error('❌ Error saving last sync:', error);
    }
  }

  static async getLastSync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('❌ Error getting last sync:', error);
      return null;
    }
  }

  // App settings persistence
  static async saveAppSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
      console.log('✅ App settings saved to storage');
    } catch (error) {
      console.error('❌ Error saving app settings:', error);
    }
  }

  static async getAppSettings(): Promise<any | null> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('❌ Error getting app settings:', error);
      return null;
    }
  }

  // Clear all data (logout)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.LINKED_STUDENTS,
        STORAGE_KEYS.SCHOOLS,
        STORAGE_KEYS.PARENT_ID,
        STORAGE_KEYS.LAST_SYNC,
      ]);
      console.log('✅ All data cleared from storage');
    } catch (error) {
      console.error('❌ Error clearing all data:', error);
    }
  }

  // Check if data is stale (older than specified minutes)
  static async isDataStale(maxAgeMinutes: number = 30): Promise<boolean> {
    try {
      const lastSync = await this.getLastSync();
      if (!lastSync) return true;

      const lastSyncTime = new Date(lastSync).getTime();
      const now = new Date().getTime();
      const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds

      return (now - lastSyncTime) > maxAge;
    } catch (error) {
      console.error('❌ Error checking data staleness:', error);
      return true;
    }
  }

  // Get all stored data (for debugging)
  static async getAllStoredData(): Promise<any> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const data = await AsyncStorage.multiGet(keys);
      const result: any = {};
      
      data.forEach(([key, value]) => {
        if (value) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      });
      
      return result;
    } catch (error) {
      console.error('❌ Error getting all stored data:', error);
      return {};
    }
  }
}

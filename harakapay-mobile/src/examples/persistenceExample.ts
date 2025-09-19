// Example usage of PersistenceService in your components

import { PersistenceService } from '../services/persistenceService';

// Example: Save and load app settings
export const saveAppSettings = async () => {
  const settings = {
    theme: 'dark',
    language: 'en',
    notifications: true,
    autoSync: true,
  };
  
  await PersistenceService.saveAppSettings(settings);
  console.log('Settings saved');
};

export const loadAppSettings = async () => {
  const settings = await PersistenceService.getAppSettings();
  console.log('Loaded settings:', settings);
  return settings;
};

// Example: Check if user needs to re-authenticate
export const checkAuthStatus = async () => {
  const { accessToken, refreshToken } = await PersistenceService.getAuthTokens();
  
  if (accessToken && refreshToken) {
    console.log('User has valid tokens, can auto-login');
    return true;
  } else {
    console.log('User needs to login');
    return false;
  }
};

// Example: Load cached data on app startup
export const loadCachedData = async () => {
  try {
    // Load all cached data
    const [profile, students, schools, parentId] = await Promise.all([
      PersistenceService.getUserProfile(),
      PersistenceService.getLinkedStudents(),
      PersistenceService.getSchools(),
      PersistenceService.getParentId(),
    ]);
    
    console.log('Cached data loaded:', {
      hasProfile: !!profile,
      studentsCount: students.length,
      schoolsCount: schools.length,
      hasParentId: !!parentId,
    });
    
    return { profile, students, schools, parentId };
  } catch (error) {
    console.error('Error loading cached data:', error);
    return null;
  }
};

// Example: Clear all data (useful for logout)
export const clearAllCachedData = async () => {
  await PersistenceService.clearAllData();
  console.log('All cached data cleared');
};

// Example: Check if data needs refresh
export const shouldRefreshData = async () => {
  const isStale = await PersistenceService.isDataStale(30); // 30 minutes
  console.log('Data is stale:', isStale);
  return isStale;
};

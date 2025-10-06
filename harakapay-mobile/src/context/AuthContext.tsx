 import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthState, User, UserProfile, MobileParentProfile } from '../types/user';
import { PersistenceService } from '../services/persistenceService';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth reducer
const authReducer = (state: AuthState, action: any): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SIGN_OUT':
      return { user: null, profile: null, loading: false, error: null };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check for persisted session first
    checkPersistedAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          dispatch({ type: 'SET_USER', payload: session.user });
          fetchUserProfile(session.user.id);
        } else {
          dispatch({ type: 'SIGN_OUT' });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkPersistedAuth = async () => {
    try {
      // First check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('✅ Found Supabase session');
        dispatch({ type: 'SET_USER', payload: session.user });
        await fetchUserProfile(session.user.id);
        return;
      }

      // If no Supabase session, check persisted tokens
      const { accessToken, refreshToken } = await PersistenceService.getAuthTokens();
      
      if (accessToken && refreshToken) {
        console.log('📱 Found persisted tokens, attempting to restore session...');
        
        // Try to set the session with persisted tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('❌ Error restoring session:', error);
          // Try to refresh tokens before giving up
          const refreshed = await refreshAuthTokens();
          if (refreshed) {
            // Try to get the session again after refresh
            const { data: refreshedData } = await supabase.auth.getSession();
            if (refreshedData.session?.user) {
              console.log('✅ Successfully restored session after token refresh');
              dispatch({ type: 'SET_USER', payload: refreshedData.session.user });
              await fetchUserProfile(refreshedData.session.user.id);
            } else {
              await PersistenceService.clearAuthTokens();
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          } else {
            // Clear invalid tokens
            await PersistenceService.clearAuthTokens();
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else if (data.session?.user) {
          console.log('✅ Successfully restored session from persisted tokens');
          dispatch({ type: 'SET_USER', payload: data.session.user });
          await fetchUserProfile(data.session.user.id);
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        console.log('📱 No persisted tokens found');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('❌ Error checking persisted auth:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No active session found');
        return;
      }

      // Use API endpoint instead of direct database access
      const response = await fetch(`http://192.168.1.120:3000/api/parent/profile?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching profile:', errorData);
        return;
      }

      const data = await response.json();
      const profile = data.profile;
      const parent = data.parent;

      if (!profile) {
        console.error('No profile data received');
        return;
      }

      console.log('Profile data fetched successfully:', profile);

      // Create mobile parent profile
      const mobileParentProfile: MobileParentProfile = {
        id: profile.id,
        user_id: profile.user_id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        school_id: profile.school_id || '',
        phone: profile.phone,
        email: parent?.email || '', // Get email from parents table if available
        address: parent?.address || '', // Get address from parents table if available
        avatar_url: profile.avatar_url,
        is_active: profile.is_active,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      console.log('Created mobile parent profile:', mobileParentProfile);
      dispatch({ type: 'SET_PROFILE', payload: mobileParentProfile });
      
      // Save profile to persistence
      await PersistenceService.saveUserProfile(mobileParentProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Function to refresh profile (useful when school is selected)
  const refreshProfile = async () => {
    if (state.profile?.user_id) {
      await fetchUserProfile(state.profile.user_id);
    }
  };

  const refreshAuthTokens = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('❌ Error refreshing session:', error);
        await PersistenceService.clearAuthTokens();
        dispatch({ type: 'SIGN_OUT' });
        return false;
      }

      if (data.session) {
        await PersistenceService.saveAuthTokens(
          data.session.access_token,
          data.session.refresh_token
        );
        console.log('✅ Tokens refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error refreshing tokens:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Save auth tokens to persistence
      if (data.session) {
        await PersistenceService.saveAuthTokens(
          data.session.access_token,
          data.session.refresh_token
        );
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      // Create parent profile and parent record
      if (data.user) {
        console.log('Creating profile and parent records for user:', data.user.id);
        
        // First create the profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            role: 'parent',
            admin_type: null,
            school_id: null,
            avatar_url: null,
            permissions: {},
            is_active: true
          } as any);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }
        console.log('Profile created successfully');

        // Then create the parent record
        const { error: parentError } = await supabase
          .from('parents')
          .insert({
            user_id: data.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            email: email,
            address: userData.address || null,
            is_active: true
          } as any);

        if (parentError) {
          console.error('Parent creation error:', parentError);
          throw parentError;
        }
        console.log('Parent record created successfully');
      }

      // Save auth tokens to persistence if session exists
      if (data.session) {
        await PersistenceService.saveAuthTokens(
          data.session.access_token,
          data.session.refresh_token
        );
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all persisted data
      await PersistenceService.clearAllData();
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

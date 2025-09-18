 import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthState, User, UserProfile, MobileParentProfile } from '../types/user';

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
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch({ type: 'SET_USER', payload: session.user });
        fetchUserProfile(session.user.id);
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

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

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Fetch profile data (this should work for parents)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'parent')
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (!profile) {
        console.error('No profile data received');
        return;
      }

      console.log('Profile data fetched successfully:', profile);

      // Get additional parent data (email, address) from parents table
      const { data: parent, error: parentError } = await supabase
        .from('parents')
        .select('email, address')
        .eq('user_id', userId)
        .single();

      if (parentError) {
        console.log('Parent data not available:', parentError.message);
        // Continue with just profile data
      }

      // Create mobile parent profile
      const mobileParentProfile: MobileParentProfile = {
        id: (profile as any).id,
        user_id: (profile as any).user_id,
        first_name: (profile as any).first_name,
        last_name: (profile as any).last_name,
        role: (profile as any).role,
        school_id: (profile as any).school_id || '',
        phone: (profile as any).phone,
        email: (parent as any)?.email || '', // Get email from parents table if available
        address: (parent as any)?.address || '', // Get address from parents table if available
        avatar_url: (profile as any).avatar_url,
        is_active: (profile as any).is_active,
        created_at: (profile as any).created_at,
        updated_at: (profile as any).updated_at,
      };

      console.log('Created mobile parent profile:', mobileParentProfile);
      dispatch({ type: 'SET_PROFILE', payload: mobileParentProfile });
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

  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
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
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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

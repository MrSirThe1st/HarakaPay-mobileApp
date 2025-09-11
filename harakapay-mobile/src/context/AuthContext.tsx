import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthState, User, UserProfile, MobileParentProfile } from '../types/user';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
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
      // For mobile app, we expect parents to be in the parents table
      const { data: parentProfile, error: parentError } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (parentError) {
        console.error('Error fetching parent profile:', parentError);
        return;
      }

      // Convert parent profile to mobile parent profile format
      const mobileParentProfile: MobileParentProfile = {
        id: (parentProfile as any).id,
        user_id: (parentProfile as any).user_id,
        first_name: (parentProfile as any).first_name,
        last_name: (parentProfile as any).last_name,
        role: 'parent',
        school_id: (parentProfile as any).school_id || '', 
        phone: (parentProfile as any).phone,
        email: (parentProfile as any).email,
        address: (parentProfile as any).address,
        avatar_url: null,
        is_active: (parentProfile as any).is_active,
        created_at: (parentProfile as any).created_at,
        updated_at: (parentProfile as any).updated_at,
      };

      dispatch({ type: 'SET_PROFILE', payload: mobileParentProfile });
    } catch (error) {
      console.error('Error fetching profile:', error);
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

      // Create parent profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('parents')
          .insert({
            user_id: data.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            email: email,
            address: userData.address || null,
            school_id: null, // Will be set when parent selects school
          } as any);

        if (profileError) throw profileError;
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
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

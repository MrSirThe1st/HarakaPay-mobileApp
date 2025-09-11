export interface User {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
  created_at: string;
  updated_at: string;
}

export type UserRole = 
  | "super_admin" 
  | "platform_admin" 
  | "support_admin" 
  | "school_admin" 
  | "school_staff"
  | "parent";

export type AdminType = 
  | "super_admin" 
  | "platform_admin" 
  | "support_admin";

// General UserProfile (for web app compatibility)
export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  admin_type?: AdminType | null;
  school_id?: string | null; // Can be null for platform admins
  phone?: string;
  avatar_url?: string | null;
  permissions: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Mobile-specific ParentProfile (parents always have a school)
export interface MobileParentProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: 'parent';
  school_id: string; // Required for parents
  phone: string;
  email: string;
  address?: string;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Mobile-specific types
export interface ParentProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  status: "pending" | "pending_verification" | "approved" | "suspended";
  verification_status: "pending" | "verified" | "rejected";
}

export interface Student {
  id: string;
  school_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  grade_level?: string;
  enrollment_date: string;
  status: "active" | "inactive" | "graduated";
}

export interface Payment {
  id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  payment_method: "cash" | "bank_transfer" | "mobile_money" | "card";
  status: "pending" | "completed" | "failed" | "refunded";
  description?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

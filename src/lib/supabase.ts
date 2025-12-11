import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  national_id: string;
  full_name: string;
  date_of_birth: string;
  phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GuardianLink {
  id: string;
  guardian_id: string;
  dependent_id: string;
  relationship: 'father' | 'mother' | 'legal_guardian';
  status: 'active' | 'expired' | 'revoked';
  auto_expiry_date: string;
  dependent_consent: boolean;
  consent_date?: string;
  created_at?: string;
  revoked_at?: string;
  dependent?: Profile;
}

export interface Violation {
  id: string;
  profile_id: string;
  violation_type: 'traffic' | 'security' | 'education' | 'civil' | 'other';
  violation_code: string;
  description: string;
  issuing_authority: string;
  violation_date: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  location?: string;
  created_at?: string;
}

export interface Referral {
  id: string;
  profile_id: string;
  referral_type: string;
  issuing_authority: string;
  case_number: string;
  description: string;
  referral_date: string;
  status: 'open' | 'closed' | 'under_review';
  severity: 'low' | 'medium' | 'high';
  created_at?: string;
}

export interface Alert {
  id: string;
  profile_id: string;
  alert_type: string;
  title: string;
  message: string;
  issuing_authority: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  related_violation_id?: string;
  related_referral_id?: string;
  created_at?: string;
}

export interface AcademicRecord {
  id: string;
  profile_id: string;
  academic_year: string;
  semester: string;
  grade_level: string;
  school_name: string;
  gpa: number;
  attendance_rate: number;
  behavior_grade: string;
  status: 'active' | 'completed' | 'failed';
  notes?: string;
  created_at?: string;
}

export interface MedicalRecord {
  id: string;
  profile_id: string;
  record_type: string;
  diagnosis: string;
  treatment?: string;
  hospital_name: string;
  doctor_name?: string;
  visit_date: string;
  notes?: string;
  created_at?: string;
}

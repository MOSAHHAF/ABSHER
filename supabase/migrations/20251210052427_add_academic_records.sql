/*
  # إضافة السجل الدراسي والمعلومات الإضافية
  
  1. الجداول الجديدة
    
    ### `academic_records`
    - `id` (uuid, primary key) - معرف السجل
    - `profile_id` (uuid) - معرف الطالب
    - `academic_year` (text) - السنة الدراسية
    - `semester` (text) - الفصل الدراسي
    - `grade_level` (text) - المرحلة الدراسية
    - `school_name` (text) - اسم المدرسة
    - `gpa` (decimal) - المعدل التراكمي
    - `attendance_rate` (decimal) - نسبة الحضور
    - `behavior_grade` (text) - درجة السلوك
    - `status` (text) - الحالة (active, completed, failed)
    - `notes` (text) - ملاحظات
    - `created_at` (timestamptz) - تاريخ الإنشاء
    
    ### `medical_records`
    - `id` (uuid, primary key) - معرف السجل
    - `profile_id` (uuid) - معرف الشخص
    - `record_type` (text) - نوع السجل
    - `diagnosis` (text) - التشخيص
    - `treatment` (text) - العلاج
    - `hospital_name` (text) - اسم المستشفى
    - `doctor_name` (text) - اسم الطبيب
    - `visit_date` (timestamptz) - تاريخ الزيارة
    - `notes` (text) - ملاحظات
    - `created_at` (timestamptz) - تاريخ الإنشاء
    
  2. الأمان
    - تفعيل RLS على جميع الجداول
    - السماح بالوصول الكامل للبيانات
*/

-- جدول السجل الدراسي
CREATE TABLE IF NOT EXISTS academic_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  academic_year text NOT NULL,
  semester text NOT NULL,
  grade_level text NOT NULL,
  school_name text NOT NULL,
  gpa decimal(4,2) DEFAULT 0,
  attendance_rate decimal(5,2) DEFAULT 0,
  behavior_grade text DEFAULT 'A',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- جدول السجل الطبي
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  record_type text NOT NULL,
  diagnosis text NOT NULL,
  treatment text,
  hospital_name text NOT NULL,
  doctor_name text,
  visit_date timestamptz NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
CREATE POLICY "Allow all access to academic_records"
  ON academic_records FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to medical_records"
  ON medical_records FOR ALL
  USING (true)
  WITH CHECK (true);

/*
  # إنشاء نظام أبشر - خدمة ربط ولي الأمر
  
  ## 1. الجداول الجديدة
  
  ### `profiles`
  - `id` (uuid, primary key) - معرف المستخدم
  - `national_id` (text, unique) - رقم الهوية الوطنية
  - `full_name` (text) - الاسم الكامل
  - `date_of_birth` (date) - تاريخ الميلاد
  - `phone` (text) - رقم الجوال
  - `email` (text) - البريد الإلكتروني
  - `created_at` (timestamptz) - تاريخ الإنشاء
  - `updated_at` (timestamptz) - تاريخ التحديث
  
  ### `guardian_links`
  - `id` (uuid, primary key) - معرف الربط
  - `guardian_id` (uuid) - معرف ولي الأمر
  - `dependent_id` (uuid) - معرف الابن/الابنة
  - `relationship` (text) - نوع العلاقة (أب، أم، وصي)
  - `status` (text) - حالة الربط (active, expired, revoked)
  - `auto_expiry_date` (date) - تاريخ انتهاء الصلاحية التلقائي (عند بلوغ 18 سنة)
  - `dependent_consent` (boolean) - موافقة الابن على الاستمرار بعد 18 سنة
  - `consent_date` (timestamptz) - تاريخ الموافقة
  - `created_at` (timestamptz) - تاريخ الإنشاء
  - `revoked_at` (timestamptz) - تاريخ الإلغاء
  
  ### `violations`
  - `id` (uuid, primary key) - معرف المخالفة
  - `profile_id` (uuid) - معرف صاحب المخالفة
  - `violation_type` (text) - نوع المخالفة (مرورية، أمنية، تعليمية)
  - `violation_code` (text) - رمز المخالفة
  - `description` (text) - وصف المخالفة
  - `issuing_authority` (text) - الجهة المصدرة
  - `violation_date` (timestamptz) - تاريخ المخالفة
  - `amount` (decimal) - قيمة الغرامة
  - `status` (text) - حالة المخالفة (pending, paid, cancelled)
  - `location` (text) - موقع المخالفة
  - `created_at` (timestamptz) - تاريخ التسجيل
  
  ### `referrals`
  - `id` (uuid, primary key) - معرف الإحالة
  - `profile_id` (uuid) - معرف المحال
  - `referral_type` (text) - نوع الإحالة
  - `issuing_authority` (text) - الجهة المحيلة
  - `case_number` (text) - رقم القضية
  - `description` (text) - وصف الإحالة
  - `referral_date` (timestamptz) - تاريخ الإحالة
  - `status` (text) - حالة الإحالة (open, closed, under_review)
  - `severity` (text) - درجة الخطورة (low, medium, high)
  - `created_at` (timestamptz) - تاريخ التسجيل
  
  ### `alerts`
  - `id` (uuid, primary key) - معرف التنبيه
  - `profile_id` (uuid) - معرف المستخدم المتأثر
  - `alert_type` (text) - نوع التنبيه
  - `title` (text) - عنوان التنبيه
  - `message` (text) - نص التنبيه
  - `issuing_authority` (text) - الجهة المصدرة
  - `priority` (text) - الأولوية (low, medium, high, urgent)
  - `is_read` (boolean) - حالة القراءة
  - `related_violation_id` (uuid) - معرف المخالفة المرتبطة
  - `related_referral_id` (uuid) - معرف الإحالة المرتبطة
  - `created_at` (timestamptz) - تاريخ الإنشاء
  
  ## 2. الأمان (Row Level Security)
  
  - تفعيل RLS على جميع الجداول
  - سياسات الوصول للمستخدمين المسجلين فقط
  - ولي الأمر يمكنه الوصول لبيانات أبنائه المرتبطين فقط
  - المستخدم يمكنه الوصول لبياناته الشخصية
  - التحقق من صلاحية الربط وعدم انتهائها
  
  ## 3. ملاحظات مهمة
  
  - يتم حساب تاريخ انتهاء الصلاحية التلقائي عند الربط (18 سنة)
  - يتطلب موافقة الابن للاستمرار بعد 18 سنة
  - جميع البيانات مشفرة ومحمية
*/

-- جدول الملفات الشخصية
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  national_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  phone text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول روابط ولي الأمر
CREATE TABLE IF NOT EXISTS guardian_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dependent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship text NOT NULL CHECK (relationship IN ('father', 'mother', 'legal_guardian')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  auto_expiry_date date NOT NULL,
  dependent_consent boolean DEFAULT false,
  consent_date timestamptz,
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE(guardian_id, dependent_id)
);

-- جدول المخالفات
CREATE TABLE IF NOT EXISTS violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  violation_type text NOT NULL CHECK (violation_type IN ('traffic', 'security', 'education', 'civil', 'other')),
  violation_code text NOT NULL,
  description text NOT NULL,
  issuing_authority text NOT NULL,
  violation_date timestamptz NOT NULL,
  amount decimal(10,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  location text,
  created_at timestamptz DEFAULT now()
);

-- جدول الإحالات
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_type text NOT NULL,
  issuing_authority text NOT NULL,
  case_number text NOT NULL,
  description text NOT NULL,
  referral_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'under_review')),
  severity text NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now()
);

-- جدول التنبيهات
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  issuing_authority text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read boolean DEFAULT false,
  related_violation_id uuid REFERENCES violations(id) ON DELETE SET NULL,
  related_referral_id uuid REFERENCES referrals(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_profiles_national_id ON profiles(national_id);
CREATE INDEX IF NOT EXISTS idx_guardian_links_guardian ON guardian_links(guardian_id);
CREATE INDEX IF NOT EXISTS idx_guardian_links_dependent ON guardian_links(dependent_id);
CREATE INDEX IF NOT EXISTS idx_guardian_links_status ON guardian_links(status);
CREATE INDEX IF NOT EXISTS idx_violations_profile ON violations(profile_id);
CREATE INDEX IF NOT EXISTS idx_violations_date ON violations(violation_date);
CREATE INDEX IF NOT EXISTS idx_referrals_profile ON referrals(profile_id);
CREATE INDEX IF NOT EXISTS idx_alerts_profile ON alerts(profile_id);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON alerts(profile_id, is_read) WHERE is_read = false;

-- تفعيل RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للملفات الشخصية
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- سياسات RLS لروابط ولي الأمر
CREATE POLICY "Guardians can view their links"
  ON guardian_links FOR SELECT
  TO authenticated
  USING (auth.uid() = guardian_id);

CREATE POLICY "Dependents can view their guardian links"
  ON guardian_links FOR SELECT
  TO authenticated
  USING (auth.uid() = dependent_id);

CREATE POLICY "Guardians can create links"
  ON guardian_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = guardian_id);

CREATE POLICY "Users can update consent on their guardian links"
  ON guardian_links FOR UPDATE
  TO authenticated
  USING (auth.uid() = dependent_id)
  WITH CHECK (auth.uid() = dependent_id);

-- سياسات RLS للمخالفات
CREATE POLICY "Users can view own violations"
  ON violations FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Guardians can view dependent violations"
  ON violations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM guardian_links
      WHERE guardian_links.dependent_id = violations.profile_id
      AND guardian_links.guardian_id = auth.uid()
      AND guardian_links.status = 'active'
      AND (guardian_links.auto_expiry_date >= CURRENT_DATE OR guardian_links.dependent_consent = true)
    )
  );

-- سياسات RLS للإحالات
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Guardians can view dependent referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM guardian_links
      WHERE guardian_links.dependent_id = referrals.profile_id
      AND guardian_links.guardian_id = auth.uid()
      AND guardian_links.status = 'active'
      AND (guardian_links.auto_expiry_date >= CURRENT_DATE OR guardian_links.dependent_consent = true)
    )
  );

-- سياسات RLS للتنبيهات
CREATE POLICY "Users can view own alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Guardians can view dependent alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM guardian_links
      WHERE guardian_links.dependent_id = alerts.profile_id
      AND guardian_links.guardian_id = auth.uid()
      AND guardian_links.status = 'active'
      AND (guardian_links.auto_expiry_date >= CURRENT_DATE OR guardian_links.dependent_consent = true)
    )
  );

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- دالة لحساب تاريخ انتهاء الصلاحية التلقائي (عند بلوغ 18 سنة)
CREATE OR REPLACE FUNCTION calculate_auto_expiry_date(birth_date date)
RETURNS date AS $$
BEGIN
  RETURN birth_date + INTERVAL '18 years';
END;
$$ LANGUAGE plpgsql;

-- دالة لتحديث حالة الروابط المنتهية
CREATE OR REPLACE FUNCTION update_expired_links()
RETURNS void AS $$
BEGIN
  UPDATE guardian_links
  SET status = 'expired'
  WHERE status = 'active'
  AND auto_expiry_date < CURRENT_DATE
  AND dependent_consent = false;
END;
$$ LANGUAGE plpgsql;
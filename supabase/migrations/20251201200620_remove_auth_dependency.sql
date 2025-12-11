/*
  # إزالة الاعتماد على المصادقة
  
  1. التعديلات
    - إزالة قيد المفتاح الخارجي من profiles على auth.users
    - السماح بإنشاء ملفات شخصية مستقلة
  
  2. الأمان
    - تحديث سياسات RLS للسماح بالوصول العام للبيانات
*/

-- إزالة قيد المفتاح الخارجي
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- تحديث سياسات RLS للسماح بالوصول الكامل
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Allow all access to profiles"
  ON profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- تحديث سياسات guardian_links
DROP POLICY IF EXISTS "Guardians can view their links" ON guardian_links;
DROP POLICY IF EXISTS "Guardians can create links" ON guardian_links;
DROP POLICY IF EXISTS "Guardians can update their links" ON guardian_links;

CREATE POLICY "Allow all access to guardian_links"
  ON guardian_links FOR ALL
  USING (true)
  WITH CHECK (true);

-- تحديث سياسات violations
DROP POLICY IF EXISTS "Users can view own violations" ON violations;
DROP POLICY IF EXISTS "Guardians can view dependents violations" ON violations;

CREATE POLICY "Allow all access to violations"
  ON violations FOR ALL
  USING (true)
  WITH CHECK (true);

-- تحديث سياسات referrals
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
DROP POLICY IF EXISTS "Guardians can view dependents referrals" ON referrals;

CREATE POLICY "Allow all access to referrals"
  ON referrals FOR ALL
  USING (true)
  WITH CHECK (true);

-- تحديث سياسات alerts
DROP POLICY IF EXISTS "Users can view own alerts" ON alerts;
DROP POLICY IF EXISTS "Guardians can view dependents alerts" ON alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON alerts;

CREATE POLICY "Allow all access to alerts"
  ON alerts FOR ALL
  USING (true)
  WITH CHECK (true);

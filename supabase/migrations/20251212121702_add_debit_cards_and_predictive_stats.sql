/*
  # إضافة بطاقات الصراف والإحصائيات التنبؤية

  1. جداول جديدة
    - `debit_cards` - بطاقات الصراف للأبناء
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key) - معرف الابن
      - `card_number` (text) - رقم البطاقة (مشفر)
      - `card_holder_name` (text) - اسم حامل البطاقة
      - `bank_name` (text) - اسم البنك
      - `card_type` (text) - نوع البطاقة
      - `monthly_limit` (numeric) - الحد الشهري
      - `is_active` (boolean) - حالة البطاقة
      - `created_at` (timestamptz)
    
    - `card_transactions` - معاملات بطاقات الصراف
      - `id` (uuid, primary key)
      - `card_id` (uuid, foreign key)
      - `transaction_type` (text) - نوع المعاملة
      - `amount` (numeric) - المبلغ
      - `merchant_name` (text) - اسم التاجر
      - `category` (text) - فئة المصروف
      - `transaction_date` (timestamptz) - تاريخ المعاملة
      - `location` (text) - الموقع
      - `status` (text) - حالة المعاملة
      - `created_at` (timestamptz)
    
    - `ai_family_predictions` - التنبؤات الذكية للأسر
      - `id` (uuid, primary key)
      - `region` (text) - المنطقة
      - `separation_rate` (numeric) - معدل الانفصال
      - `risk_level` (text) - مستوى الخطر
      - `total_families` (integer) - إجمالي الأسر
      - `at_risk_families` (integer) - الأسر المعرضة للخطر
      - `prediction_confidence` (numeric) - ثقة التنبؤ
      - `factors` (jsonb) - العوامل المؤثرة
      - `updated_at` (timestamptz)

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - السماح للمستخدمين بالوصول حسب الصلاحيات
*/

-- جدول بطاقات الصراف
CREATE TABLE IF NOT EXISTS debit_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  card_number text NOT NULL,
  card_holder_name text NOT NULL,
  bank_name text NOT NULL,
  card_type text DEFAULT 'debit',
  monthly_limit numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- جدول معاملات البطاقات
CREATE TABLE IF NOT EXISTS card_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES debit_cards(id) ON DELETE CASCADE,
  transaction_type text NOT NULL,
  amount numeric NOT NULL,
  merchant_name text NOT NULL,
  category text NOT NULL,
  transaction_date timestamptz DEFAULT now(),
  location text DEFAULT '',
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- جدول التنبؤات الذكية للأسر
CREATE TABLE IF NOT EXISTS ai_family_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  separation_rate numeric DEFAULT 0,
  risk_level text NOT NULL,
  total_families integer DEFAULT 0,
  at_risk_families integer DEFAULT 0,
  prediction_confidence numeric DEFAULT 0,
  factors jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE debit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_family_predictions ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان - بطاقات الصراف
CREATE POLICY "Users can view own and dependent cards"
  ON debit_cards FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE national_id = current_user
    ) OR
    profile_id IN (
      SELECT dependent_id FROM guardian_links 
      WHERE guardian_id IN (SELECT id FROM profiles WHERE national_id = current_user)
      AND status = 'active'
    )
  );

-- سياسات الأمان - معاملات البطاقات
CREATE POLICY "Users can view own and dependent transactions"
  ON card_transactions FOR SELECT
  TO authenticated
  USING (
    card_id IN (
      SELECT dc.id FROM debit_cards dc
      WHERE dc.profile_id IN (
        SELECT id FROM profiles WHERE national_id = current_user
      ) OR dc.profile_id IN (
        SELECT dependent_id FROM guardian_links 
        WHERE guardian_id IN (SELECT id FROM profiles WHERE national_id = current_user)
        AND status = 'active'
      )
    )
  );

-- سياسات الأمان - التنبؤات الذكية
CREATE POLICY "Allow read access to ai_family_predictions"
  ON ai_family_predictions FOR SELECT
  TO authenticated
  USING (true);

-- إدراج بيانات تجريبية لبطاقات الصراف
DO $$
DECLARE
  dependent_record RECORD;
  card_id_var uuid;
  i INTEGER;
BEGIN
  FOR dependent_record IN 
    SELECT p.id, p.full_name 
    FROM profiles p
    JOIN guardian_links gl ON p.id = gl.dependent_id
    WHERE gl.status = 'active'
    LIMIT 5
  LOOP
    INSERT INTO debit_cards (profile_id, card_number, card_holder_name, bank_name, monthly_limit, is_active)
    VALUES (
      dependent_record.id,
      '**** **** **** ' || (1000 + floor(random() * 9000)::int)::text,
      dependent_record.full_name,
      (ARRAY['البنك الأهلي السعودي', 'بنك الراجحي', 'بنك الرياض', 'بنك ساب', 'البنك السعودي البريطاني'])[floor(random() * 5 + 1)],
      (ARRAY[1000, 1500, 2000, 2500, 3000])[floor(random() * 5 + 1)],
      true
    )
    RETURNING id INTO card_id_var;
    
    FOR i IN 1..10 LOOP
      INSERT INTO card_transactions (
        card_id, 
        transaction_type, 
        amount, 
        merchant_name, 
        category, 
        transaction_date,
        location,
        status
      )
      VALUES (
        card_id_var,
        'purchase',
        floor(random() * 200 + 10)::numeric,
        (ARRAY['ماكدونالدز', 'سنتربوينت', 'مكتبة جرير', 'كافيه', 'صيدلية النهدي', 'كارفور', 'هايبر بنده', 'سينما'])[floor(random() * 8 + 1)],
        (ARRAY['food', 'shopping', 'entertainment', 'health', 'transportation', 'education'])[floor(random() * 6 + 1)],
        now() - (random() * interval '30 days'),
        (ARRAY['الرياض', 'جدة', 'الدمام', 'مكة'])[floor(random() * 4 + 1)],
        'completed'
      );
    END LOOP;
  END LOOP;
END $$;

-- إدراج التنبؤات الذكية للأسر
INSERT INTO ai_family_predictions (region, separation_rate, risk_level, total_families, at_risk_families, prediction_confidence, factors) VALUES
('الرياض', 8.5, 'medium', 1250, 106, 87.3, '{"economic_pressure": 0.42, "education_level": 0.68, "family_support": 0.55, "employment_rate": 0.73}'::jsonb),
('مكة المكرمة', 7.2, 'low', 1180, 85, 89.1, '{"economic_pressure": 0.38, "education_level": 0.72, "family_support": 0.61, "employment_rate": 0.78}'::jsonb),
('المدينة المنورة', 6.1, 'low', 780, 48, 91.2, '{"economic_pressure": 0.35, "education_level": 0.76, "family_support": 0.68, "employment_rate": 0.81}'::jsonb),
('المنطقة الشرقية', 9.3, 'medium', 950, 88, 85.7, '{"economic_pressure": 0.47, "education_level": 0.65, "family_support": 0.52, "employment_rate": 0.69}'::jsonb),
('عسير', 5.8, 'low', 620, 36, 92.4, '{"economic_pressure": 0.31, "education_level": 0.79, "family_support": 0.72, "employment_rate": 0.84}'::jsonb),
('جازان', 10.2, 'high', 540, 55, 83.6, '{"economic_pressure": 0.52, "education_level": 0.61, "family_support": 0.48, "employment_rate": 0.65}'::jsonb)
ON CONFLICT DO NOTHING;
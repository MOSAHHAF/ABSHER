/*
  # إضافة جدول الربط مع الجهات الخارجية

  1. جداول جديدة
    - `external_entities` - الجهات الخارجية (الوزارات)
      - `id` (uuid, primary key)
      - `name_ar` (text) - اسم الجهة بالعربي
      - `name_en` (text) - اسم الجهة بالإنجليزي
      - `entity_type` (text) - نوع الجهة
      - `description` (text) - وصف الجهة
      - `logo_url` (text) - رابط الشعار
      - `is_active` (boolean) - حالة التفعيل
      - `created_at` (timestamptz)
    
    - `integration_services` - الخدمات المتاحة من كل جهة
      - `id` (uuid, primary key)
      - `entity_id` (uuid, foreign key)
      - `service_name_ar` (text) - اسم الخدمة بالعربي
      - `service_name_en` (text) - اسم الخدمة بالإنجليزي
      - `data_type` (text) - نوع البيانات المستلمة
      - `endpoint_url` (text) - رابط الخدمة
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `integration_stats` - إحصائيات الاستعلامات
      - `id` (uuid, primary key)
      - `service_id` (uuid, foreign key)
      - `total_requests` (integer) - إجمالي الطلبات
      - `successful_requests` (integer) - الطلبات الناجحة
      - `failed_requests` (integer) - الطلبات الفاشلة
      - `last_request_at` (timestamptz) - آخر استعلام
      - `average_response_time` (integer) - متوسط وقت الاستجابة (ms)
      - `updated_at` (timestamptz)

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - السماح بالقراءة للمستخدمين المصادق عليهم فقط
*/

-- جدول الجهات الخارجية
CREATE TABLE IF NOT EXISTS external_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  entity_type text NOT NULL,
  description text DEFAULT '',
  logo_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- جدول الخدمات المتاحة
CREATE TABLE IF NOT EXISTS integration_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid REFERENCES external_entities(id) ON DELETE CASCADE,
  service_name_ar text NOT NULL,
  service_name_en text NOT NULL,
  data_type text NOT NULL,
  endpoint_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- جدول إحصائيات الاستعلامات
CREATE TABLE IF NOT EXISTS integration_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES integration_services(id) ON DELETE CASCADE,
  total_requests integer DEFAULT 0,
  successful_requests integer DEFAULT 0,
  failed_requests integer DEFAULT 0,
  last_request_at timestamptz,
  average_response_time integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE external_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_stats ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان - القراءة للجميع
CREATE POLICY "Allow read access to external_entities"
  ON external_entities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to integration_services"
  ON integration_services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to integration_stats"
  ON integration_stats FOR SELECT
  TO authenticated
  USING (true);

-- إدراج بيانات تجريبية للجهات الخارجية
INSERT INTO external_entities (name_ar, name_en, entity_type, description, is_active) VALUES
('وزارة الصحة', 'Ministry of Health', 'ministry', 'الربط مع الأنظمة الصحية والسجلات الطبية', true),
('وزارة العدل', 'Ministry of Justice', 'ministry', 'الربط مع الأنظمة القضائية والإجراءات القانونية', true),
('وزارة التعليم', 'Ministry of Education', 'ministry', 'الربط مع الأنظمة التعليمية والسجلات الأكاديمية', true),
('وزارة الداخلية', 'Ministry of Interior', 'ministry', 'الربط مع الأنظمة الأمنية والبيانات الشخصية', true),
('وزارة الموارد البشرية', 'Ministry of Human Resources', 'ministry', 'الربط مع بيانات التوظيف والتأمينات الاجتماعية', true),
('المرور', 'Traffic Department', 'department', 'الربط مع المخالفات المرورية ورخص القيادة', true)
ON CONFLICT DO NOTHING;

-- إدراج خدمات وزارة الصحة
INSERT INTO integration_services (entity_id, service_name_ar, service_name_en, data_type, is_active)
SELECT id, 'السجل الطبي', 'Medical Records', 'السجلات الصحية والتاريخ المرضي', true
FROM external_entities WHERE name_en = 'Ministry of Health'
ON CONFLICT DO NOTHING;

INSERT INTO integration_services (entity_id, service_name_ar, service_name_en, data_type, is_active)
SELECT id, 'المواعيد الطبية', 'Medical Appointments', 'مواعيد المستشفيات والعيادات', true
FROM external_entities WHERE name_en = 'Ministry of Health'
ON CONFLICT DO NOTHING;

INSERT INTO integration_services (entity_id, service_name_ar, service_name_en, data_type, is_active)
SELECT id, 'التطعيمات', 'Vaccinations', 'سجل التطعيمات والجرعات', true
FROM external_entities WHERE name_en = 'Ministry of Health'
ON CONFLICT DO NOTHING;

-- إدراج خدمات وزارة العدل
INSERT INTO integration_services (entity_id, service_name_ar, service_name_en, data_type, is_active)
SELECT id, 'القضايا والأحكام', 'Cases and Judgments', 'السجل القضائي والأحكام الصادرة', true
FROM external_entities WHERE name_en = 'Ministry of Justice'
ON CONFLICT DO NOTHING;

INSERT INTO integration_services (entity_id, service_name_ar, service_name_en, data_type, is_active)
SELECT id, 'التوثيق والعقود', 'Documentation and Contracts', 'العقود والوثائق القانونية', true
FROM external_entities WHERE name_en = 'Ministry of Justice'
ON CONFLICT DO NOTHING;

-- إدراج خدمات وزارة التعليم
INSERT INTO integration_services (entity_id, service_name_ar, service_name_en, data_type, is_active)
SELECT id, 'السجل الأكاديمي', 'Academic Record', 'السجلات الدراسية والدرجات', true
FROM external_entities WHERE name_en = 'Ministry of Education'
ON CONFLICT DO NOTHING;

INSERT INTO integration_services (entity_id, service_name_ar, service_name_en, data_type, is_active)
SELECT id, 'الحضور والغياب', 'Attendance Record', 'سجل الحضور والغياب المدرسي', true
FROM external_entities WHERE name_en = 'Ministry of Education'
ON CONFLICT DO NOTHING;

INSERT INTO integration_services (entity_id, service_name_ar, service_name_en, data_type, is_active)
SELECT id, 'السلوك الطلابي', 'Student Behavior', 'تقارير السلوك والانضباط', true
FROM external_entities WHERE name_en = 'Ministry of Education'
ON CONFLICT DO NOTHING;

-- إدراج خدمات وزارة الداخلية
INSERT INTO integration_services (entity_id, service_name_ar, service_name_en, data_type, is_active)
SELECT id, 'البيانات الشخصية', 'Personal Information', 'بيانات الهوية الوطنية والإقامة', true
FROM external_entities WHERE name_en = 'Ministry of Interior'
ON CONFLICT DO NOTHING;

INSERT INTO integration_services (entity_id, service_name_ar, service_name_en, data_type, is_active)
SELECT id, 'جواز السفر', 'Passport Information', 'بيانات جواز السفر والسفريات', true
FROM external_entities WHERE name_en = 'Ministry of Interior'
ON CONFLICT DO NOTHING;

-- إدراج خدمات وزارة الموارد البشرية
INSERT INTO integration_services (entity_id, service_name_ar, service_name_en, data_type, is_active)
SELECT id, 'بيانات التوظيف', 'Employment Data', 'سجل التوظيف والرواتب', true
FROM external_entities WHERE name_en = 'Ministry of Human Resources'
ON CONFLICT DO NOTHING;

INSERT INTO integration_services (entity_id, service_name_ar, service_name_en, data_type, is_active)
SELECT id, 'التأمينات الاجتماعية', 'Social Insurance', 'بيانات التأمينات والمعاشات', true
FROM external_entities WHERE name_en = 'Ministry of Human Resources'
ON CONFLICT DO NOTHING;

-- إدراج خدمات المرور
INSERT INTO integration_services (entity_id, service_name_ar, service_name_en, data_type, is_active)
SELECT id, 'المخالفات المرورية', 'Traffic Violations', 'سجل المخالفات المرورية', true
FROM external_entities WHERE name_en = 'Traffic Department'
ON CONFLICT DO NOTHING;

INSERT INTO integration_services (entity_id, service_name_ar, service_name_en, data_type, is_active)
SELECT id, 'رخص القيادة', 'Driving Licenses', 'بيانات رخص القيادة وتجديدها', true
FROM external_entities WHERE name_en = 'Traffic Department'
ON CONFLICT DO NOTHING;

-- إدراج إحصائيات تجريبية
INSERT INTO integration_stats (service_id, total_requests, successful_requests, failed_requests, last_request_at, average_response_time)
SELECT 
  id,
  floor(random() * 10000 + 1000)::integer,
  floor(random() * 9500 + 900)::integer,
  floor(random() * 100 + 10)::integer,
  now() - (random() * interval '7 days'),
  floor(random() * 500 + 100)::integer
FROM integration_services
ON CONFLICT DO NOTHING;
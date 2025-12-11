import { useState, useEffect } from 'react';
import { X, User, Calendar, Phone, Mail, GraduationCap, AlertCircle, FileText, Heart, TrendingUp, Award, Clock } from 'lucide-react';
import { supabase, Profile, AcademicRecord, MedicalRecord, Violation, Referral, Alert } from '../lib/supabase';

interface DependentDetailsModalProps {
  dependent: Profile;
  onClose: () => void;
}

export default function DependentDetailsModal({ dependent, onClose }: DependentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'violations' | 'medical' | 'alerts'>('overview');
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, [dependent.id]);

  async function loadAllData() {
    setLoading(true);
    await Promise.all([
      loadAcademicRecords(),
      loadMedicalRecords(),
      loadViolations(),
      loadReferrals(),
      loadAlerts(),
    ]);
    setLoading(false);
  }

  async function loadAcademicRecords() {
    const { data } = await supabase
      .from('academic_records')
      .select('*')
      .eq('profile_id', dependent.id)
      .order('academic_year', { ascending: false });
    if (data) setAcademicRecords(data);
  }

  async function loadMedicalRecords() {
    const { data } = await supabase
      .from('medical_records')
      .select('*')
      .eq('profile_id', dependent.id)
      .order('visit_date', { ascending: false });
    if (data) setMedicalRecords(data);
  }

  async function loadViolations() {
    const { data } = await supabase
      .from('violations')
      .select('*')
      .eq('profile_id', dependent.id)
      .order('violation_date', { ascending: false });
    if (data) setViolations(data);
  }

  async function loadReferrals() {
    const { data } = await supabase
      .from('referrals')
      .select('*')
      .eq('profile_id', dependent.id)
      .order('referral_date', { ascending: false });
    if (data) setReferrals(data);
  }

  async function loadAlerts() {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('profile_id', dependent.id)
      .order('created_at', { ascending: false });
    if (data) setAlerts(data);
  }

  function calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  function getViolationTypeText(type: string) {
    const types: Record<string, string> = {
      traffic: 'مرورية',
      security: 'أمنية',
      education: 'تعليمية',
      civil: 'مدنية',
      other: 'أخرى'
    };
    return types[type] || type;
  }

  function getStatusBadge(status: string, type: 'violation' | 'referral' | 'academic' = 'violation') {
    if (type === 'violation') {
      switch (status) {
        case 'pending':
          return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">معلقة</span>;
        case 'paid':
          return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">مدفوعة</span>;
        case 'cancelled':
          return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">ملغاة</span>;
      }
    } else if (type === 'referral') {
      switch (status) {
        case 'open':
          return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">مفتوحة</span>;
        case 'closed':
          return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">مغلقة</span>;
        case 'under_review':
          return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">قيد المراجعة</span>;
      }
    } else if (type === 'academic') {
      switch (status) {
        case 'active':
          return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">نشط</span>;
        case 'completed':
          return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">مكتمل</span>;
        case 'failed':
          return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">راسب</span>;
      }
    }
    return null;
  }

  function getBehaviorGradeColor(grade: string) {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-amber-600 bg-amber-100';
      case 'D': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  const currentAcademicRecord = academicRecords.find(r => r.status === 'active');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
              <User className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="flex-1 text-white">
              <h2 className="text-3xl font-bold mb-2">{dependent.full_name}</h2>
              <div className="flex gap-6 text-sm">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {dependent.national_id}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {calculateAge(dependent.date_of_birth)} سنة
                </span>
                {dependent.phone && (
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {dependent.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 p-6 bg-gray-50 border-b">
          <div className="bg-white p-4 rounded-lg text-center shadow-sm">
            <GraduationCap className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{academicRecords.length}</p>
            <p className="text-xs text-gray-600">سجلات دراسية</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center shadow-sm">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{violations.length}</p>
            <p className="text-xs text-gray-600">مخالفات</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center shadow-sm">
            <FileText className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{referrals.length}</p>
            <p className="text-xs text-gray-600">إحالات</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center shadow-sm">
            <Heart className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{medicalRecords.length}</p>
            <p className="text-xs text-gray-600">سجلات طبية</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center shadow-sm">
            <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            <p className="text-xs text-gray-600">تنبيهات</p>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              نظرة عامة
            </button>
            <button
              onClick={() => setActiveTab('academic')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'academic' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              السجل الدراسي
            </button>
            <button
              onClick={() => setActiveTab('violations')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'violations' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              المخالفات والإحالات
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'medical' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              السجل الطبي
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'alerts' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              التنبيهات
            </button>
          </nav>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 400px)' }}>
          {loading ? (
            <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-600" />
                      المعلومات الشخصية
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">الاسم الكامل</p>
                        <p className="font-medium text-gray-900">{dependent.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">رقم الهوية</p>
                        <p className="font-medium text-gray-900">{dependent.national_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">تاريخ الميلاد</p>
                        <p className="font-medium text-gray-900">{new Date(dependent.date_of_birth).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">العمر</p>
                        <p className="font-medium text-gray-900">{calculateAge(dependent.date_of_birth)} سنة</p>
                      </div>
                      {dependent.phone && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">رقم الجوال</p>
                          <p className="font-medium text-gray-900">{dependent.phone}</p>
                        </div>
                      )}
                      {dependent.email && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">البريد الإلكتروني</p>
                          <p className="font-medium text-gray-900">{dependent.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {currentAcademicRecord && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-emerald-600" />
                        الوضع الدراسي الحالي
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">المدرسة</p>
                          <p className="font-medium text-gray-900">{currentAcademicRecord.school_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">المرحلة الدراسية</p>
                          <p className="font-medium text-gray-900">{currentAcademicRecord.grade_level}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">المعدل التراكمي</p>
                          <p className="font-bold text-2xl text-emerald-600">{currentAcademicRecord.gpa.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">نسبة الحضور</p>
                          <p className="font-bold text-2xl text-blue-600">{currentAcademicRecord.attendance_rate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">السلوك</p>
                          <span className={`inline-block px-4 py-2 rounded-lg font-bold text-lg ${getBehaviorGradeColor(currentAcademicRecord.behavior_grade)}`}>
                            {currentAcademicRecord.behavior_grade}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">الحالة</p>
                          <div>{getStatusBadge(currentAcademicRecord.status, 'academic')}</div>
                        </div>
                      </div>
                      {currentAcademicRecord.notes && (
                        <div className="mt-4 p-4 bg-white rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">ملاحظات</p>
                          <p className="text-gray-900">{currentAcademicRecord.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        المخالفات
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">إجمالي المخالفات</span>
                          <span className="font-bold text-2xl text-gray-900">{violations.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">المخالفات المعلقة</span>
                          <span className="font-bold text-xl text-amber-600">{violations.filter(v => v.status === 'pending').length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">إجمالي الغرامات</span>
                          <span className="font-bold text-xl text-red-600">{violations.filter(v => v.status === 'pending').reduce((sum, v) => sum + Number(v.amount), 0)} ريال</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-600" />
                        الصحة
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">السجلات الطبية</span>
                          <span className="font-bold text-2xl text-gray-900">{medicalRecords.length}</span>
                        </div>
                        {medicalRecords[0] && (
                          <div className="mt-4 p-3 bg-pink-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">آخر زيارة</p>
                            <p className="font-medium text-gray-900">{new Date(medicalRecords[0].visit_date).toLocaleDateString('ar-SA')}</p>
                            <p className="text-sm text-gray-700 mt-1">{medicalRecords[0].diagnosis}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'academic' && (
                <div className="space-y-4">
                  {academicRecords.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p>لا توجد سجلات دراسية</p>
                    </div>
                  ) : (
                    academicRecords.map((record) => (
                      <div key={record.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{record.school_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{record.grade_level}</p>
                            <p className="text-sm text-gray-500">{record.academic_year} - {record.semester}</p>
                          </div>
                          {getStatusBadge(record.status, 'academic')}
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-4 bg-emerald-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-emerald-600">{record.gpa.toFixed(2)}</p>
                            <p className="text-xs text-gray-600">المعدل</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-blue-600">{record.attendance_rate.toFixed(1)}%</p>
                            <p className="text-xs text-gray-600">الحضور</p>
                          </div>
                          <div className="text-center p-4 bg-amber-50 rounded-lg">
                            <Award className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-amber-600">{record.behavior_grade}</p>
                            <p className="text-xs text-gray-600">السلوك</p>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <Calendar className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-900">{record.academic_year}</p>
                            <p className="text-xs text-gray-600">{record.semester}</p>
                          </div>
                        </div>

                        {record.notes && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">ملاحظات</p>
                            <p className="text-gray-900">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'violations' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">المخالفات</h3>
                    {violations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p>لا توجد مخالفات</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {violations.map((violation) => (
                          <div key={violation.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-gray-900">{violation.description}</h4>
                                <p className="text-sm text-gray-600 mt-1">{violation.issuing_authority}</p>
                                <p className="text-sm text-gray-500">{new Date(violation.violation_date).toLocaleDateString('ar-SA')}</p>
                              </div>
                              <div className="text-left">
                                {getStatusBadge(violation.status, 'violation')}
                                <p className="text-lg font-bold text-gray-900 mt-2">{Number(violation.amount)} ريال</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="px-2 py-1 bg-gray-100 rounded">{getViolationTypeText(violation.violation_type)}</span>
                              <span className="px-2 py-1 bg-gray-100 rounded">{violation.violation_code}</span>
                              {violation.location && <span>{violation.location}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {referrals.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">الإحالات القضائية</h3>
                      <div className="space-y-3">
                        {referrals.map((referral) => (
                          <div key={referral.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-gray-900">{referral.referral_type}</h4>
                                <p className="text-sm text-gray-600 mt-1">رقم القضية: {referral.case_number}</p>
                                <p className="text-sm text-gray-600">{referral.issuing_authority}</p>
                                <p className="text-sm text-gray-500">{new Date(referral.referral_date).toLocaleDateString('ar-SA')}</p>
                              </div>
                              {getStatusBadge(referral.status, 'referral')}
                            </div>
                            <p className="text-gray-700 mb-2">{referral.description}</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              referral.severity === 'high' ? 'bg-red-100 text-red-800' :
                              referral.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {referral.severity === 'high' ? 'خطورة عالية' : referral.severity === 'medium' ? 'خطورة متوسطة' : 'خطورة منخفضة'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'medical' && (
                <div className="space-y-4">
                  {medicalRecords.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p>لا توجد سجلات طبية</p>
                    </div>
                  ) : (
                    medicalRecords.map((record) => (
                      <div key={record.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{record.record_type}</h4>
                            <p className="text-sm text-gray-600 mt-1">{record.hospital_name}</p>
                            {record.doctor_name && (
                              <p className="text-sm text-gray-600">{record.doctor_name}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">{new Date(record.visit_date).toLocaleDateString('ar-SA')}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-1">التشخيص</p>
                            <p className="text-gray-900">{record.diagnosis}</p>
                          </div>

                          {record.treatment && (
                            <div className="p-4 bg-green-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 mb-1">العلاج</p>
                              <p className="text-gray-900">{record.treatment}</p>
                            </div>
                          )}

                          {record.notes && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 mb-1">ملاحظات</p>
                              <p className="text-gray-900">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'alerts' && (
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p>لا توجد تنبيهات</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.id} className={`border rounded-lg p-4 ${
                        alert.priority === 'urgent' ? 'bg-red-50 border-red-200' :
                        alert.priority === 'high' ? 'bg-amber-50 border-amber-200' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900">{alert.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            alert.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            alert.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                            alert.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {alert.priority === 'urgent' ? 'عاجل' : alert.priority === 'high' ? 'مهم' : alert.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{alert.message}</p>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>{alert.issuing_authority}</span>
                          <span>{alert.created_at ? new Date(alert.created_at).toLocaleDateString('ar-SA') : ''}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

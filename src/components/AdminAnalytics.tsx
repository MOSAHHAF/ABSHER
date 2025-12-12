import { useState, useEffect } from 'react';
import { ArrowLeft, Users, AlertCircle, TrendingUp, TrendingDown, MapPin, GraduationCap, Shield, Activity, FileText, Heart, Award, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminAnalyticsProps {
  onBack: () => void;
}

interface RegionStats {
  region: string;
  totalFamilies: number;
  totalDependents: number;
  totalViolations: number;
  pendingViolations: number;
  totalReferrals: number;
  averageGPA: number;
  attendanceRate: number;
}

export default function AdminAnalytics({ onBack }: AdminAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [totalViolations, setTotalViolations] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalGuardianLinks, setTotalGuardianLinks] = useState(0);
  const [pendingViolations, setPendingViolations] = useState(0);
  const [totalFines, setTotalFines] = useState(0);
  const [averageGPA, setAverageGPA] = useState(0);
  const [averageAttendance, setAverageAttendance] = useState(0);

  const regions: RegionStats[] = [
    {
      region: 'الرياض',
      totalFamilies: 1250,
      totalDependents: 3840,
      totalViolations: 245,
      pendingViolations: 89,
      totalReferrals: 12,
      averageGPA: 3.85,
      attendanceRate: 94.5
    },
    {
      region: 'مكة المكرمة',
      totalFamilies: 1180,
      totalDependents: 3620,
      totalViolations: 198,
      pendingViolations: 67,
      totalReferrals: 8,
      averageGPA: 3.92,
      attendanceRate: 95.2
    },
    {
      region: 'المدينة المنورة',
      totalFamilies: 780,
      totalDependents: 2340,
      totalViolations: 132,
      pendingViolations: 45,
      totalReferrals: 5,
      averageGPA: 4.05,
      attendanceRate: 96.8
    },
    {
      region: 'المنطقة الشرقية',
      totalFamilies: 950,
      totalDependents: 2890,
      totalViolations: 167,
      pendingViolations: 52,
      totalReferrals: 7,
      averageGPA: 3.78,
      attendanceRate: 93.4
    },
    {
      region: 'عسير',
      totalFamilies: 620,
      totalDependents: 1980,
      totalViolations: 98,
      pendingViolations: 34,
      totalReferrals: 4,
      averageGPA: 3.95,
      attendanceRate: 95.7
    },
    {
      region: 'جازان',
      totalFamilies: 540,
      totalDependents: 1720,
      totalViolations: 87,
      pendingViolations: 28,
      totalReferrals: 3,
      averageGPA: 3.88,
      attendanceRate: 94.9
    }
  ];

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);

    const [profilesRes, violationsRes, referralsRes, linksRes, academicRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('violations').select('*'),
      supabase.from('referrals').select('id', { count: 'exact', head: true }),
      supabase.from('guardian_links').select('id', { count: 'exact', head: true }),
      supabase.from('academic_records').select('gpa, attendance_rate').eq('status', 'active')
    ]);

    setTotalProfiles(profilesRes.count || 0);
    setTotalViolations(violationsRes.data?.length || 0);
    setTotalReferrals(referralsRes.count || 0);
    setTotalGuardianLinks(linksRes.count || 0);

    if (violationsRes.data) {
      const pending = violationsRes.data.filter(v => v.status === 'pending');
      setPendingViolations(pending.length);
      setTotalFines(pending.reduce((sum, v) => sum + Number(v.amount), 0));
    }

    if (academicRes.data && academicRes.data.length > 0) {
      const avgGPA = academicRes.data.reduce((sum, r) => sum + Number(r.gpa), 0) / academicRes.data.length;
      const avgAttendance = academicRes.data.reduce((sum, r) => sum + Number(r.attendance_rate), 0) / academicRes.data.length;
      setAverageGPA(avgGPA);
      setAverageAttendance(avgAttendance);
    }

    setLoading(false);
  }

  const violationTypes = [
    { type: 'مرورية', count: 145, percentage: 42, trend: 'down', change: -8 },
    { type: 'تعليمية', count: 98, percentage: 28, trend: 'up', change: 12 },
    { type: 'مدنية', count: 67, percentage: 19, trend: 'down', change: -3 },
    { type: 'أمنية', count: 38, percentage: 11, trend: 'stable', change: 0 }
  ];

  const sustainabilityMetrics = [
    {
      title: 'معدل الالتزام الأسري',
      value: '87.5%',
      change: '+5.2%',
      trend: 'up',
      description: 'نسبة الأسر الملتزمة بمتابعة أبنائهم بشكل دوري'
    },
    {
      title: 'معدل حل المخالفات',
      value: '72.3%',
      change: '+12.8%',
      trend: 'up',
      description: 'نسبة المخالفات التي تم حلها خلال 30 يوم'
    },
    {
      title: 'التحسن الدراسي',
      value: '+0.35',
      change: '+15.4%',
      trend: 'up',
      description: 'متوسط التحسن في المعدلات الدراسية للطلاب المتابعين'
    },
    {
      title: 'انخفاض الإحالات',
      value: '-28%',
      change: '-28%',
      trend: 'up',
      description: 'انخفاض الإحالات القضائية مقارنة بالعام الماضي'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">لوحة التحليلات الإدارية</h1>
              <p className="text-blue-100 mt-1">تحليلات شاملة للأسر في مناطق المملكة</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">جاري تحميل التحليلات...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-10 h-10 text-blue-600" />
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalProfiles}</p>
                <p className="text-sm text-gray-600">إجمالي الأفراد</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-emerald-100">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="w-10 h-10 text-emerald-600" />
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalGuardianLinks}</p>
                <p className="text-sm text-gray-600">الأسر المرتبطة</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-amber-100">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-10 h-10 text-amber-600" />
                  <TrendingDown className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalViolations}</p>
                <p className="text-sm text-gray-600">إجمالي المخالفات</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-100">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-10 h-10 text-red-600" />
                  <TrendingDown className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalReferrals}</p>
                <p className="text-sm text-gray-600">الإحالات القضائية</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-emerald-600" />
                  المؤشرات التعليمية
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg">
                    <span className="text-gray-700">المعدل التراكمي العام</span>
                    <span className="text-3xl font-bold text-emerald-600">{averageGPA.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">معدل الحضور العام</span>
                    <span className="text-3xl font-bold text-blue-600">{averageAttendance.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                  حالة المخالفات
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-amber-50 rounded-lg">
                    <span className="text-gray-700">المخالفات المعلقة</span>
                    <span className="text-3xl font-bold text-amber-600">{pendingViolations}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <span className="text-gray-700">إجمالي الغرامات</span>
                    <span className="text-3xl font-bold text-red-600">{totalFines.toLocaleString()} ريال</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                الإحصائيات حسب المناطق
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-right py-3 px-4 font-bold text-gray-700">المنطقة</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">الأسر</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">الأبناء</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">المخالفات</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">المعلقة</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">الإحالات</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">المعدل</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">الحضور</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regions.map((region, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{region.region}</td>
                        <td className="text-center py-4 px-4 text-gray-700">{region.totalFamilies}</td>
                        <td className="text-center py-4 px-4 text-gray-700">{region.totalDependents}</td>
                        <td className="text-center py-4 px-4 text-amber-600 font-bold">{region.totalViolations}</td>
                        <td className="text-center py-4 px-4 text-red-600 font-bold">{region.pendingViolations}</td>
                        <td className="text-center py-4 px-4 text-red-700 font-bold">{region.totalReferrals}</td>
                        <td className="text-center py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            region.averageGPA >= 4.0 ? 'bg-green-100 text-green-700' :
                            region.averageGPA >= 3.5 ? 'bg-emerald-100 text-emerald-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {region.averageGPA.toFixed(2)}
                          </span>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            region.attendanceRate >= 95 ? 'bg-green-100 text-green-700' :
                            region.attendanceRate >= 90 ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {region.attendanceRate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-amber-600" />
                توزيع المخالفات حسب النوع
              </h3>
              <div className="space-y-4">
                {violationTypes.map((vType, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">{vType.type}</span>
                        <span className="text-sm text-gray-600">({vType.count} مخالفة)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {vType.trend === 'down' && <TrendingDown className="w-5 h-5 text-green-600" />}
                        {vType.trend === 'up' && <TrendingUp className="w-5 h-5 text-red-600" />}
                        <span className={`text-sm font-bold ${
                          vType.trend === 'down' ? 'text-green-600' : vType.trend === 'up' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {vType.change > 0 ? '+' : ''}{vType.change}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          index === 0 ? 'bg-amber-500' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-emerald-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${vType.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 shadow-lg border-2 border-emerald-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-emerald-600" />
                مؤشرات الاستدامة والتطوير
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {sustainabilityMetrics.map((metric, index) => (
                  <div key={index} className="bg-white rounded-lg p-5 shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{metric.title}</h4>
                        <p className="text-sm text-gray-600">{metric.description}</p>
                      </div>
                      {metric.trend === 'up' && (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-bold text-emerald-600">{metric.value}</span>
                      <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        {metric.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <Heart className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold">التأثير الإيجابي</h3>
                  <p className="text-blue-100 text-sm">ساهمت المنصة في تحسين المتابعة الأسرية وتقليل المخالفات</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">92%</p>
                  <p className="text-sm text-blue-100">رضا الأسر</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">85%</p>
                  <p className="text-sm text-blue-100">تحسن السلوك</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">78%</p>
                  <p className="text-sm text-blue-100">انخفاض المشاكل</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

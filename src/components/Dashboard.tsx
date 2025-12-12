import { useState, useEffect } from 'react';
import { supabase, GuardianLink, Violation, Referral, Alert } from '../lib/supabase';
import { Users, AlertCircle, FileText, Bell, ArrowLeft, CreditCard } from 'lucide-react';
import DependentsList from './DependentsList';
import ViolationsList from './ViolationsList';
import ReferralsList from './ReferralsList';
import AlertsList from './AlertsList';
import DebitCardExpenses from './DebitCardExpenses';

const GUARDIAN_ID = '00000000-0000-0000-0000-000000000001';

interface DashboardProps {
  onBack?: () => void;
}

export default function Dashboard({ onBack }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'dependents' | 'violations' | 'referrals' | 'alerts' | 'expenses'>('dependents');
  const [selectedDependentForExpenses, setSelectedDependentForExpenses] = useState<{ id: string; name: string } | null>(null);
  const [guardianProfile, setGuardianProfile] = useState<any>(null);
  const [guardianLinks, setGuardianLinks] = useState<GuardianLink[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    await Promise.all([
      loadGuardianProfile(),
      loadGuardianLinks(),
      loadViolations(),
      loadReferrals(),
      loadAlerts(),
    ]);
    setLoading(false);
  }

  async function loadGuardianProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', GUARDIAN_ID)
      .maybeSingle();

    if (data) setGuardianProfile(data);
  }

  async function loadGuardianLinks() {
    const { data } = await supabase
      .from('guardian_links')
      .select(`
        *,
        dependent:profiles!guardian_links_dependent_id_fkey(*)
      `)
      .eq('guardian_id', GUARDIAN_ID)
      .order('created_at', { ascending: false });

    if (data) setGuardianLinks(data as any);
  }

  async function loadViolations() {
    const { data: links } = await supabase
      .from('guardian_links')
      .select('dependent_id')
      .eq('guardian_id', GUARDIAN_ID)
      .eq('status', 'active');

    if (links && links.length > 0) {
      const dependentIds = links.map(l => l.dependent_id);
      const { data } = await supabase
        .from('violations')
        .select('*')
        .in('profile_id', dependentIds)
        .order('violation_date', { ascending: false });

      if (data) setViolations(data);
    }
  }

  async function loadReferrals() {
    const { data: links } = await supabase
      .from('guardian_links')
      .select('dependent_id')
      .eq('guardian_id', GUARDIAN_ID)
      .eq('status', 'active');

    if (links && links.length > 0) {
      const dependentIds = links.map(l => l.dependent_id);
      const { data } = await supabase
        .from('referrals')
        .select('*')
        .in('profile_id', dependentIds)
        .order('referral_date', { ascending: false });

      if (data) setReferrals(data);
    }
  }

  async function loadAlerts() {
    const { data: links } = await supabase
      .from('guardian_links')
      .select('dependent_id')
      .eq('guardian_id', GUARDIAN_ID)
      .eq('status', 'active');

    if (links && links.length > 0) {
      const dependentIds = links.map(l => l.dependent_id);
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .in('profile_id', dependentIds)
        .order('created_at', { ascending: false });

      if (data) setAlerts(data);
    }
  }

  const unreadAlertsCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                  title="العودة للصفحة الرئيسية"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <img
                src="/whatsapp_image_2025-12-12_at_3.09.23_pm.jpeg"
                alt="شعار أسرتي"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">نظام أسرتي</h1>
                <p className="text-xs text-gray-500">متابعة شاملة لأفراد الأسرة</p>
              </div>
            </div>
            {guardianProfile && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{guardianProfile.full_name}</p>
                <p className="text-xs text-gray-500">{guardianProfile.national_id}</p>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">لوحة التحكم</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">الأبناء المرتبطين</p>
                  <p className="text-3xl font-bold text-gray-900">{guardianLinks.filter(l => l.status === 'active').length}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">المخالفات</p>
                  <p className="text-3xl font-bold text-gray-900">{violations.filter(v => v.status === 'pending').length}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">الإحالات</p>
                  <p className="text-3xl font-bold text-gray-900">{referrals.filter(r => r.status === 'open').length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">التنبيهات الجديدة</p>
                  <p className="text-3xl font-bold text-gray-900">{unreadAlertsCount}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('dependents')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'dependents'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                الأبناء المرتبطين
              </button>
              <button
                onClick={() => setActiveTab('violations')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'violations'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                المخالفات
              </button>
              <button
                onClick={() => setActiveTab('referrals')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'referrals'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                الإحالات
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors relative ${
                  activeTab === 'alerts'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                التنبيهات
                {unreadAlertsCount > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  const activeLinks = guardianLinks.filter(l => l.status === 'active');
                  if (activeLinks.length > 0 && activeLinks[0].dependent) {
                    setSelectedDependentForExpenses({
                      id: activeLinks[0].dependent_id,
                      name: activeLinks[0].dependent.full_name
                    });
                    setActiveTab('expenses');
                  }
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'expenses'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                بطاقات الصراف
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
            ) : (
              <>
                {activeTab === 'dependents' && (
                  <DependentsList links={guardianLinks} onUpdate={loadData} />
                )}
                {activeTab === 'violations' && (
                  <ViolationsList violations={violations} guardianLinks={guardianLinks} />
                )}
                {activeTab === 'referrals' && (
                  <ReferralsList referrals={referrals} guardianLinks={guardianLinks} />
                )}
                {activeTab === 'alerts' && (
                  <AlertsList alerts={alerts} guardianLinks={guardianLinks} onUpdate={loadAlerts} />
                )}
                {activeTab === 'expenses' && (
                  <div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اختر الابن لعرض بطاقاته
                      </label>
                      <select
                        className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={selectedDependentForExpenses?.id || ''}
                        onChange={(e) => {
                          const link = guardianLinks.find(l => l.dependent_id === e.target.value);
                          if (link && link.dependent) {
                            setSelectedDependentForExpenses({
                              id: link.dependent_id,
                              name: link.dependent.full_name
                            });
                          }
                        }}
                      >
                        {guardianLinks.filter(l => l.status === 'active').map(link => (
                          <option key={link.id} value={link.dependent_id}>
                            {link.dependent?.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedDependentForExpenses && (
                      <DebitCardExpenses
                        dependentId={selectedDependentForExpenses.id}
                        dependentName={selectedDependentForExpenses.name}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

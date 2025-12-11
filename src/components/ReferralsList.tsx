import { Referral, GuardianLink } from '../lib/supabase';
import { FileText, Calendar, AlertTriangle } from 'lucide-react';

interface ReferralsListProps {
  referrals: Referral[];
  guardianLinks: GuardianLink[];
}

export default function ReferralsList({ referrals, guardianLinks }: ReferralsListProps) {
  function getSeverityBadge(severity: string) {
    switch (severity) {
      case 'low':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">منخفضة</span>;
      case 'medium':
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">متوسطة</span>;
      case 'high':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">عالية</span>;
      default:
        return <span className="text-gray-600">{severity}</span>;
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'open':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">مفتوحة</span>;
      case 'under_review':
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">قيد المراجعة</span>;
      case 'closed':
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">مغلقة</span>;
      default:
        return <span className="text-gray-600">{status}</span>;
    }
  }

  function getDependentName(profileId: string): string {
    const link = guardianLinks.find(l => l.dependent_id === profileId);
    return link?.dependent?.full_name || 'غير معروف';
  }

  if (referrals.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">لا توجد إحالات</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {referrals.map((referral) => (
        <div key={referral.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {getStatusBadge(referral.status)}
                {getSeverityBadge(referral.severity)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{referral.referral_type}</h3>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">المحال:</span> {getDependentName(referral.profile_id)}
              </p>
              <p className="text-gray-700">{referral.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span>رقم القضية: {referral.case_number}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>تاريخ الإحالة: {new Date(referral.referral_date).toLocaleDateString('ar-SA')}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-1">الجهة المحيلة:</p>
            <p className="text-sm text-gray-900">{referral.issuing_authority}</p>
          </div>

          {referral.severity === 'high' && referral.status === 'open' && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                <strong>تنبيه:</strong> هذه إحالة ذات خطورة عالية وتحتاج إلى متابعة عاجلة
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

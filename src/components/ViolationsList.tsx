import { Violation, GuardianLink } from '../lib/supabase';
import { AlertCircle, MapPin, Calendar, DollarSign, FileText } from 'lucide-react';

interface ViolationsListProps {
  violations: Violation[];
  guardianLinks: GuardianLink[];
}

export default function ViolationsList({ violations, guardianLinks }: ViolationsListProps) {
  function getViolationTypeText(type: string) {
    switch (type) {
      case 'traffic': return 'مرورية';
      case 'security': return 'أمنية';
      case 'education': return 'تعليمية';
      case 'civil': return 'مدنية';
      case 'other': return 'أخرى';
      default: return type;
    }
  }

  function getViolationTypeColor(type: string) {
    switch (type) {
      case 'traffic': return 'bg-amber-100 text-amber-700';
      case 'security': return 'bg-red-100 text-red-700';
      case 'education': return 'bg-blue-100 text-blue-700';
      case 'civil': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">قيد الانتظار</span>;
      case 'paid':
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">مدفوعة</span>;
      case 'cancelled':
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">ملغاة</span>;
      default:
        return <span className="text-gray-600">{status}</span>;
    }
  }

  function getDependentName(profileId: string): string {
    const link = guardianLinks.find(l => l.dependent_id === profileId);
    return link?.dependent?.full_name || 'غير معروف';
  }

  if (violations.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">لا توجد مخالفات</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {violations.map((violation) => (
        <div key={violation.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getViolationTypeColor(violation.violation_type)}`}>
                  {getViolationTypeText(violation.violation_type)}
                </span>
                {getStatusBadge(violation.status)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{violation.description}</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">المخالف:</span> {getDependentName(violation.profile_id)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span>رمز المخالفة: {violation.violation_code}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>التاريخ: {new Date(violation.violation_date).toLocaleDateString('ar-SA')}</span>
            </div>
            {violation.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>الموقع: {violation.location}</span>
              </div>
            )}
            {violation.amount > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>المبلغ: {violation.amount} ريال</span>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
            <p className="font-medium mb-1">الجهة المصدرة:</p>
            <p>{violation.issuing_authority}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

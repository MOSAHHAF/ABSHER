import { useState } from 'react';
import { GuardianLink, Profile } from '../lib/supabase';
import { User, Calendar, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import DependentDetailsModal from './DependentDetailsModal';

interface DependentsListProps {
  links: GuardianLink[];
  onUpdate: () => void;
}

export default function DependentsList({ links }: DependentsListProps) {
  const [selectedDependent, setSelectedDependent] = useState<Profile | null>(null);
  function getRelationshipText(relationship: string) {
    switch (relationship) {
      case 'father': return 'أب';
      case 'mother': return 'أم';
      case 'legal_guardian': return 'وصي قانوني';
      default: return relationship;
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-sm"><CheckCircle className="w-4 h-4" /> نشط</span>;
      case 'expired':
        return <span className="flex items-center gap-1 text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-sm"><Clock className="w-4 h-4" /> منتهي</span>;
      case 'revoked':
        return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm"><XCircle className="w-4 h-4" /> ملغي</span>;
      default:
        return <span className="text-gray-600">{status}</span>;
    }
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

  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">لا يوجد أبناء مرتبطين</p>
        <p className="text-sm text-gray-400 mt-2">اضغط على "ربط ابن/ابنة" لإضافة حساب جديد</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <div
              key={link.id}
              onClick={() => link.dependent && setSelectedDependent(link.dependent)}
              className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{link.dependent?.full_name}</h3>
              <div className="mb-3">
                {getStatusBadge(link.status)}
              </div>
            </div>

            <div className="space-y-3 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">رقم الهوية:</span>
                <span className="font-semibold text-gray-900 mr-auto">{link.dependent?.national_id}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">العمر:</span>
                <span className="font-semibold text-gray-900 mr-auto">
                  {link.dependent?.date_of_birth ? calculateAge(link.dependent.date_of_birth) : '—'} سنة
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">تاريخ الميلاد:</span>
                <span className="font-semibold text-gray-900 mr-auto">
                  {link.dependent?.date_of_birth ? new Date(link.dependent.date_of_birth).toLocaleDateString('ar-SA') : '—'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">العلاقة:</span>
                <span className="font-semibold text-gray-900 mr-auto">{getRelationshipText(link.relationship)}</span>
              </div>

              {link.dependent?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">الجوال:</span>
                  <span className="font-semibold text-gray-900 mr-auto">{link.dependent.phone}</span>
                </div>
              )}

              {link.dependent?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">البريد:</span>
                  <span className="font-semibold text-gray-900 mr-auto text-xs">{link.dependent.email}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>تاريخ الربط:</span>
                  <span className="font-medium">
                    {link.created_at ? new Date(link.created_at).toLocaleDateString('ar-SA') : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>انتهاء الصلاحية:</span>
                  <span className="font-medium">
                    {new Date(link.auto_expiry_date).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          ))}
        </div>
      </div>

      {selectedDependent && (
        <DependentDetailsModal
          dependent={selectedDependent}
          onClose={() => setSelectedDependent(null)}
        />
      )}
    </>
  );
}

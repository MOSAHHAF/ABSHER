import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

interface LinkDependentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function LinkDependentModal({ onClose, onSuccess }: LinkDependentModalProps) {
  const { profile } = useAuth();
  const [nationalId, setNationalId] = useState('');
  const [relationship, setRelationship] = useState<'father' | 'mother' | 'legal_guardian'>('father');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: dependentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('national_id', nationalId)
      .maybeSingle();

    if (fetchError || !dependentProfile) {
      setError('لم يتم العثور على حساب بهذا الرقم');
      setLoading(false);
      return;
    }

    const birthDate = new Date(dependentProfile.date_of_birth);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    if (age >= 18) {
      setError('لا يمكن ربط حساب لشخص بالغ (18 سنة أو أكثر) بدون موافقته');
      setLoading(false);
      return;
    }

    const autoExpiryDate = new Date(birthDate);
    autoExpiryDate.setFullYear(autoExpiryDate.getFullYear() + 18);

    const { error: linkError } = await supabase
      .from('guardian_links')
      .insert([{
        guardian_id: profile?.id,
        dependent_id: dependentProfile.id,
        relationship,
        status: 'active',
        auto_expiry_date: autoExpiryDate.toISOString().split('T')[0],
        dependent_consent: false,
      }]);

    if (linkError) {
      if (linkError.code === '23505') {
        setError('هذا الحساب مرتبط بالفعل');
      } else {
        setError('حدث خطأ أثناء الربط');
      }
      setLoading(false);
      return;
    }

    await supabase
      .from('alerts')
      .insert([{
        profile_id: dependentProfile.id,
        alert_type: 'guardian_link',
        title: 'تم ربط حسابك بولي أمر',
        message: `تم ربط حسابك بحساب ${profile?.full_name} كولي أمر. سيتم إلغاء الربط تلقائيًا عند بلوغك 18 سنة.`,
        issuing_authority: 'نظام متابعة الأسرة',
        priority: 'medium',
        is_read: false,
      }]);

    setLoading(false);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">ربط ابن/ابنة</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-right">
              {error}
            </div>
          )}

          <div className="text-right">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الهوية الوطنية للابن/الابنة
            </label>
            <input
              type="text"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-right"
              required
              maxLength={10}
              dir="ltr"
            />
          </div>

          <div className="text-right">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              صلة القرابة
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-right"
            >
              <option value="father">أب</option>
              <option value="mother">أم</option>
              <option value="legal_guardian">وصي قانوني</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-right">
            <p className="text-sm text-blue-800">
              <strong>ملاحظة:</strong> سيتم إلغاء الربط تلقائيًا عند بلوغ الابن/الابنة 18 سنة.
              يمكن الاستمرار في المتابعة بعد ذلك فقط بموافقة الابن/الابنة.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الربط...' : 'ربط الحساب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

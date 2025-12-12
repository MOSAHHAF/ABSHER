import { Users, BarChart3, Shield, TrendingUp } from 'lucide-react';

interface UserTypeSelectionProps {
  onSelectGuardian: () => void;
  onSelectAdmin: () => void;
}

export default function UserTypeSelection({ onSelectGuardian, onSelectAdmin }: UserTypeSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/whatsapp_image_2025-12-12_at_3.09.23_pm.jpeg"
              alt="شعار أسرتي"
              className="w-40 h-40 object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            نظام أسرتي
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نظام متكامل لمتابعة الأبناء وإدارة شؤون الأسرة
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div
            onClick={onSelectGuardian}
            className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-emerald-500 hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-2xl transition-all">
                <Users className="w-16 h-16 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                دخول ولي الأمر
              </h2>

              <p className="text-gray-600 mb-6 text-lg">
                متابعة شؤون الأبناء والاطلاع على السجلات الدراسية والمخالفات والتنبيهات
              </p>

              <div className="space-y-3 mb-8 w-full">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>متابعة الأبناء المرتبطين</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>عرض السجلات الدراسية</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>متابعة المخالفات والإحالات</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>السجلات الطبية والتنبيهات</span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg group-hover:shadow-xl">
                الدخول إلى لوحة التحكم
              </button>
            </div>
          </div>

          <div
            onClick={onSelectAdmin}
            className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500 hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-2xl transition-all">
                <BarChart3 className="w-16 h-16 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                دخول الموظفين
              </h2>

              <p className="text-gray-600 mb-6 text-lg">
                تحليلات شاملة للأسر في مناطق المملكة وإحصائيات لدعم القرار والاستدامة
              </p>

              <div className="space-y-3 mb-8 w-full">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>تحليلات حسب المناطق</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>إحصائيات المخالفات</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>مؤشرات الأداء الأسري</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>تقارير الاستدامة</span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg group-hover:shadow-xl">
                الدخول إلى لوحة التحليلات
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>آمن ومحمي</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>تحليلات متقدمة</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>سهل الاستخدام</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

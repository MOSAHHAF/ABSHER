import { useState, useEffect } from 'react';
import { supabase, AIFamilyPrediction } from '../lib/supabase';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';

export default function AIPredictions() {
  const [predictions, setPredictions] = useState<AIFamilyPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, []);

  async function loadPredictions() {
    setLoading(true);

    const { data } = await supabase
      .from('ai_family_predictions')
      .select('*')
      .order('separation_rate', { ascending: false });

    if (data) {
      setPredictions(data);
    }

    setLoading(false);
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <TrendingUp className="w-5 h-5" />;
      case 'low':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'high':
        return 'خطر عالي';
      case 'medium':
        return 'خطر متوسط';
      case 'low':
        return 'خطر منخفض';
      default:
        return level;
    }
  };

  const getFactorLabel = (factor: string) => {
    const labels: Record<string, string> = {
      economic_pressure: 'الضغوط الاقتصادية',
      education_level: 'مستوى التعليم',
      family_support: 'الدعم الأسري',
      employment_rate: 'معدل التوظيف'
    };
    return labels[factor] || factor;
  };

  const totalFamilies = predictions.reduce((sum, p) => sum + p.total_families, 0);
  const totalAtRisk = predictions.reduce((sum, p) => sum + p.at_risk_families, 0);
  const avgSeparationRate =
    predictions.length > 0
      ? predictions.reduce((sum, p) => sum + p.separation_rate, 0) / predictions.length
      : 0;
  const avgConfidence =
    predictions.length > 0
      ? predictions.reduce((sum, p) => sum + p.prediction_confidence, 0) / predictions.length
      : 0;

  if (loading) {
    return <div className="text-center py-12 text-gray-500">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-10 h-10" />
          <div>
            <h2 className="text-2xl font-bold">التحليلات التنبؤية الذكية</h2>
            <p className="text-blue-100 text-sm">تحليلات مدعومة بالذكاء الاصطناعي لفهم التوجهات الأسرية</p>
          </div>
        </div>
        <p className="text-sm text-blue-100">
          تستخدم هذه التحليلات خوارزميات التعلم الآلي لتحليل البيانات التاريخية والعوامل الاجتماعية
          والاقتصادية للتنبؤ بالأنماط والاتجاهات المستقبلية
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">إجمالي الأسر</p>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalFamilies.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">في جميع المناطق</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">الأسر المعرضة للخطر</p>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-600">{totalAtRisk.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">
            {((totalAtRisk / totalFamilies) * 100).toFixed(1)}% من الإجمالي
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">متوسط معدل الانفصال</p>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{avgSeparationRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">عبر جميع المناطق</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">دقة التنبؤ</p>
            <Brain className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-600">{avgConfidence.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">متوسط الثقة في التنبؤات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {predictions.map((prediction) => (
          <div
            key={prediction.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{prediction.region}</h3>
                  <p className="text-sm text-gray-500">
                    {prediction.total_families.toLocaleString()} أسرة
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 ${getRiskColor(prediction.risk_level)}`}>
                  {getRiskIcon(prediction.risk_level)}
                  <span className="font-bold text-sm">{getRiskLabel(prediction.risk_level)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">معدل الانفصال</p>
                  <p className="text-2xl font-bold text-red-600">{prediction.separation_rate}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">الأسر المعرضة للخطر</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {prediction.at_risk_families}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">دقة التنبؤ</p>
                  <p className="text-sm font-bold text-emerald-600">
                    {prediction.prediction_confidence}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${prediction.prediction_confidence}%` }}
                  ></div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">العوامل المؤثرة</p>
                <div className="space-y-2">
                  {Object.entries(prediction.factors).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">{getFactorLabel(key)}</span>
                        <span className="text-xs font-bold text-gray-900">
                          {(value * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            value >= 0.7
                              ? 'bg-green-600'
                              : value >= 0.5
                              ? 'bg-amber-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${value * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">كيف تعمل التنبؤات الذكية؟</h3>
            <p className="text-sm text-gray-700 mb-3">
              تستخدم خوارزميات التعلم الآلي لتحليل البيانات التاريخية من مصادر متعددة بما في ذلك:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>المؤشرات الاقتصادية والاجتماعية</li>
              <li>مستويات التعليم والتوظيف</li>
              <li>أنماط المخالفات والإحالات</li>
              <li>معدلات الدعم الأسري والمجتمعي</li>
            </ul>
            <p className="text-xs text-gray-600 mt-3">
              تُحدّث هذه التنبؤات بشكل دوري لضمان دقتها وملاءمتها للواقع الحالي
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          إحصائيات من الهيئة العامة للإحصاء
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-r border-gray-200 pr-4">
            <h4 className="text-sm font-bold text-gray-700 mb-3">الإحصائيات السكانية</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">عدد الأسر السعودية</span>
                <span className="text-sm font-bold text-gray-900">4.7 مليون أسرة</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">متوسط حجم الأسرة</span>
                <span className="text-sm font-bold text-gray-900">5.3 أفراد</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">نسبة الأسر النووية</span>
                <span className="text-sm font-bold text-gray-900">72%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">نسبة الأسر الممتدة</span>
                <span className="text-sm font-bold text-gray-900">28%</span>
              </div>
            </div>
          </div>

          <div className="border-r border-gray-200 pr-4">
            <h4 className="text-sm font-bold text-gray-700 mb-3">التعليم والتوظيف</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">معدل الالتحاق بالتعليم</span>
                <span className="text-sm font-bold text-emerald-600">97.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">معدل التوظيف</span>
                <span className="text-sm font-bold text-emerald-600">83.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">نسبة الحاصلين على تعليم جامعي</span>
                <span className="text-sm font-bold text-emerald-600">41.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">معدل محو الأمية</span>
                <span className="text-sm font-bold text-emerald-600">98.7%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">المؤشرات الاجتماعية</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">معدل الزواج (لكل 1000)</span>
                <span className="text-sm font-bold text-blue-600">5.3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">نسبة الأسر تحت خط الفقر</span>
                <span className="text-sm font-bold text-amber-600">5.7%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">الأسر المستفيدة من الدعم</span>
                <span className="text-sm font-bold text-blue-600">1.2 مليون</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">برامج الحماية الاجتماعية</span>
                <span className="text-sm font-bold text-emerald-600">نشطة</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-3">العوامل المؤثرة على استقرار الأسرة</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">العوامل الإيجابية</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• ارتفاع مستوى التعليم (82% معدل التعليم العالي)</li>
                    <li>• تحسن معدلات التوظيف (83.4% معدل التوظيف)</li>
                    <li>• برامج الدعم الحكومي (حساب المواطن، سكني)</li>
                    <li>• التماسك الأسري والقيم الاجتماعية</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">التحديات المحتملة</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• الضغوط الاقتصادية في بعض المناطق</li>
                    <li>• التغيرات الاجتماعية السريعة</li>
                    <li>• محدودية الدعم الأسري في المدن الكبرى</li>
                    <li>• الحاجة لمزيد من برامج الإرشاد الأسري</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          <span>المصدر: الهيئة العامة للإحصاء - المملكة العربية السعودية (2024)</span>
        </div>
      </div>
    </div>
  );
}

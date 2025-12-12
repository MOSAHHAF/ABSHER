import { useState, useEffect } from 'react';
import { supabase, ExternalEntity, IntegrationService, IntegrationStats } from '../lib/supabase';
import { Building2, Activity, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

interface EntityWithServices extends ExternalEntity {
  services: (IntegrationService & { stats?: IntegrationStats })[];
}

export default function ExternalIntegrations() {
  const [entities, setEntities] = useState<EntityWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<EntityWithServices | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: entitiesData } = await supabase
      .from('external_entities')
      .select('*')
      .eq('is_active', true)
      .order('name_ar');

    if (entitiesData) {
      const entitiesWithServices = await Promise.all(
        entitiesData.map(async (entity) => {
          const { data: services } = await supabase
            .from('integration_services')
            .select('*')
            .eq('entity_id', entity.id)
            .eq('is_active', true);

          if (services) {
            const servicesWithStats = await Promise.all(
              services.map(async (service) => {
                const { data: stats } = await supabase
                  .from('integration_stats')
                  .select('*')
                  .eq('service_id', service.id)
                  .maybeSingle();

                return { ...service, stats: stats || undefined };
              })
            );

            return { ...entity, services: servicesWithStats };
          }

          return { ...entity, services: [] };
        })
      );

      setEntities(entitiesWithServices);
    }

    setLoading(false);
  }

  const totalServices = entities.reduce((sum, entity) => sum + entity.services.length, 0);
  const totalRequests = entities.reduce(
    (sum, entity) =>
      sum + entity.services.reduce((s, service) => s + (service.stats?.total_requests || 0), 0),
    0
  );
  const activeEntities = entities.filter((e) => e.is_active).length;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">الجهات المرتبطة</p>
              <p className="text-3xl font-bold text-gray-900">{activeEntities}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي الخدمات</p>
              <p className="text-3xl font-bold text-gray-900">{totalServices}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي الاستعلامات</p>
              <p className="text-3xl font-bold text-gray-900">{totalRequests.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">معدل النجاح</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalRequests > 0
                  ? (
                      (entities.reduce(
                        (sum, entity) =>
                          sum +
                          entity.services.reduce(
                            (s, service) => s + (service.stats?.successful_requests || 0),
                            0
                          ),
                        0
                      ) /
                        totalRequests) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entities.map((entity) => (
            <div
              key={entity.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedEntity(entity)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{entity.name_ar}</h3>
                      <p className="text-xs text-gray-500">{entity.name_en}</p>
                    </div>
                  </div>
                  {entity.is_active && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      نشط
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">{entity.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">عدد الخدمات:</span>
                    <span className="font-semibold text-gray-900">{entity.services.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">إجمالي الاستعلامات:</span>
                    <span className="font-semibold text-gray-900">
                      {entity.services
                        .reduce((sum, s) => sum + (s.stats?.total_requests || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">معدل النجاح:</span>
                    <span className="font-semibold text-green-600">
                      {(() => {
                        const total = entity.services.reduce(
                          (sum, s) => sum + (s.stats?.total_requests || 0),
                          0
                        );
                        const successful = entity.services.reduce(
                          (sum, s) => sum + (s.stats?.successful_requests || 0),
                          0
                        );
                        return total > 0 ? ((successful / total) * 100).toFixed(1) : 0;
                      })()}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEntity && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEntity(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEntity.name_ar}</h2>
                    <p className="text-sm text-gray-500">{selectedEntity.name_en}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedEntity.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                الخدمات المتاحة ({selectedEntity.services.length})
              </h3>

              <div className="space-y-4">
                {selectedEntity.services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-gray-50 rounded-xl p-5 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-gray-900 mb-1">
                          {service.service_name_ar}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">{service.service_name_en}</p>
                        <p className="text-sm text-gray-600">{service.data_type}</p>
                      </div>
                      {service.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          نشط
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          غير نشط
                        </span>
                      )}
                    </div>

                    {service.stats && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">إجمالي الطلبات</p>
                          <p className="text-lg font-bold text-gray-900">
                            {service.stats.total_requests.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">الناجحة</p>
                          <p className="text-lg font-bold text-green-600">
                            {service.stats.successful_requests.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">الفاشلة</p>
                          <p className="text-lg font-bold text-red-600">
                            {service.stats.failed_requests.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">وقت الاستجابة</p>
                          <p className="text-lg font-bold text-blue-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.stats.average_response_time}ms
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">آخر استعلام</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {service.stats.last_request_at
                              ? new Date(service.stats.last_request_at).toLocaleDateString('ar-SA')
                              : '-'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

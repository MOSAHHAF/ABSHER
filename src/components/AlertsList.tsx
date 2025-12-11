import { Alert, GuardianLink } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { Bell, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertsListProps {
  alerts: Alert[];
  guardianLinks: GuardianLink[];
  onUpdate: () => void;
}

export default function AlertsList({ alerts, guardianLinks, onUpdate }: AlertsListProps) {
  function getPriorityIcon(priority: string) {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'medium':
        return <Bell className="w-5 h-5 text-blue-600" />;
      case 'low':
        return <Info className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'urgent':
        return 'border-r-4 border-red-600 bg-red-50';
      case 'high':
        return 'border-r-4 border-amber-600 bg-amber-50';
      case 'medium':
        return 'border-r-4 border-blue-600 bg-blue-50';
      case 'low':
        return 'border-r-4 border-gray-600 bg-gray-50';
      default:
        return 'border-r-4 border-gray-400';
    }
  }

  function getPriorityText(priority: string) {
    switch (priority) {
      case 'urgent': return 'عاجل';
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return priority;
    }
  }

  function getDependentName(profileId: string): string {
    const link = guardianLinks.find(l => l.dependent_id === profileId);
    return link?.dependent?.full_name || 'غير معروف';
  }

  async function markAsRead(alertId: string) {
    await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId);
    onUpdate();
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">لا توجد تنبيهات</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-lg p-5 transition-all ${
            alert.is_read
              ? 'border border-gray-200 bg-white'
              : `${getPriorityColor(alert.priority)} shadow-md`
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {getPriorityIcon(alert.priority)}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                    {!alert.is_read && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">جديد</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">المتأثر:</span> {getDependentName(alert.profile_id)}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  الأولوية: {getPriorityText(alert.priority)}
                </span>
              </div>

              <p className="text-gray-700 mb-3">{alert.message}</p>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    <span className="font-medium">الجهة المصدرة:</span> {alert.issuing_authority}
                  </p>
                  <p className="text-xs">
                    {new Date(alert.created_at!).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!alert.is_read && (
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    وضع علامة كمقروء
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Activity, RefreshCw, Search, Filter, Download, Calendar, MapPin, User } from "lucide-react";
import { WILAYAS } from "../../data/algeriaGeoData";
import * as XLSX from "xlsx";

interface MemberActivitiesManagementSectionProps {
  adminUsername: string;
}

const ACTIVITY_TYPES: Record<string, string> = {
  public_gathering: "تجمع شعبي",
  community_work: "عمل جواري",
  executive_meeting: "لقاء مع مسؤول تنفيذي",
  party_meeting: "اجتماع حزبي",
  electoral_campaign: "حملة انتخابية",
  media_appearance: "ظهور إعلامي",
  citizen_reception: "استقبال المواطنين",
  field_visit: "زيارة ميدانية",
  other: "أخرى",
};

const STATUS_LABELS: Record<string, string> = {
  planned: "مخطط",
  completed: "منجز",
  cancelled: "ملغي",
};

export default function MemberActivitiesManagementSection({ adminUsername }: MemberActivitiesManagementSectionProps) {
  const [filters, setFilters] = useState({
    wilaya: "",
    activityType: "",
    status: "",
  });

  const activities = useQuery(api.memberPoliticalActivities.getAllPoliticalActivitiesForAdmin, {
    adminUsername,
    wilaya: filters.wilaya || undefined,
    activityType: filters.activityType || undefined,
    status: filters.status || undefined,
  });

  const exportData = useQuery(api.memberPoliticalActivities.getAllActivitiesForExport, { adminUsername });

  const handleExport = () => {
    if (!exportData || exportData.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    const data = exportData.map((activity) => ({
      "رقم العضوية": activity.membershipNumber,
      "اسم المنخرط": activity.memberName,
      "نوع المنخرط": activity.memberType,
      "نوع النشاط": ACTIVITY_TYPES[activity.activityType] || activity.activityType,
      "العنوان": activity.title,
      "الوصف": activity.description,
      "التاريخ": new Date(activity.date).toLocaleDateString("ar-DZ"),
      "الوقت": activity.time,
      "المكان": activity.location,
      "الولاية": activity.wilaya,
      "البلدية": activity.baladiya,
      "عدد الحضور": activity.attendeesCount,
      "ملاحظات": activity.notes,
      "الحالة": STATUS_LABELS[activity.status] || activity.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الأنشطة السياسية");
    XLSX.writeFile(wb, `political_activities_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("تم تصدير البيانات بنجاح");
  };

  if (!activities) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-teal-600" />
          <h2 className="text-2xl font-bold text-gray-800">إدارة أنشطة المنخرطين</h2>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
        >
          <Download className="w-5 h-5" />
          تصدير Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-800">تصفية النتائج</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الولاية</label>
            <select
              value={filters.wilaya}
              onChange={(e) => setFilters({ ...filters, wilaya: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 transition-all"
            >
              <option value="">جميع الولايات</option>
              {WILAYAS.map((w) => (
                <option key={w.code} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع النشاط</label>
            <select
              value={filters.activityType}
              onChange={(e) => setFilters({ ...filters, activityType: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 transition-all"
            >
              <option value="">جميع الأنواع</option>
              {Object.entries(ACTIVITY_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 transition-all"
            >
              <option value="">جميع الحالات</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{activities.length}</p>
          <p className="text-sm text-gray-500">إجمالي الأنشطة</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-700">
            {activities.filter((a) => a.status === "completed").length}
          </p>
          <p className="text-sm text-green-600">منجز</p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">
            {activities.filter((a) => a.status === "planned").length}
          </p>
          <p className="text-sm text-yellow-600">مخطط</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-red-700">
            {activities.filter((a) => a.status === "cancelled").length}
          </p>
          <p className="text-sm text-red-600">ملغي</p>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-start text-sm font-semibold text-gray-700">المنخرط</th>
                <th className="px-4 py-3 text-start text-sm font-semibold text-gray-700">النشاط</th>
                <th className="px-4 py-3 text-start text-sm font-semibold text-gray-700">النوع</th>
                <th className="px-4 py-3 text-start text-sm font-semibold text-gray-700">التاريخ</th>
                <th className="px-4 py-3 text-start text-sm font-semibold text-gray-700">المكان</th>
                <th className="px-4 py-3 text-start text-sm font-semibold text-gray-700">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <tr key={activity._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{activity.memberName}</p>
                        <p className="text-xs text-gray-500">{activity.membershipNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-gray-500 truncate max-w-xs">{activity.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {ACTIVITY_TYPES[activity.activityType] || activity.activityType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(activity.date).toLocaleDateString("ar-DZ")}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {activity.wilaya}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === "completed" ? "bg-green-100 text-green-800" :
                      activity.status === "planned" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {STATUS_LABELS[activity.status] || activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {activities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد أنشطة مطابقة للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
}

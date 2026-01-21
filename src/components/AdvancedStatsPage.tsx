import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  BarChart3,
  Download,
  Users,
  MapPin,
  TrendingUp,
  Loader2,
  PieChart,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { WILAYAS } from "../data/algeriaGeoData";

interface AdvancedStatsPageProps {
  adminUsername: string;
}

export default function AdvancedStatsPage({ adminUsername }: AdvancedStatsPageProps) {
  const stats = useQuery(api.memberManagement.getMembersStats, { adminUsername });

  const exportToExcel = () => {
    if (!stats) return;

    const data = [
      { "الإحصائية": "إجمالي المنخرطين", "القيمة": stats.total },
      { "الإحصائية": "المنخرطين النشطين", "القيمة": stats.active },
      { "الإحصائية": "المنخرطين غير النشطين", "القيمة": stats.inactive },
      { "الإحصائية": "المنخرطين المعلقين", "القيمة": stats.suspended },
      { "الإحصائية": "الذكور", "القيمة": stats.male },
      { "الإحصائية": "الإناث", "القيمة": stats.female },
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الإحصائيات");
    XLSX.writeFile(wb, `statistics_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("تم تصدير الإحصائيات بنجاح");
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">الإحصائيات المتقدمة</h2>
        </div>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
        >
          <Download className="w-5 h-5" />
          تصدير Excel
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">إجمالي المنخرطين</p>
              <p className="text-4xl font-bold mt-2">{stats.total}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">المنخرطين النشطين</p>
              <p className="text-4xl font-bold mt-2">{stats.active}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">غير النشطين</p>
              <p className="text-4xl font-bold mt-2">{stats.inactive}</p>
            </div>
            <Users className="w-12 h-12 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">المعلقين</p>
              <p className="text-4xl font-bold mt-2">{stats.suspended}</p>
            </div>
            <Users className="w-12 h-12 text-red-200" />
          </div>
        </div>
      </div>

      {/* Gender Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            توزيع المنخرطين حسب الجنس
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{stats.male}</p>
              <p className="text-blue-600">ذكور</p>
              <p className="text-sm text-blue-500 mt-1">
                {stats.total > 0 ? ((stats.male / stats.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="bg-pink-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-pink-700">{stats.female}</p>
              <p className="text-pink-600">إناث</p>
              <p className="text-sm text-pink-500 mt-1">
                {stats.total > 0 ? ((stats.female / stats.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            توزيع المنخرطين حسب الولاية
          </h3>
          {stats.byWilaya && stats.byWilaya.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {stats.byWilaya.slice(0, 12).map((item: { wilaya: string; count: number }) => (
                <div key={item.wilaya} className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-gray-800">{item.count}</p>
                  <p className="text-xs text-gray-600 truncate">{item.wilaya}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">لا توجد بيانات</p>
          )}
        </div>
      </div>
    </div>
  );
}

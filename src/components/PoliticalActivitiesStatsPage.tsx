import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  BarChart3,
  Users,
  Calendar,
  MapPin,
  TrendingUp,
  Award,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";

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

const MEMBER_TYPES: Record<string, string> = {
  militant: "مناضل",
  municipal_elected: "منتخب بلدي",
  wilaya_elected: "منتخب ولائي",
  apn_elected: "نائب برلماني",
  senate_elected: "عضو مجلس الأمة",
};

const STATUS_LABELS = {
  planned: { label: "مخطط", color: "bg-blue-100 text-blue-700", icon: Clock },
  completed: { label: "منجز", color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "ملغى", color: "bg-red-100 text-red-700", icon: XCircle },
};

interface PoliticalActivitiesStatsPageProps {
  adminUsername: string;
}

export default function PoliticalActivitiesStatsPage({ adminUsername }: PoliticalActivitiesStatsPageProps) {
  const stats = useQuery(api.memberPoliticalActivities.getPoliticalActivitiesStats, { adminUsername });
  const exportData = useQuery(api.memberPoliticalActivities.getAllActivitiesForExport, { adminUsername });
  const clearAllActivities = useMutation(api.memberPoliticalActivities.clearAllPoliticalActivities);
  
  const [filterWilaya, setFilterWilaya] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const activities = useQuery(api.memberPoliticalActivities.getAllPoliticalActivitiesForAdmin, {
    adminUsername,
    wilaya: filterWilaya || undefined,
    activityType: filterType || undefined,
    status: filterStatus || undefined,
  });

  // تصدير البيانات إلى Excel
  const handleExportToExcel = async () => {
    if (!exportData || exportData.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    setIsExporting(true);
    try {
      // تحويل البيانات للعرض بالعربية
      const dataForExport = exportData.map((item, index) => ({
        "الرقم": index + 1,
        "رقم العضوية": item.membershipNumber,
        "اسم المنخرط": item.memberName,
        "صفة المنخرط": MEMBER_TYPES[item.memberType] || item.memberType,
        "نوع النشاط": ACTIVITY_TYPES[item.activityType] || item.activityType,
        "عنوان النشاط": item.title,
        "الوصف": item.description,
        "التاريخ": new Date(item.date).toLocaleDateString("ar-DZ"),
        "الوقت": item.time,
        "المكان": item.location,
        "الولاية": item.wilaya,
        "البلدية": item.baladiya,
        "عدد الحضور": item.attendeesCount,
        "الملاحظات": item.notes,
        "الحالة": STATUS_LABELS[item.status as keyof typeof STATUS_LABELS]?.label || item.status,
        "تاريخ الإنشاء": new Date(item.createdAt).toLocaleDateString("ar-DZ"),
      }));

      // إنشاء ملف Excel
      const worksheet = XLSX.utils.json_to_sheet(dataForExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "الأنشطة السياسية");

      // تعديل عرض الأعمدة
      const colWidths = [
        { wch: 8 },  // الرقم
        { wch: 15 }, // رقم العضوية
        { wch: 25 }, // اسم المنخرط
        { wch: 15 }, // صفة المنخرط
        { wch: 20 }, // نوع النشاط
        { wch: 30 }, // عنوان النشاط
        { wch: 40 }, // الوصف
        { wch: 12 }, // التاريخ
        { wch: 10 }, // الوقت
        { wch: 25 }, // المكان
        { wch: 15 }, // الولاية
        { wch: 15 }, // البلدية
        { wch: 12 }, // عدد الحضور
        { wch: 30 }, // الملاحظات
        { wch: 10 }, // الحالة
        { wch: 15 }, // تاريخ الإنشاء
      ];
      worksheet["!cols"] = colWidths;

      // تحميل الملف
      const fileName = `الأنشطة_السياسية_${new Date().toLocaleDateString("ar-DZ").replace(/\//g, "-")}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success(`تم تصدير ${exportData.length} نشاط بنجاح`);
    } catch (error) {
      toast.error("حدث خطأ أثناء التصدير");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  // تفريغ قاعدة البيانات
  const handleClearDatabase = async () => {
    setIsClearing(true);
    try {
      const result = await clearAllActivities({ adminUsername });
      toast.success(`تم حذف ${result.deletedCount} نشاط بنجاح`);
      setShowClearConfirm(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء التفريغ";
      toast.error(message);
    } finally {
      setIsClearing(false);
    }
  };

  if (!stats) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const sortedWilayas = [...stats.byWilaya]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const sortedTypes = [...stats.byType]
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* العنوان وأزرار الإجراءات */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-green-600" />
          إحصائيات الأنشطة السياسية للمنخرطين
        </h2>
        
        <div className="flex gap-3">
          {/* زر التصدير */}
          <button
            onClick={handleExportToExcel}
            disabled={isExporting || !exportData || exportData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <FileSpreadsheet className="w-5 h-5" />
            )}
            تصدير Excel
          </button>
          
          {/* زر التفريغ */}
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={!stats || stats.totalActivities === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Trash2 className="w-5 h-5" />
            تفريغ القاعدة
          </button>
        </div>
      </div>

      {/* نافذة تأكيد التفريغ */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">تأكيد التفريغ</h3>
            </div>
            
            <p className="text-gray-600 mb-2">
              هل أنت متأكد من رغبتك في حذف جميع الأنشطة السياسية؟
            </p>
            <p className="text-red-600 font-semibold mb-6">
              ⚠️ سيتم حذف {stats.totalActivities} نشاط نهائياً ولا يمكن استرجاعها!
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleClearDatabase}
                disabled={isClearing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isClearing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    تأكيد الحذف
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* البطاقات الإحصائية الرئيسية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <Calendar className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-4xl font-bold">{stats.totalActivities}</p>
          <p className="text-blue-100">إجمالي الأنشطة</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <CheckCircle className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-4xl font-bold">{stats.completedActivities}</p>
          <p className="text-green-100">أنشطة منجزة</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <Users className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-4xl font-bold">{stats.totalAttendees.toLocaleString()}</p>
          <p className="text-purple-100">إجمالي الحضور</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <Award className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-4xl font-bold">{stats.activeMembersCount}</p>
          <p className="text-orange-100">منخرط نشط</p>
        </motion.div>
      </div>

      {/* إحصائيات الفترة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 text-start">
            <TrendingUp className="w-5 h-5 text-green-600" />
            أنشطة الفترة الأخيرة
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{stats.thisWeekActivities}</p>
              <p className="text-green-600 text-sm">هذا الأسبوع</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{stats.thisMonthActivities}</p>
              <p className="text-blue-600 text-sm">هذا الشهر</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-start">حالة الأنشطة</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">{stats.completedActivities}</p>
              <p className="text-green-600 text-xs">منجز</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700">{stats.plannedActivities}</p>
              <p className="text-blue-600 text-xs">مخطط</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-2">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-700">{stats.cancelledActivities}</p>
              <p className="text-red-600 text-xs">ملغى</p>
            </div>
          </div>
        </div>
      </div>

      {/* إحصائيات حسب النوع ونوع المنخرط */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-start">الأنشطة حسب النوع</h3>
          <div className="space-y-3">
            {sortedTypes.map((item) => {
              const percentage = stats.totalActivities > 0 ? (item.count / stats.totalActivities) * 100 : 0;
              return (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{ACTIVITY_TYPES[item.type] || item.type}</span>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-start">الأنشطة حسب صفة المنخرط</h3>
          <div className="space-y-3">
            {stats.byMemberType.map((item) => {
              const percentage = stats.totalActivities > 0 ? (item.count / stats.totalActivities) * 100 : 0;
              return (
                <div key={item.memberType}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{MEMBER_TYPES[item.memberType] || item.memberType}</span>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* أكثر المنخرطين نشاطاً */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 text-start">
          <Award className="w-5 h-5 text-yellow-500" />
          أكثر المنخرطين نشاطاً
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.topActiveMembers.slice(0, 5).map((member, index) => (
            <div
              key={member.membershipNumber}
              className={`rounded-xl p-4 text-center ${
                index === 0 ? "bg-gradient-to-br from-yellow-100 to-yellow-200" :
                index === 1 ? "bg-gradient-to-br from-gray-100 to-gray-200" :
                index === 2 ? "bg-gradient-to-br from-orange-100 to-orange-200" :
                "bg-gray-50"
              }`}
            >
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                index === 0 ? "bg-yellow-500 text-white" :
                index === 1 ? "bg-gray-400 text-white" :
                index === 2 ? "bg-orange-500 text-white" :
                "bg-gray-300 text-gray-700"
              }`}>
                <span className="text-lg font-bold">{index + 1}</span>
              </div>
              <p className="font-bold text-gray-800 text-sm">{member.name}</p>
              <p className="text-2xl font-bold text-green-600">{member.count}</p>
              <p className="text-xs text-gray-500">نشاط</p>
            </div>
          ))}
        </div>
      </div>

      {/* أكثر الولايات نشاطاً */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 text-start">
          <MapPin className="w-5 h-5 text-green-600" />
          أكثر الولايات نشاطاً
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {sortedWilayas.map((item) => (
            <div
              key={item.wilaya}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center"
            >
              <p className="text-sm text-gray-600 mb-1">{item.wilaya}</p>
              <p className="text-2xl font-bold text-green-700">{item.count}</p>
              <p className="text-xs text-green-600">نشاط</p>
            </div>
          ))}
        </div>
      </div>

      {/* قائمة الأنشطة مع الفلاتر */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            قائمة الأنشطة
          </h3>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-green-500"
            >
              <option value="">جميع الأنواع</option>
              {Object.entries(ACTIVITY_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-green-500"
            >
              <option value="">جميع الحالات</option>
              <option value="planned">مخطط</option>
              <option value="completed">منجز</option>
              <option value="cancelled">ملغى</option>
            </select>
          </div>
        </div>

        {activities && activities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-b from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">المنخرط</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">النوع</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">العنوان</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">التاريخ</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">المكان</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">الحضور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activities.slice(0, 20).map((activity: any) => {
                  const StatusIcon = STATUS_LABELS[activity.status as keyof typeof STATUS_LABELS]?.icon || Clock;
                  return (
                    <tr key={activity._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{activity.memberName}</p>
                          <p className="text-xs text-gray-500">
                            {MEMBER_TYPES[activity.memberType] || "مناضل"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          {ACTIVITY_TYPES[activity.activityType]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{activity.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(activity.date).toLocaleDateString("ar-DZ")}
                        <br />
                        <span className="text-xs">{activity.time}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {activity.wilaya}
                        {activity.baladiya && ` - ${activity.baladiya}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${STATUS_LABELS[activity.status as keyof typeof STATUS_LABELS]?.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {STATUS_LABELS[activity.status as keyof typeof STATUS_LABELS]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {activity.attendeesCount || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            لا توجد أنشطة مطابقة للفلاتر المحددة
          </div>
        )}
      </div>
    </div>
  );
}

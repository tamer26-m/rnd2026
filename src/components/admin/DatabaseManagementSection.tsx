import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Database, Trash2, RefreshCw, AlertTriangle, Download, FileSpreadsheet } from "lucide-react";

interface DatabaseManagementSectionProps {
  adminUsername: string;
}

export default function DatabaseManagementSection({ adminUsername }: DatabaseManagementSectionProps) {
  const stats = useQuery(api.memberManagement.getMembersStats, { adminUsername });
  const clearMembers = useMutation(api.databaseManagement.clearAllMembers);
  const clearActivities = useMutation(api.memberPoliticalActivities.clearAllPoliticalActivities);

  const [clearing, setClearing] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const handleClearMembers = async () => {
    if (confirmText !== "تأكيد الحذف") {
      toast.error("يرجى كتابة 'تأكيد الحذف' للمتابعة");
      return;
    }

    try {
      setClearing("members");
      const result = await clearMembers({ adminUsername });
      toast.success(`تم حذف ${result.deletedCount} منخرط بنجاح`);
      setConfirmText("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في تفريغ قاعدة البيانات";
      toast.error(message);
    } finally {
      setClearing(null);
    }
  };

  const handleClearActivities = async () => {
    if (confirmText !== "تأكيد الحذف") {
      toast.error("يرجى كتابة 'تأكيد الحذف' للمتابعة");
      return;
    }

    try {
      setClearing("activities");
      const result = await clearActivities({ adminUsername });
      toast.success(`تم حذف ${result.deletedCount} نشاط بنجاح`);
      setConfirmText("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في تفريغ الأنشطة";
      toast.error(message);
    } finally {
      setClearing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-8 h-8 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-800">إدارة قاعدة البيانات</h2>
      </div>

      {/* Warning */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800 mb-1">تحذير هام!</h4>
            <p className="text-sm text-red-700">
              عمليات الحذف في هذه الصفحة لا يمكن التراجع عنها. تأكد من أخذ نسخة احتياطية قبل المتابعة.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-sm text-gray-500">إجمالي المنخرطين</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.total || 0}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-sm text-gray-500">المنخرطين النشطين</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats?.active || 0}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-sm text-gray-500">المنخرطين المعلقين</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats?.suspended || 0}</p>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-green-600" />
          تصدير البيانات
        </h3>
        <p className="text-gray-600 mb-4">
          قم بتصدير بيانات المنخرطين قبل إجراء أي عملية حذف للاحتفاظ بنسخة احتياطية.
        </p>
        <button
          onClick={() => window.location.href = "#export"}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
        >
          <Download className="w-5 h-5" />
          الذهاب لصفحة التصدير
        </button>
      </div>

      {/* Clear Members */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-600" />
          تفريغ قاعدة بيانات المنخرطين
        </h3>
        <p className="text-gray-600 mb-4">
          سيتم حذف جميع بيانات المنخرطين بما في ذلك الصور والوثائق والسير الذاتية.
          هذه العملية لا يمكن التراجع عنها.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="اكتب 'تأكيد الحذف' للمتابعة"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 transition-all"
          />
          <button
            onClick={handleClearMembers}
            disabled={clearing === "members" || confirmText !== "تأكيد الحذف"}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {clearing === "members" ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
            حذف جميع المنخرطين
          </button>
        </div>
      </div>

      {/* Clear Activities */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-orange-600" />
          تفريغ أنشطة المنخرطين السياسية
        </h3>
        <p className="text-gray-600 mb-4">
          سيتم حذف جميع الأنشطة السياسية المسجلة من قبل المنخرطين.
          هذه العملية لا يمكن التراجع عنها.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="اكتب 'تأكيد الحذف' للمتابعة"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 transition-all"
          />
          <button
            onClick={handleClearActivities}
            disabled={clearing === "activities" || confirmText !== "تأكيد الحذف"}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all disabled:opacity-50"
          >
            {clearing === "activities" ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
            حذف جميع الأنشطة
          </button>
        </div>
      </div>
    </div>
  );
}

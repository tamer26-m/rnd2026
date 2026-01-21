import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import {
  FileText,
  Search,
  Download,
  Eye,
  Loader2,
  Filter,
  RefreshCw,
  Users,
  BarChart3,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  File,
  DownloadCloud,
} from "lucide-react";

interface CVManagementSectionProps {
  adminUsername: string;
}

export default function CVManagementSection({ adminUsername }: CVManagementSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [wilayaFilter, setWilayaFilter] = useState("");
  const [selectedCV, setSelectedCV] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const cvs = useQuery(api.memberCV.listAllCVs, {
    adminUsername,
    wilayaFilter: wilayaFilter || undefined,
    searchQuery: searchQuery || undefined,
  });

  const stats = useQuery(api.memberCV.getCVStats, { adminUsername });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " بايت";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " كيلوبايت";
    return (bytes / (1024 * 1024)).toFixed(2) + " ميجابايت";
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownloadAll = async () => {
    if (!cvs || cvs.length === 0) {
      toast.error("لا توجد سير ذاتية للتحميل");
      return;
    }

    toast.info("جاري تحضير الملفات للتحميل...");

    // تحميل كل ملف على حدة
    for (const cv of cvs) {
      if (cv.url) {
        const link = document.createElement("a");
        link.href = cv.url;
        link.download = `${cv.membershipNumber}_${cv.memberName.replace(/\s+/g, "_")}.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // انتظار قليل بين كل تحميل
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    toast.success(`تم بدء تحميل ${cvs.length} سيرة ذاتية`);
  };

  const handleExportList = () => {
    if (!cvs || cvs.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    const csvContent = [
      ["رقم العضوية", "الاسم", "الولاية", "البلدية", "الهاتف", "البريد", "اسم الملف", "الحجم", "تاريخ الرفع"].join(","),
      ...cvs.map(cv => [
        cv.membershipNumber,
        cv.memberName,
        cv.wilaya,
        cv.baladiya,
        cv.phone,
        cv.email || "",
        cv.fileName,
        formatFileSize(cv.fileSize),
        formatDate(cv.uploadedAt),
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cvs_list_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("تم تصدير قائمة السير الذاتية بنجاح");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-7 h-7 text-red-600" />
          إدارة السير الذاتية
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportList}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            تصدير القائمة
          </button>
          <button
            onClick={handleDownloadAll}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <DownloadCloud className="w-5 h-5" />
            تحميل الكل
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-700">{stats.totalCVs}</p>
            <p className="text-red-600 text-sm">إجمالي السير الذاتية</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-700">{stats.totalMembers}</p>
            <p className="text-blue-600 text-sm">إجمالي المنخرطين</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{stats.cvPercentage}%</p>
            <p className="text-green-600 text-sm">نسبة التغطية</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-purple-700">{stats.wilayaStats.length}</p>
            <p className="text-purple-600 text-sm">ولايات مغطاة</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو رقم العضوية..."
              className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
            />
          </div>
          <input
            type="text"
            value={wilayaFilter}
            onChange={(e) => setWilayaFilter(e.target.value)}
            placeholder="تصفية حسب الولاية..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
          />
          <button
            onClick={() => {
              setSearchQuery("");
              setWilayaFilter("");
            }}
            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            إعادة تعيين
          </button>
        </div>
      </div>

      {/* CVs Table */}
      {cvs === undefined ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      ) : cvs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">لا توجد سير ذاتية مطابقة للبحث</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-4 text-start">
            عرض {cvs.length} سيرة ذاتية
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full">
              <thead className="bg-gradient-to-b from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">المنخرط</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">رقم العضوية</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">الولاية</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">اسم الملف</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">الحجم</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">تاريخ الرفع</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cvs.map((cv: any) => (
                  <tr key={cv._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="text-start">
                        <p className="font-medium text-gray-900">{cv.memberName}</p>
                        <p className="text-sm text-gray-500" dir="ltr">{cv.memberNameLatin}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 font-mono">{cv.membershipNumber}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{cv.wilaya}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-red-500" />
                        <span className="truncate max-w-[150px]">{cv.fileName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{formatFileSize(cv.fileSize)}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{formatDate(cv.uploadedAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedCV(cv);
                            setShowPreviewModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="معاينة"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={cv.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="تحميل"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedCV && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">معاينة السيرة الذاتية</h3>
              <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-start">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">الاسم</p>
                  <p className="font-medium">{selectedCV.memberName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">رقم العضوية</p>
                  <p className="font-medium font-mono">{selectedCV.membershipNumber}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">الولاية</p>
                  <p className="font-medium">{selectedCV.wilaya}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">الهاتف</p>
                  <p className="font-medium" dir="ltr">{selectedCV.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedCV.url}
                className="w-full h-full min-h-[500px]"
                title="معاينة السيرة الذاتية"
              />
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-4">
              <a
                href={selectedCV.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                تحميل السيرة الذاتية
              </a>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wilaya Stats */}
      {stats && stats.wilayaStats.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-600" />
            توزيع السير الذاتية حسب الولاية
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stats.wilayaStats.slice(0, 12).map((stat: any) => (
              <div key={stat.wilaya} className="bg-white rounded-lg p-3 text-center shadow-sm">
                <p className="text-lg font-bold text-red-600">{stat.count}</p>
                <p className="text-xs text-gray-600 truncate">{stat.wilaya}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

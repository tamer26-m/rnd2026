import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import * as XLSX from "xlsx";
import { 
  Download, 
  Loader2, 
  Filter, 
  FileSpreadsheet,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Table,
  FileDown
} from "lucide-react";
import { toast } from "sonner";

// دوال مساعدة للتسميات
const getEducationLabel = (level: string | undefined): string => {
  const labels: Record<string, string> = {
    none: "بدون",
    primary: "ابتدائي",
    secondary: "ثانوي",
    university: "جامعي",
    postgraduate: "دراسات عليا",
  };
  return labels[level || ""] || "غير محدد";
};

const getProfessionLabel = (profession: string | undefined): string => {
  const labels: Record<string, string> = {
    unemployed: "بطال",
    student: "طالب",
    employee: "موظف",
    freelancer: "حر",
    farmer: "فلاح",
    other: "أخرى",
  };
  return labels[profession || ""] || "غير محدد";
};

const getMemberTypeLabel = (type: string | undefined): string => {
  const labels: Record<string, string> = {
    militant: "مناضل",
    municipal_elected: "منتخب بلدي",
    wilaya_elected: "منتخب ولائي",
    apn_elected: "منتخب م.ش.و",
    senate_elected: "منتخب م.أ",
  };
  return labels[type || ""] || "مناضل";
};

const getStatusLabel = (status: string | undefined): string => {
  const labels: Record<string, string> = {
    active: "نشط",
    inactive: "غير نشط",
    suspended: "موقوف",
  };
  return labels[status || ""] || "غير محدد";
};

const getGenderLabel = (gender: string | undefined): string => {
  const labels: Record<string, string> = {
    male: "ذكر",
    female: "أنثى",
  };
  return labels[gender || ""] || "غير محدد";
};

const getStructuralPositionLabel = (position: string | undefined): string => {
  const labels: Record<string, string> = {
    militant: "مناضل",
    municipal_bureau_member: "عضو مكتب بلدي",
    wilaya_bureau_member: "عضو مكتب ولائي",
    national_bureau_member: "عضو مكتب وطني",
  };
  return labels[position || ""] || "مناضل";
};

const getAdministrativePositionLabel = (position: string | undefined): string => {
  const labels: Record<string, string> = {
    militant: "مناضل",
    municipal_secretary: "أمين بلدي",
    wilaya_secretary: "أمين ولائي",
  };
  return labels[position || ""] || "مناضل";
};

const MEMBER_TYPES = [
  { value: "", label: "جميع الفئات" },
  { value: "militant", label: "مناضل" },
  { value: "municipal_elected", label: "منتخب بلدي" },
  { value: "wilaya_elected", label: "منتخب ولائي" },
  { value: "apn_elected", label: "منتخب مجلس شعبي وطني" },
  { value: "senate_elected", label: "منتخب مجلس الأمة" },
];

const STATUS_OPTIONS = [
  { value: "", label: "جميع الحالات" },
  { value: "active", label: "نشط" },
  { value: "inactive", label: "غير نشط" },
  { value: "suspended", label: "موقوف" },
];

const EDUCATION_LEVELS = [
  { value: "", label: "جميع المستويات" },
  { value: "none", label: "بدون" },
  { value: "primary", label: "ابتدائي" },
  { value: "secondary", label: "ثانوي" },
  { value: "university", label: "جامعي" },
  { value: "postgraduate", label: "دراسات عليا" },
];

const PROFESSIONS = [
  { value: "", label: "جميع المهن" },
  { value: "unemployed", label: "بطال" },
  { value: "student", label: "طالب" },
  { value: "employee", label: "موظف" },
  { value: "freelancer", label: "حر" },
  { value: "farmer", label: "فلاح" },
  { value: "other", label: "أخرى" },
];

const GENDER_OPTIONS = [
  { value: "", label: "الجنسين" },
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
];

interface ExportMembersSectionProps {
  adminUsername: string;
}

export default function ExportMembersSection({ 
  adminUsername 
}: ExportMembersSectionProps) {
  const [selectedWilaya, setSelectedWilaya] = useState<string>("");
  const [selectedBaladiya, setSelectedBaladiya] = useState<string>("");
  const [selectedMemberType, setSelectedMemberType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedEducation, setSelectedEducation] = useState<string>("");
  const [selectedProfession, setSelectedProfession] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  // الحصول على المنخرطين حسب الفلاتر
  const members = useQuery(api.memberExport.getMembersForExport, {
    wilaya: selectedWilaya || undefined,
    baladiya: selectedBaladiya || undefined,
    memberType: selectedMemberType || undefined,
    status: selectedStatus || undefined,
    educationLevel: selectedEducation || undefined,
    profession: selectedProfession || undefined,
    gender: selectedGender || undefined,
  });

  // الحصول على إحصائيات التصدير
  const stats = useQuery(api.memberExport.getExportStats, {
    wilaya: selectedWilaya || undefined,
    baladiya: selectedBaladiya || undefined,
    memberType: selectedMemberType || undefined,
    status: selectedStatus || undefined,
  });

  // الحصول على الولايات المتاحة
  const availableWilayas = useQuery(api.memberCards.getAvailableWilayas);
  
  // الحصول على البلديات حسب الولاية المختارة
  const availableBaladiyas = useQuery(api.memberCards.getAvailableBaladiyas, {
    wilaya: selectedWilaya || undefined,
  });

  // تنسيق التاريخ
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-DZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // إعادة تعيين البلدية عند تغيير الولاية
  const handleWilayaChange = (wilaya: string) => {
    setSelectedWilaya(wilaya);
    setSelectedBaladiya("");
  };

  // إعادة تعيين جميع الفلاتر
  const resetFilters = () => {
    setSelectedWilaya("");
    setSelectedBaladiya("");
    setSelectedMemberType("");
    setSelectedStatus("");
    setSelectedEducation("");
    setSelectedProfession("");
    setSelectedGender("");
  };

  // إنشاء اسم الملف
  const generateFileName = () => {
    let fileName = "قائمة_المنخرطين";
    if (selectedWilaya) {
      fileName += `_${selectedWilaya}`;
    }
    if (selectedBaladiya) {
      fileName += `_${selectedBaladiya}`;
    }
    if (selectedMemberType) {
      fileName += `_${getMemberTypeLabel(selectedMemberType)}`;
    }
    if (selectedStatus) {
      fileName += `_${getStatusLabel(selectedStatus)}`;
    }
    const date = new Date().toLocaleDateString('ar-DZ').replace(/\//g, '-');
    fileName += `_${date}.xlsx`;
    return fileName;
  };

  // تصدير البيانات إلى Excel
  const handleExport = async () => {
    if (!members || members.length === 0) {
      toast.error("لا يوجد منخرطين للتصدير");
      return;
    }

    setIsExporting(true);

    try {
      // تحضير البيانات للتصدير
      const exportData = members.map((member, index) => ({
        "الرقم": index + 1,
        "رقم العضوية": member.membershipNumber,
        "اللقب": member.lastName,
        "الاسم": member.firstName,
        "اللقب (لاتيني)": member.lastNameLatin,
        "الاسم (لاتيني)": member.firstNameLatin,
        "رقم التعريف الوطني": member.nin,
        "الجنس": getGenderLabel(member.gender),
        "تاريخ الميلاد": formatDate(member.birthDate),
        "مكان الميلاد": member.birthPlace || "",
        "الهاتف": member.phone,
        "البريد الإلكتروني": member.email || "",
        "الولاية": member.wilaya,
        "البلدية": member.baladiya,
        "العنوان": member.address,
        "المستوى الدراسي": getEducationLabel(member.educationLevel),
        "المهنة": getProfessionLabel(member.profession),
        "تفاصيل المهنة": member.professionDetails || "",
        "الصفة السياسية": getMemberTypeLabel(member.memberType),
        "المسؤولية الهيكلية": getStructuralPositionLabel(member.structuralPosition),
        "المسؤولية الإدارية": getAdministrativePositionLabel(member.administrativePosition),
        "عضو المجلس الوطني": member.isNationalCouncilMember ? "نعم" : "لا",
        "رقم البطاقة الانتخابية": member.electoralCardNumber || "",
        "تاريخ إصدار البطاقة الانتخابية": formatDate(member.electoralCardIssueDate),
        "تاريخ الانخراط": formatDate(member.joinDate),
        "سنة الانخراط الأولى": member.firstJoinYear || "",
        "الحالة": getStatusLabel(member.status),
        "سبب التوقيف": member.suspensionReason || "",
        "تاريخ التوقيف": formatDate(member.suspensionDate),
      }));

      // إنشاء ورقة العمل
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // تعيين عرض الأعمدة
      const columnWidths = [
        { wch: 6 },   // الرقم
        { wch: 15 },  // رقم العضوية
        { wch: 15 },  // اللقب
        { wch: 15 },  // الاسم
        { wch: 15 },  // اللقب لاتيني
        { wch: 15 },  // الاسم لاتيني
        { wch: 20 },  // رقم التعريف
        { wch: 8 },   // الجنس
        { wch: 12 },  // تاريخ الميلاد
        { wch: 15 },  // مكان الميلاد
        { wch: 15 },  // الهاتف
        { wch: 25 },  // البريد
        { wch: 15 },  // الولاية
        { wch: 15 },  // الدائرة
        { wch: 15 },  // البلدية
        { wch: 30 },  // العنوان
        { wch: 15 },  // المستوى الدراسي
        { wch: 12 },  // المهنة
        { wch: 20 },  // تفاصيل المهنة
        { wch: 15 },  // الصفة السياسية
        { wch: 18 },  // المسؤولية الهيكلية
        { wch: 18 },  // المسؤولية الإدارية
        { wch: 15 },  // عضو المجلس الوطني
        { wch: 18 },  // رقم البطاقة الانتخابية
        { wch: 20 },  // تاريخ إصدار البطاقة
        { wch: 12 },  // تاريخ الانخراط
        { wch: 15 },  // سنة الانخراط الأولى
        { wch: 10 },  // الحالة
        { wch: 25 },  // سبب التوقيف
        { wch: 12 },  // تاريخ التوقيف
      ];
      worksheet["!cols"] = columnWidths;

      // إنشاء المصنف
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "المنخرطين");

      // إضافة ورقة الإحصائيات
      if (stats) {
        const statsData = [
          { "البيان": "إجمالي المنخرطين", "العدد": stats.total },
          { "البيان": "النشطين", "العدد": stats.active },
          { "البيان": "غير النشطين", "العدد": stats.inactive },
          { "البيان": "الموقوفين", "العدد": stats.suspended },
          { "البيان": "الذكور", "العدد": stats.male },
          { "البيان": "الإناث", "العدد": stats.female },
        ];
        const statsSheet = XLSX.utils.json_to_sheet(statsData);
        statsSheet["!cols"] = [{ wch: 20 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(workbook, statsSheet, "الإحصائيات");
      }

      // تنزيل الملف
      XLSX.writeFile(workbook, generateFileName());
      
      toast.success(`تم تصدير ${members.length} منخرط بنجاح! 🎉`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error("حدث خطأ أثناء تصدير البيانات");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* العنوان */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
          <FileSpreadsheet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-start">تصدير بيانات المنخرطين</h2>
          <p className="text-gray-600 text-start">تصدير قائمة المنخرطين إلى ملف Excel</p>
        </div>
      </div>

      {/* فلاتر البحث */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 text-start">
            <Filter className="w-5 h-5 text-green-600" />
            خيارات التصفية
          </h3>
          <button
            onClick={resetFilters}
            className="text-sm text-green-600 hover:text-green-800 font-medium"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* اختيار الولاية */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
              <MapPin className="w-4 h-4 inline ms-1" />
              الولاية
            </label>
            <select
              value={selectedWilaya}
              onChange={(e) => handleWilayaChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            >
              <option value="">جميع الولايات</option>
              {(availableWilayas || []).map((wilaya) => (
                <option key={wilaya} value={wilaya}>{wilaya}</option>
              ))}
            </select>
          </div>

          {/* اختيار البلدية */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
              <MapPin className="w-4 h-4 inline ms-1" />
              البلدية
            </label>
            <select
              value={selectedBaladiya}
              onChange={(e) => setSelectedBaladiya(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!selectedWilaya}
            >
              <option value="">جميع البلديات</option>
              {(availableBaladiyas || []).map((baladiya) => (
                <option key={baladiya} value={baladiya}>{baladiya}</option>
              ))}
            </select>
          </div>

          {/* اختيار الفئة */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
              <Users className="w-4 h-4 inline ms-1" />
              الصفة السياسية
            </label>
            <select
              value={selectedMemberType}
              onChange={(e) => setSelectedMemberType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            >
              {MEMBER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* اختيار الحالة */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
              <CheckCircle className="w-4 h-4 inline ms-1" />
              الحالة
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          {/* اختيار المستوى الدراسي */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
              المستوى الدراسي
            </label>
            <select
              value={selectedEducation}
              onChange={(e) => setSelectedEducation(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            >
              {EDUCATION_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          {/* اختيار المهنة */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
              المهنة
            </label>
            <select
              value={selectedProfession}
              onChange={(e) => setSelectedProfession(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            >
              {PROFESSIONS.map((profession) => (
                <option key={profession.value} value={profession.value}>{profession.label}</option>
              ))}
            </select>
          </div>

          {/* اختيار الجنس */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
              الجنس
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            >
              {GENDER_OPTIONS.map((gender) => (
                <option key={gender.value} value={gender.value}>{gender.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* إحصائيات */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 opacity-80" />
              <div>
                <p className="text-blue-100 text-xs">الإجمالي</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 opacity-80" />
              <div>
                <p className="text-green-100 text-xs">نشط</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2">
              <XCircle className="w-6 h-6 opacity-80" />
              <div>
                <p className="text-gray-100 text-xs">غير نشط</p>
                <p className="text-xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 opacity-80" />
              <div>
                <p className="text-red-100 text-xs">موقوف</p>
                <p className="text-xl font-bold">{stats.suspended}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2">
              <UserCheck className="w-6 h-6 opacity-80" />
              <div>
                <p className="text-indigo-100 text-xs">ذكور</p>
                <p className="text-xl font-bold">{stats.male}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2">
              <UserX className="w-6 h-6 opacity-80" />
              <div>
                <p className="text-pink-100 text-xs">إناث</p>
                <p className="text-xl font-bold">{stats.female}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* معلومات التصدير */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Table className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-start">
            <h4 className="font-bold text-green-800 mb-1">معلومات التصدير</h4>
            <p className="text-green-700 text-sm">
              سيتم تصدير جميع بيانات المنخرطين المحددين إلى ملف Excel يحتوي على:
            </p>
            <ul className="text-green-700 text-sm mt-2 space-y-1">
              <li>• البيانات الشخصية (الاسم، تاريخ الميلاد، الجنس)</li>
              <li>• بيانات الاتصال (الهاتف، البريد الإلكتروني، العنوان)</li>
              <li>• البيانات الجغرافية (الولاية، الدائرة، البلدية)</li>
              <li>• البيانات المهنية والتعليمية</li>
              <li>• البيانات السياسية والتنظيمية</li>
              <li>• ورقة إحصائيات منفصلة</li>
            </ul>
          </div>
        </div>
      </div>

      {/* زر التصدير */}
      <div className="mb-6">
        <button
          onClick={handleExport}
          disabled={isExporting || !members || members.length === 0}
          className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>جاري التصدير...</span>
            </>
          ) : (
            <>
              <FileDown className="w-6 h-6" />
              <span>تصدير إلى Excel ({members?.length || 0} منخرط)</span>
            </>
          )}
        </button>
      </div>

      {/* معاينة البيانات */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 text-start">
          <Table className="w-5 h-5 text-green-600" />
          معاينة البيانات ({members?.length || 0})
        </h3>

        {members === undefined ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا يوجد منخرطين بالمعايير المحددة</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-start font-bold text-gray-700">#</th>
                  <th className="px-3 py-2 text-start font-bold text-gray-700">رقم العضوية</th>
                  <th className="px-3 py-2 text-start font-bold text-gray-700">الاسم واللقب</th>
                  <th className="px-3 py-2 text-start font-bold text-gray-700">الهاتف</th>
                  <th className="px-3 py-2 text-start font-bold text-gray-700">الولاية</th>
                  <th className="px-3 py-2 text-start font-bold text-gray-700">البلدية</th>
                  <th className="px-3 py-2 text-start font-bold text-gray-700">الصفة</th>
                  <th className="px-3 py-2 text-start font-bold text-gray-700">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.slice(0, 20).map((member, index) => (
                  <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded" dir="ltr">
                        {member.membershipNumber}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {member.lastName} {member.firstName}
                    </td>
                    <td className="px-3 py-2 text-gray-700" dir="ltr">{member.phone}</td>
                    <td className="px-3 py-2 text-gray-700">{member.wilaya}</td>
                    <td className="px-3 py-2 text-gray-700">{member.baladiya}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {getMemberTypeLabel(member.memberType)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        member.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : member.status === 'suspended'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(member.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {members.length > 20 && (
              <div className="text-center py-4 text-gray-500 bg-gray-50">
                ... و {members.length - 20} منخرط آخر
              </div>
            )}
          </div>
        )}
      </div>

      {/* ملاحظات */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-start">
          <AlertTriangle className="w-5 h-5" />
          ملاحظات هامة
        </h4>
        <ul className="text-amber-700 text-sm space-y-1 text-start">
          <li>• يتم تصدير جميع البيانات باستثناء كلمات المرور</li>
          <li>• الملف يحتوي على ورقتين: بيانات المنخرطين والإحصائيات</li>
          <li>• يمكنك تصفية البيانات قبل التصدير باستخدام الفلاتر أعلاه</li>
          <li>• تأكد من حفظ الملف في مكان آمن لحماية البيانات الشخصية</li>
        </ul>
      </div>
    </div>
  );
}

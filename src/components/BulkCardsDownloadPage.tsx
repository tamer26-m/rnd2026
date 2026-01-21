import { useState, useRef, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { 
  Download, 
  ArrowLeft, 
  User, 
  Loader2, 
  Filter, 
  FileText,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  Printer,
  GraduationCap,
  Briefcase
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

type Page = "home" | "activities" | "members" | "dashboard" | "gallery" | "register" | "login" | "memberCard" | "bulkCards";

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

// قائمة الولايات الجزائرية
const WILAYAS = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار",
  "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر",
  "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة",
  "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة", "وهران", "البيض",
  "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي",
  "خنشلة", "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت",
  "غرداية", "غليزان", "تيميمون", "برج باجي مختار", "أولاد جلال", "بني عباس",
  "عين صالح", "عين قزام", "تقرت", "جانت", "المغير", "المنيعة"
];

const MEMBER_TYPES = [
  { value: "", label: "جميع الفئات" },
  { value: "militant", label: "مناضل" },
  { value: "municipal_elected", label: "منتخب بلدي" },
  { value: "wilaya_elected", label: "منتخب ولائي" },
  { value: "apn_elected", label: "منتخب مجلس شعبي وطني" },
  { value: "senate_elected", label: "منتخب مجلس الأمة" },
];

export default function BulkCardsDownloadPage({ 
  setCurrentPage 
}: { 
  setCurrentPage: (page: Page) => void 
}) {
  const [selectedWilaya, setSelectedWilaya] = useState<string>("");
  const [selectedMemberType, setSelectedMemberType] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentDownloadingMember, setCurrentDownloadingMember] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  // الحصول على إعدادات خلفية البطاقة
  const cardSettings = useQuery(api.adminSettings.getMemberCardSettings);
  
  // الحصول على المنخرطين حسب الفلاتر
  const members = useQuery(api.memberCards.getMembersForCards, {
    wilaya: selectedWilaya || undefined,
    memberType: selectedMemberType || undefined,
  });

  // الحصول على إحصائيات التنزيل
  const stats = useQuery(api.memberCards.getDownloadStats, {
    wilaya: selectedWilaya || undefined,
    memberType: selectedMemberType || undefined,
  });

  // الحصول على الولايات المتاحة
  const availableWilayas = useQuery(api.memberCards.getAvailableWilayas);

  const backgroundUrl = cardSettings?.backgroundUrl || "https://polished-pony-114.convex.cloud/api/storage/e81fb05c-0127-4644-9210-f0a3a017d5fe";

  // تنسيق التاريخ
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "---";
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-DZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // إنشاء بيانات QR Code
  const generateQRData = (member: any) => {
    return `الأمين العام الدكتور منذر بودن
━━━━━━━━━━━━━━━━━━━━
رقم العضوية: ${member.membershipNumber}
الاسم: ${member.lastName} ${member.firstName}
${member.lastNameLatin && member.firstNameLatin ? `Nom: ${member.lastNameLatin} ${member.firstNameLatin}` : ''}
الولاية: ${member.wilaya}
تاريخ الميلاد: ${formatDate(member.birthDate)}
تاريخ الانخراط: ${formatDate(member.joinDate)}
المستوى: ${getEducationLabel(member.educationLevel)}
المهنة: ${getProfessionLabel(member.profession)}
━━━━━━━━━━━━━━━━━━━━
RND - التجمع الوطني الديمقراطي`;
  };

  // تنزيل بطاقة واحدة
  const downloadSingleCard = async (member: any): Promise<Blob | null> => {
    return new Promise((resolve) => {
      // إنشاء عنصر مؤقت للبطاقة
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      tempDiv.innerHTML = `
        <div id="temp-card" style="
          width: 340px;
          height: 720px;
          border-radius: 12px;
          overflow: hidden;
          background-image: url(${backgroundUrl});
          background-size: cover;
          background-position: center;
          position: relative;
          font-family: 'Tajawal', sans-serif;
        ">
          <div style="height: 100%; padding: 16px; display: flex; flex-direction: column; direction: rtl;">
            <div style="height: 112px;"></div>
            
            <div style="display: flex; justify-content: center; margin-bottom: 12px;">
              <div style="
                width: 128px;
                height: 160px;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                border: 4px solid white;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
              ">
                ${member.profilePhotoUrl 
                  ? `<img src="${member.profilePhotoUrl}" style="width: 100%; height: 100%; object-fit: cover;" crossorigin="anonymous" />`
                  : `<div style="width: 100%; height: 100%; background: #f3f4f6; display: flex; align-items: center; justify-content: center;">
                      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>`
                }
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 12px;">
              <p style="
                font-family: monospace;
                font-weight: bold;
                font-size: 24px;
                color: white;
                letter-spacing: 4px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
              " dir="ltr">${member.membershipNumber}</p>
            </div>

            <div style="
              flex: 1;
              background: rgba(255,255,255,0.85);
              border-radius: 8px;
              padding: 16px;
              backdrop-filter: blur(4px);
            ">
              <div style="text-align: center; border-bottom: 1px solid #d1d5db; padding-bottom: 12px; margin-bottom: 12px;">
                <span style="font-size: 12px; color: #6b7280; display: block; margin-bottom: 4px;">الاسم واللقب</span>
                <span style="font-weight: bold; font-size: 20px; color: #111827;">${member.lastName} ${member.firstName}</span>
              </div>

              <div style="text-align: center; border-bottom: 1px solid #d1d5db; padding-bottom: 12px; margin-bottom: 12px;">
                <span style="font-size: 12px; color: #6b7280; display: block; margin-bottom: 4px;">تاريخ الميلاد</span>
                <span style="font-weight: 600; font-size: 18px; color: #111827;">${formatDate(member.birthDate)}</span>
              </div>

              <div style="text-align: center; border-bottom: 1px solid #d1d5db; padding-bottom: 12px; margin-bottom: 12px;">
                <span style="font-size: 12px; color: #6b7280; display: block; margin-bottom: 4px;">الولاية</span>
                <span style="font-weight: 600; font-size: 18px; color: #111827;">${member.wilaya}</span>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="text-align: center; background: linear-gradient(to bottom right, #eff6ff, #dbeafe); border-radius: 8px; padding: 8px;">
                  <span style="font-size: 11px; color: #1d4ed8; display: block; margin-bottom: 4px;">المستوى الدراسي</span>
                  <span style="font-weight: 600; font-size: 13px; color: #1e40af;">${getEducationLabel(member.educationLevel)}</span>
                </div>
                <div style="text-align: center; background: linear-gradient(to bottom right, #f0fdf4, #dcfce7); border-radius: 8px; padding: 8px;">
                  <span style="font-size: 11px; color: #15803d; display: block; margin-bottom: 4px;">المهنة</span>
                  <span style="font-weight: 600; font-size: 13px; color: #166534;">${getProfessionLabel(member.profession)}</span>
                </div>
              </div>
            </div>

            <div style="height: 16px;"></div>
          </div>
        </div>
      `;

      // إضافة QR Code
      const qrContainer = document.createElement('div');
      qrContainer.style.position = 'absolute';
      qrContainer.style.bottom = '12px';
      qrContainer.style.left = '12px';
      qrContainer.style.background = 'white';
      qrContainer.style.padding = '4px';
      qrContainer.style.borderRadius = '8px';
      qrContainer.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      
      const tempCard = tempDiv.querySelector('#temp-card');
      if (tempCard) {
        tempCard.appendChild(qrContainer);
      }

      // انتظار تحميل الصور
      setTimeout(async () => {
        try {
          const cardElement = tempDiv.querySelector('#temp-card') as HTMLElement;
          if (!cardElement) {
            resolve(null);
            return;
          }

          const canvas = await html2canvas(cardElement, {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false,
          });

          canvas.toBlob((blob) => {
            document.body.removeChild(tempDiv);
            resolve(blob);
          }, 'image/png', 1.0);
        } catch (error) {
          console.error('Error generating card:', error);
          document.body.removeChild(tempDiv);
          resolve(null);
        }
      }, 500);
    });
  };

  // تنزيل جميع البطاقات في ملف PDF واحد
  const handleBulkDownload = async () => {
    if (!members || members.length === 0) {
      toast.error("لا يوجد منخرطين للتنزيل");
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // إنشاء ملف PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const cardWidth = 85.6; // عرض البطاقة بالمليمتر
      const cardHeight = 180; // ارتفاع البطاقة بالمليمتر
      const margin = 10;
      const cardsPerPage = 1; // بطاقة واحدة في كل صفحة

      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        setCurrentDownloadingMember(`${member.lastName} ${member.firstName}`);
        setDownloadProgress(Math.round(((i + 1) / members.length) * 100));

        // إنشاء صورة البطاقة
        const cardBlob = await downloadSingleCard(member);
        
        if (cardBlob) {
          const imgData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(cardBlob);
          });

          if (i > 0) {
            pdf.addPage();
          }

          // حساب موقع البطاقة في منتصف الصفحة
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const x = (pageWidth - cardWidth) / 2;
          const y = (pageHeight - cardHeight) / 2;

          pdf.addImage(imgData, 'PNG', x, y, cardWidth, cardHeight);
          
          // إضافة رقم العضوية أسفل البطاقة
          pdf.setFontSize(10);
          pdf.setTextColor(100);
          pdf.text(`رقم العضوية: ${member.membershipNumber}`, pageWidth / 2, y + cardHeight + 10, { align: 'center' });
        }
      }

      // تحديد اسم الملف
      let fileName = "بطاقات_العضوية";
      if (selectedWilaya) {
        fileName += `_${selectedWilaya}`;
      }
      if (selectedMemberType) {
        fileName += `_${getMemberTypeLabel(selectedMemberType)}`;
      }
      fileName += ".pdf";

      pdf.save(fileName);
      toast.success(`تم تنزيل ${members.length} بطاقة بنجاح! 🎉`);
    } catch (error) {
      console.error('Error downloading cards:', error);
      toast.error("حدث خطأ أثناء تنزيل البطاقات");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
      setCurrentDownloadingMember("");
    }
  };

  // تنزيل بطاقة منخرط واحد
  const handleSingleDownload = async (member: any) => {
    setIsDownloading(true);
    setCurrentDownloadingMember(`${member.lastName} ${member.firstName}`);

    try {
      const cardBlob = await downloadSingleCard(member);
      
      if (cardBlob) {
        const imgData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(cardBlob);
        });

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [85.6, 180],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 180);
        pdf.save(`بطاقة_العضوية_${member.membershipNumber}.pdf`);
        toast.success("تم تنزيل البطاقة بنجاح!");
      }
    } catch (error) {
      console.error('Error downloading card:', error);
      toast.error("حدث خطأ أثناء تنزيل البطاقة");
    } finally {
      setIsDownloading(false);
      setCurrentDownloadingMember("");
    }
  };

  return (
    <div className="min-h-[80vh] px-4 py-12" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          {/* العنوان */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 text-start">تنزيل بطاقات العضوية</h2>
              <p className="text-gray-600 mt-1 text-start">تنزيل بطاقات العضوية بصيغة PDF</p>
            </div>
          </div>

          {/* فلاتر البحث */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 text-start">
              <Filter className="w-5 h-5 text-green-600" />
              خيارات التصفية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* اختيار الولاية */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
                  <MapPin className="w-4 h-4 inline ms-1" />
                  الولاية
                </label>
                <select
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                >
                  <option value="">جميع الولايات</option>
                  {(availableWilayas || WILAYAS).map((wilaya) => (
                    <option key={wilaya} value={wilaya}>{wilaya}</option>
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
            </div>
          </div>

          {/* إحصائيات */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3">
                  <Users className="w-10 h-10 opacity-80" />
                  <div>
                    <p className="text-blue-100 text-sm">إجمالي المنخرطين</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-10 h-10 opacity-80" />
                  <div>
                    <p className="text-green-100 text-sm">مع صورة شخصية</p>
                    <p className="text-3xl font-bold">{stats.withPhoto}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-10 h-10 opacity-80" />
                  <div>
                    <p className="text-amber-100 text-sm">بدون صورة</p>
                    <p className="text-3xl font-bold">{stats.withoutPhoto}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* زر التنزيل الجماعي */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleBulkDownload}
              disabled={isDownloading || !members || members.length === 0}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>جاري التنزيل... {downloadProgress}%</span>
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  <span>تنزيل جميع البطاقات ({members?.length || 0})</span>
                </>
              )}
            </button>
          </div>

          {/* شريط التقدم */}
          {isDownloading && (
            <div className="mb-8">
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className="text-center text-gray-600 mt-2">
                جاري تنزيل بطاقة: {currentDownloadingMember}
              </p>
            </div>
          )}

          {/* قائمة المنخرطين */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 text-start">
              <FileText className="w-5 h-5 text-green-600" />
              قائمة المنخرطين ({members?.length || 0})
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-start text-sm font-bold text-gray-700">الصورة</th>
                      <th className="px-4 py-3 text-start text-sm font-bold text-gray-700">الاسم واللقب</th>
                      <th className="px-4 py-3 text-start text-sm font-bold text-gray-700">رقم العضوية</th>
                      <th className="px-4 py-3 text-start text-sm font-bold text-gray-700">الولاية</th>
                      <th className="px-4 py-3 text-start text-sm font-bold text-gray-700">الصفة</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">تنزيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                            {member.profilePhotoUrl ? (
                              <img 
                                src={member.profilePhotoUrl} 
                                alt={member.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{member.lastName} {member.firstName}</p>
                          <p className="text-sm text-gray-500">{member.lastNameLatin} {member.firstNameLatin}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded" dir="ltr">
                            {member.membershipNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{member.wilaya}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {getMemberTypeLabel(member.memberType)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleSingleDownload(member)}
                            disabled={isDownloading}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="تنزيل البطاقة"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ملاحظات */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-start">
              <AlertCircle className="w-5 h-5" />
              ملاحظات هامة
            </h4>
            <ul className="text-amber-700 text-sm space-y-1 text-start">
              <li>• يتم تنزيل البطاقات بصيغة PDF عالية الجودة</li>
              <li>• كل بطاقة في صفحة منفصلة لسهولة الطباعة</li>
              <li>• يمكنك تصفية المنخرطين حسب الولاية أو الصفة السياسية</li>
              <li>• البطاقات بدون صورة ستظهر برمز افتراضي</li>
              <li>• قد يستغرق التنزيل بعض الوقت حسب عدد البطاقات</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Download, 
  User, 
  Loader2, 
  Filter, 
  FileText,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  Image,
  FileImage,
  Archive
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
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

const MEMBER_TYPES = [
  { value: "", label: "جميع الفئات" },
  { value: "militant", label: "مناضل" },
  { value: "municipal_elected", label: "منتخب بلدي" },
  { value: "wilaya_elected", label: "منتخب ولائي" },
  { value: "apn_elected", label: "منتخب مجلس شعبي وطني" },
  { value: "senate_elected", label: "منتخب مجلس الأمة" },
];

type DownloadFormat = "pdf" | "png" | "jpg";

interface BulkCardsDownloadSectionProps {
  adminUsername: string;
}

export default function BulkCardsDownloadSection({ 
  adminUsername 
}: BulkCardsDownloadSectionProps) {
  const [selectedWilaya, setSelectedWilaya] = useState<string>("");
  const [selectedBaladiya, setSelectedBaladiya] = useState<string>("");
  const [selectedMemberType, setSelectedMemberType] = useState<string>("");
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("pdf");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentDownloadingMember, setCurrentDownloadingMember] = useState("");

  // الحصول على إعدادات خلفية البطاقة
  const cardSettings = useQuery(api.adminSettings.getMemberCardSettings);
  
  // الحصول على المنخرطين حسب الفلاتر
  const members = useQuery(api.memberCards.getMembersForCards, {
    wilaya: selectedWilaya || undefined,
    baladiya: selectedBaladiya || undefined,
    memberType: selectedMemberType || undefined,
  });

  // الحصول على إحصائيات التنزيل
  const stats = useQuery(api.memberCards.getDownloadStats, {
    wilaya: selectedWilaya || undefined,
    baladiya: selectedBaladiya || undefined,
    memberType: selectedMemberType || undefined,
  });

  // الحصول على الولايات المتاحة
  const availableWilayas = useQuery(api.memberCards.getAvailableWilayas);
  
  // الحصول على البلديات حسب الولاية المختارة
  const availableBaladiyas = useQuery(api.memberCards.getAvailableBaladiyas, {
    wilaya: selectedWilaya || undefined,
  });

  const backgroundUrl = cardSettings?.backgroundUrl || "https://polished-pony-114.convex.cloud/api/storage/e81fb05c-0127-4644-9210-f0a3a017d5fe";

  // تنسيق التاريخ
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "---";
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-DZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // إعادة تعيين البلدية عند تغيير الولاية
  const handleWilayaChange = (wilaya: string) => {
    setSelectedWilaya(wilaya);
    setSelectedBaladiya("");
  };

  // تنزيل بطاقة واحدة
  const downloadSingleCard = async (member: any): Promise<Blob | null> => {
    return new Promise((resolve) => {
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

          const format = downloadFormat === "jpg" ? "image/jpeg" : "image/png";
          const quality = downloadFormat === "jpg" ? 0.95 : 1.0;

          canvas.toBlob((blob) => {
            document.body.removeChild(tempDiv);
            resolve(blob);
          }, format, quality);
        } catch (error) {
          console.error('Error generating card:', error);
          document.body.removeChild(tempDiv);
          resolve(null);
        }
      }, 500);
    });
  };

  // إنشاء اسم الملف
  const generateFileName = (extension: string) => {
    let fileName = "بطاقات_العضوية";
    if (selectedWilaya) {
      fileName += `_${selectedWilaya}`;
    }
    if (selectedBaladiya) {
      fileName += `_${selectedBaladiya}`;
    }
    if (selectedMemberType) {
      fileName += `_${getMemberTypeLabel(selectedMemberType)}`;
    }
    fileName += `.${extension}`;
    return fileName;
  };

  // تنزيل جميع البطاقات في ملف PDF واحد
  const handleBulkDownloadPDF = async () => {
    if (!members || members.length === 0) {
      toast.error("لا يوجد منخرطين للتنزيل");
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const cardWidth = 85.6;
      const cardHeight = 180;

      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        setCurrentDownloadingMember(`${member.lastName} ${member.firstName}`);
        setDownloadProgress(Math.round(((i + 1) / members.length) * 100));

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

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const x = (pageWidth - cardWidth) / 2;
          const y = (pageHeight - cardHeight) / 2;

          pdf.addImage(imgData, 'PNG', x, y, cardWidth, cardHeight);
          
          pdf.setFontSize(10);
          pdf.setTextColor(100);
          pdf.text(`${member.membershipNumber} :رقم العضوية`, pageWidth / 2, y + cardHeight + 10, { align: 'center' });
        }
      }

      pdf.save(generateFileName("pdf"));
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

  // تنزيل جميع البطاقات كصور في ملف ZIP
  const handleBulkDownloadImages = async () => {
    if (!members || members.length === 0) {
      toast.error("لا يوجد منخرطين للتنزيل");
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const zip = new JSZip();
      const extension = downloadFormat === "jpg" ? "jpg" : "png";

      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        setCurrentDownloadingMember(`${member.lastName} ${member.firstName}`);
        setDownloadProgress(Math.round(((i + 1) / members.length) * 100));

        const cardBlob = await downloadSingleCard(member);
        
        if (cardBlob) {
          const fileName = `بطاقة_${member.membershipNumber}_${member.lastName}_${member.firstName}.${extension}`;
          zip.file(fileName, cardBlob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFileName("zip");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

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

  // تنزيل البطاقات حسب الصيغة المختارة
  const handleBulkDownload = async () => {
    if (downloadFormat === "pdf") {
      await handleBulkDownloadPDF();
    } else {
      await handleBulkDownloadImages();
    }
  };

  // تنزيل بطاقة منخرط واحد
  const handleSingleDownload = async (member: any) => {
    setIsDownloading(true);
    setCurrentDownloadingMember(`${member.lastName} ${member.firstName}`);

    try {
      const cardBlob = await downloadSingleCard(member);
      
      if (cardBlob) {
        if (downloadFormat === "pdf") {
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
        } else {
          const extension = downloadFormat === "jpg" ? "jpg" : "png";
          const url = URL.createObjectURL(cardBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `بطاقة_العضوية_${member.membershipNumber}.${extension}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* العنوان */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-start">تنزيل بطاقات العضوية</h2>
          <p className="text-gray-600 text-start">تنزيل بطاقات العضوية بصيغة PDF أو صور</p>
        </div>
      </div>

      {/* فلاتر البحث */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 text-start">
          <Filter className="w-5 h-5 text-purple-600" />
          خيارات التصفية
        </h3>
        
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!selectedWilaya}
            >
              <option value="">جميع البلديات</option>
              {(availableBaladiyas || []).map((baladiya) => (
                <option key={baladiya} value={baladiya}>{baladiya}</option>
              ))}
            </select>
            {!selectedWilaya && (
              <p className="text-xs text-gray-500 mt-1 text-start">اختر الولاية أولاً</p>
            )}
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            >
              {MEMBER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* اختيار صيغة التنزيل */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
              <FileImage className="w-4 h-4 inline ms-1" />
              صيغة التنزيل
            </label>
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value as DownloadFormat)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            >
              <option value="pdf">PDF (ملف واحد)</option>
              <option value="png">PNG (صور عالية الجودة)</option>
              <option value="jpg">JPG (صور مضغوطة)</option>
            </select>
          </div>
        </div>
      </div>

      {/* معلومات صيغة التنزيل */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          {downloadFormat === "pdf" ? (
            <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          ) : downloadFormat === "png" ? (
            <Image className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          ) : (
            <FileImage className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="text-start">
            <h4 className="font-bold text-blue-800 mb-1">
              {downloadFormat === "pdf" && "صيغة PDF"}
              {downloadFormat === "png" && "صيغة PNG"}
              {downloadFormat === "jpg" && "صيغة JPG"}
            </h4>
            <p className="text-blue-700 text-sm">
              {downloadFormat === "pdf" && "جميع البطاقات في ملف PDF واحد - مثالي للطباعة"}
              {downloadFormat === "png" && "صور عالية الجودة بدون ضغط - مثالية للاستخدام الرقمي (ملف ZIP)"}
              {downloadFormat === "jpg" && "صور مضغوطة بحجم أصغر - مثالية للمشاركة (ملف ZIP)"}
            </p>
          </div>
        </div>
      </div>

      {/* إحصائيات */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-blue-100 text-sm">إجمالي المنخرطين</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-green-100 text-sm">مع صورة شخصية</p>
                <p className="text-2xl font-bold">{stats.withPhoto}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-amber-100 text-sm">بدون صورة</p>
                <p className="text-2xl font-bold">{stats.withoutPhoto}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* زر التنزيل الجماعي */}
      <div className="mb-6">
        <button
          onClick={handleBulkDownload}
          disabled={isDownloading || !members || members.length === 0}
          className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>جاري التنزيل... {downloadProgress}%</span>
            </>
          ) : (
            <>
              {downloadFormat === "pdf" ? (
                <FileText className="w-6 h-6" />
              ) : (
                <Archive className="w-6 h-6" />
              )}
              <span>
                تنزيل جميع البطاقات ({members?.length || 0}) 
                {downloadFormat === "pdf" ? " - PDF" : downloadFormat === "png" ? " - PNG" : " - JPG"}
              </span>
            </>
          )}
        </button>
      </div>

      {/* شريط التقدم */}
      {isDownloading && (
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <p className="text-center text-gray-600 mt-2">
            جاري تنزيل بطاقة: {currentDownloadingMember}
          </p>
        </div>
      )}

      {/* قائمة المنخرطين */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 text-start">
          <FileText className="w-5 h-5 text-purple-600" />
          قائمة المنخرطين ({members?.length || 0})
        </h3>

        {members === undefined ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا يوجد منخرطين بالمعايير المحددة</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-bold text-gray-700">الصورة</th>
                  <th className="px-4 py-3 text-start text-sm font-bold text-gray-700">الاسم واللقب</th>
                  <th className="px-4 py-3 text-start text-sm font-bold text-gray-700">رقم العضوية</th>
                  <th className="px-4 py-3 text-start text-sm font-bold text-gray-700">الولاية</th>
                  <th className="px-4 py-3 text-start text-sm font-bold text-gray-700">البلدية</th>
                  <th className="px-4 py-3 text-start text-sm font-bold text-gray-700">الصفة</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">تنزيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                        {member.profilePhotoUrl ? (
                          <img 
                            src={member.profilePhotoUrl} 
                            alt={member.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-sm">{member.lastName} {member.firstName}</p>
                      <p className="text-xs text-gray-500">{member.lastNameLatin} {member.firstNameLatin}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded" dir="ltr">
                        {member.membershipNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{member.wilaya}</td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{member.baladiya}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {getMemberTypeLabel(member.memberType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleSingleDownload(member)}
                        disabled={isDownloading}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
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
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-start">
          <AlertCircle className="w-5 h-5" />
          ملاحظات هامة
        </h4>
        <ul className="text-amber-700 text-sm space-y-1 text-start">
          <li>• <strong>PDF:</strong> جميع البطاقات في ملف واحد - مثالي للطباعة</li>
          <li>• <strong>PNG:</strong> صور عالية الجودة بدون ضغط - مثالية للاستخدام الرقمي</li>
          <li>• <strong>JPG:</strong> صور مضغوطة بحجم أصغر - مثالية للمشاركة</li>
          <li>• يمكنك تصفية المنخرطين حسب الولاية والبلدية والصفة السياسية</li>
          <li>• البطاقات بدون صورة ستظهر برمز افتراضي</li>
          <li>• قد يستغرق التنزيل بعض الوقت حسب عدد البطاقات</li>
        </ul>
      </div>
    </div>
  );
}

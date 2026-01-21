import { motion } from "framer-motion";
import { Download, ArrowLeft, User, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type Page = "home" | "activities" | "members" | "dashboard" | "gallery" | "register" | "login" | "memberCard";



export default function MemberCardPage({ setCurrentPage }: { setCurrentPage: (page: Page) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // الحصول على إعدادات خلفية البطاقة
  const cardSettings = useQuery(api.adminSettings.getMemberCardSettings);
  
  // الحصول على بيانات المنخرط من sessionStorage
  const currentMemberData = typeof window !== 'undefined' ? sessionStorage.getItem("currentMember") : null;
  const currentMember = currentMemberData ? JSON.parse(currentMemberData) : null;

  if (!currentMember) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">يرجى تسجيل الدخول أولاً</p>
          <button
            onClick={() => setCurrentPage("login")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    
    try {
      // انتظار تحميل الصور
      const images = cardRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      // تحويل البطاقة إلى صورة
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // جودة عالية
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      // إنشاء ملف PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // حساب أبعاد PDF (بطاقة طولية)
      const cardWidth = 85.6; // عرض البطاقة بالمليمتر (حجم بطاقة الائتمان)
      const cardHeight = 180; // ارتفاع البطاقة بالمليمتر (طولية) - زيادة الارتفاع
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [cardWidth, cardHeight],
      });

      // إضافة الصورة إلى PDF
      pdf.addImage(imgData, 'PNG', 0, 0, cardWidth, cardHeight);

      // تحميل الملف
      const fileName = `بطاقة_العضوية_${currentMember.membershipNumber}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('خطأ في تحميل البطاقة:', error);
      alert('حدث خطأ أثناء تحميل البطاقة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsDownloading(false);
    }
  };

  // تنسيق التاريخ
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-DZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // الحصول على رابط الخلفية
  const backgroundUrl = cardSettings?.backgroundUrl || "https://polished-pony-114.convex.cloud/api/storage/e81fb05c-0127-4644-9210-f0a3a017d5fe";

  // إنشاء بيانات QR Code مع جملة الأمين العام
  const qrData = `الأمين العام الدكتور منذر بودن
━━━━━━━━━━━━━━━━━━━━
رقم العضوية: ${currentMember.membershipNumber}
الاسم: ${currentMember.lastName} ${currentMember.firstName}
${currentMember.lastNameLatin && currentMember.firstNameLatin ? `Nom: ${currentMember.lastNameLatin} ${currentMember.firstNameLatin}` : ''}
الولاية: ${currentMember.wilaya}
تاريخ الميلاد: ${currentMember.birthDate ? formatDate(currentMember.birthDate) : '---'}
سنة أول انخراط: ${currentMember.firstJoinYear || '---'}
━━━━━━━━━━━━━━━━━━━━
RND - التجمع الوطني الديمقراطي`;

  return (
    <div className="min-h-[80vh] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900">بطاقة العضوية</h2>
              <p className="text-gray-600 mt-1">معاينة وتحميل بطاقة العضوية</p>
            </div>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  تحميل PDF
                </>
              )}
            </button>
          </div>

          {/* بطاقة العضوية - التصميم الطولي */}
          <div className="flex justify-center">
            <div 
              ref={cardRef}
              className="relative w-[340px] h-[720px] rounded-xl overflow-hidden shadow-2xl"
              style={{
                backgroundImage: `url(${backgroundUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* محتوى البطاقة */}
              <div className="relative h-full p-4 flex flex-col" dir="rtl">
                
                {/* مساحة فارغة للشعار في الأعلى */}
                <div className="h-28"></div>

                {/* الصورة الشخصية */}
                <div className="flex justify-center mb-3">
                  <div className="w-32 h-40 bg-white rounded-lg overflow-hidden shadow-xl border-4 border-white">
                    {currentMember.profilePhotoUrl ? (
                      <img
                        src={currentMember.profilePhotoUrl}
                        alt="الصورة الشخصية"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <User className="w-14 h-14 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* رقم العضوية تحت الصورة مباشرة - باللون الأبيض */}
                <div className="text-center mb-3">
                  <p className="font-mono font-bold text-2xl text-white tracking-widest drop-shadow-lg" dir="ltr">
                    {currentMember.membershipNumber}
                  </p>
                </div>

                {/* المعلومات */}
                <div className="flex-1 space-y-3 text-gray-800 bg-white/85 rounded-lg p-4 backdrop-blur-sm">
                  {/* الاسم واللقب */}
                  <div className="text-center border-b border-gray-300 pb-3">
                    <span className="text-xs text-gray-600 block mb-1">الاسم واللقب</span>
                    <span className="font-bold text-xl text-gray-900">
                      {currentMember.lastName} {currentMember.firstName}
                    </span>
                  </div>

                  {/* تاريخ الميلاد */}
                  <div className="text-center border-b border-gray-300 pb-3">
                    <span className="text-xs text-gray-600 block mb-1">تاريخ الميلاد</span>
                    <span className="font-semibold text-lg text-gray-900">
                      {currentMember.birthDate ? formatDate(currentMember.birthDate) : '---'}
                    </span>
                  </div>

                  {/* الولاية */}
                  <div className="text-center border-b border-gray-300 pb-3">
                    <span className="text-xs text-gray-600 block mb-1">الولاية</span>
                    <span className="font-semibold text-lg text-gray-900">
                      {currentMember.wilaya}
                    </span>
                  </div>

                  {/* سنة أول انخراط */}
                  <div className="text-center">
                    <span className="text-xs text-gray-600 block mb-1">سنة أول انخراط</span>
                    <span className="font-semibold text-lg text-gray-900">
                      {currentMember.firstJoinYear || '---'}
                    </span>
                  </div>

                </div>

                {/* كود QR في أسفل اليسار */}
                <div className="absolute bottom-3 left-3">
                  <div className="bg-white p-1 rounded-lg shadow-lg">
                    <QRCodeSVG
                      value={qrData}
                      size={55}
                      level="M"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                </div>

                {/* مساحة فارغة في الأسفل */}
                <div className="h-4"></div>
              </div>
            </div>
          </div>

          {/* ملاحظات */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>هذه البطاقة صالحة للاستخدام الرسمي فقط</p>
            <p>يرجى الاحتفاظ بها في مكان آمن</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

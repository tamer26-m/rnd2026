import { useState, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Download, ArrowLeft, Loader2, FileText, User, Image as ImageIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

type Page = 
  | "home" 
  | "activities" 
  | "members" 
  | "dashboard" 
  | "gallery" 
  | "register" 
  | "login" 
  | "recoverMembership" 
  | "updateProfile" 
  | "updatePhoto" 
  | "memberCard" 
  | "stats" 
  | "secretaryGeneral" 
  | "nationalBureau" 
  | "adminLogin"
  | "adminDashboard"
  | "myPoliticalActivities"
  | "secretaryGeneralEN"
  | "quickRegister"
  | "subscriptionReceipt";

interface SubscriptionReceiptPageProps {
  setCurrentPage: (page: Page) => void;
}

// أنواع الاشتراكات
const SUBSCRIPTION_TYPES = {
  type_1: { amount: 1000, label: "الاشتراك 01", description: "ألف دينار جزائري" },
  type_2: { amount: 3000, label: "الاشتراك 02", description: "ثلاثة آلاف دينار جزائري" },
  type_3: { amount: 10000, label: "الاشتراك 03", description: "عشرة آلاف دينار جزائري" },
  type_4: { amount: 200000, label: "الاشتراك 04", description: "مائتي ألف دينار جزائري" },
};

export default function SubscriptionReceiptPage({ setCurrentPage }: SubscriptionReceiptPageProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState<"pdf" | "jpeg" | null>(null);

  // الحصول على بيانات المنخرط من sessionStorage
  const currentMemberData = typeof window !== 'undefined' ? sessionStorage.getItem("currentMember") : null;
  const currentMember = currentMemberData ? JSON.parse(currentMemberData) : null;

  // الحصول على إعدادات خلفية البطاقة (للشعار)
  const cardSettings = useQuery(api.adminSettings.getMemberCardSettings);

  if (!currentMember) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]" dir="rtl">
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

  if (!currentMember.subscriptionType) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]" dir="rtl">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">لم يتم تحديد نوع الاشتراك بعد</p>
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  // تنسيق التاريخ
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-DZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // الحصول على معلومات الاشتراك
  const subscriptionInfo = SUBSCRIPTION_TYPES[currentMember.subscriptionType as keyof typeof SUBSCRIPTION_TYPES];
  const subscriptionYear = currentMember.subscriptionYear || new Date().getFullYear();

  // إنشاء بيانات QR Code
  const qrData = `الأمين العام الدكتور منذر بودن
━━━━━━━━━━━━━━━━━━━━
رقم العضوية: ${currentMember.membershipNumber}
الاسم: ${currentMember.lastName} ${currentMember.firstName}
الولاية: ${currentMember.wilaya}
نوع الاشتراك: ${subscriptionInfo.label}
المبلغ: ${subscriptionInfo.amount.toLocaleString('ar-DZ')} دج
سنة الاشتراك: ${subscriptionYear}
━━━━━━━━━━━━━━━━━━━━
RND - التجمع الوطني الديمقراطي`;

  // تحميل الوصل كـ PDF
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    setIsDownloading(true);
    setDownloadType("pdf");
    
    try {
      const images = receiptRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      const fileName = `وصل_الاشتراك_${currentMember.membershipNumber}_${subscriptionYear}.pdf`;
      pdf.save(fileName);
      toast.success("تم تحميل وصل الاشتراك بصيغة PDF بنجاح! 📄");

    } catch (error) {
      console.error('خطأ في تحميل الوصل:', error);
      toast.error('حدث خطأ أثناء تحميل الوصل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
    }
  };

  // تحميل الوصل كـ JPEG
  const handleDownloadJPEG = async () => {
    if (!receiptRef.current) return;
    
    setIsDownloading(true);
    setDownloadType("jpeg");
    
    try {
      const images = receiptRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `وصل_الاشتراك_${currentMember.membershipNumber}_${subscriptionYear}.jpg`;
      link.href = imgData;
      link.click();

      toast.success("تم تحميل وصل الاشتراك بصيغة JPEG بنجاح! 📄");
    } catch (error) {
      console.error('خطأ في تحميل الوصل:', error);
      toast.error('حدث خطأ أثناء تحميل الوصل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
    }
  };

  return (
    <div className="min-h-[80vh] px-4 py-12" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-6 md:p-8"
        >
          {/* العنوان وأزرار التحكم */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">وصل تسديد الاشتراك</h2>
              <p className="text-gray-600 mt-1 text-sm">معاينة وتحميل وصل تسديد الاشتراك السنوي</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={handleDownloadJPEG}
                disabled={isDownloading}
                className="flex-1 md:flex-none px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isDownloading && downloadType === "jpeg" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5" />
                    تحميل JPEG
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex-1 md:flex-none px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isDownloading && downloadType === "pdf" ? (
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
          </div>

          {/* معاينة الوصل */}
          <div className="flex justify-center overflow-x-auto">
            <div 
              ref={receiptRef}
              className="w-[595px] bg-white border-2 border-gray-300 p-8"
              style={{ minHeight: '842px' }}
            >
              {/* شعار الحزب */}
              <div className="text-center mb-6">
                <img 
                  src="https://polished-pony-114.convex.cloud/api/storage/18a90625-4c04-4af2-8221-771656ee5b2b"
                  alt="شعار الحزب"
                  className="h-24 mx-auto mb-4"
                  crossOrigin="anonymous"
                />
                <h1 className="text-2xl font-bold text-green-700">حزب التجمع الوطني الديمقراطي</h1>
                <p className="text-lg text-gray-600">Rassemblement National Démocratique</p>
              </div>

              {/* عنوان الوصل */}
              <div className="text-center my-8 py-4 border-y-2 border-green-600">
                <h2 className="text-xl font-bold text-gray-900">
                  وصل من أجل تسديد حقوق الاشتراك السنوي
                </h2>
                <p className="text-2xl font-bold text-green-700 mt-2">لسنة {subscriptionYear}</p>
              </div>

              {/* معلومات المنخرط */}
              <div className="flex items-start gap-6 my-8">
                {/* رقم الانخراط على اليمين */}
                <div className="flex-1">
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-1">رقم الانخراط:</p>
                    <p className="text-2xl font-bold font-mono text-green-700 tracking-wider" dir="ltr">
                      {currentMember.membershipNumber}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">الاسم واللقب:</p>
                      <p className="text-lg font-bold text-gray-900">
                        {currentMember.lastName} {currentMember.firstName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">تاريخ ومكان الازدياد:</p>
                      <p className="text-lg text-gray-900">
                        {currentMember.birthDate ? formatDate(currentMember.birthDate) : '---'} - {currentMember.birthPlace || '---'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">الولاية والبلدية:</p>
                      <p className="text-lg text-gray-900">
                        {currentMember.wilaya} - {currentMember.baladiya}
                      </p>
                    </div>
                  </div>
                </div>

                {/* صورة المنخرط على اليسار */}
                <div className="w-32 h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 flex-shrink-0">
                  {currentMember.profilePhotoUrl ? (
                    <img
                      src={currentMember.profilePhotoUrl}
                      alt="الصورة الشخصية"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* معلومات الاشتراك */}
              <div className="bg-green-50 rounded-xl p-6 my-8 border border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-4">تفاصيل الاشتراك</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">نوع الاشتراك:</p>
                    <p className="text-lg font-bold text-gray-900">{subscriptionInfo.label}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">المبلغ:</p>
                    <p className="text-lg font-bold text-green-700">
                      {subscriptionInfo.amount.toLocaleString('ar-DZ')} دج
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">بالحروف:</p>
                    <p className="text-lg text-gray-900">{subscriptionInfo.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الانخراط:</p>
                    <p className="text-lg text-gray-900">{formatDate(currentMember.joinDate)}</p>
                  </div>
                </div>
              </div>

              {/* QR Code وتاريخ الانخراط */}
              <div className="flex items-end justify-between mt-8">
                <div>
                  <p className="text-sm text-gray-600 mb-2">تاريخ الانخراط:</p>
                  <p className="text-lg font-bold text-gray-900">{formatDate(currentMember.joinDate)}</p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-300">
                  <QRCodeSVG
                    value={qrData}
                    size={80}
                    level="M"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
              </div>

              {/* ملاحظة في الأسفل */}
              <div className="mt-12 pt-6 border-t-2 border-gray-300">
                <p className="text-center text-sm text-gray-700 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <strong>ملاحظة:</strong> يقدم هذا الوصل إلى أمين الخزينة البلدي، الولائي أو الوطني حسب الحالة
                </p>
              </div>

              {/* التذييل */}
              <div className="mt-8 text-center text-xs text-gray-500">
                <p>حزب التجمع الوطني الديمقراطي - RND</p>
                <p>تم إنشاء هذا الوصل إلكترونياً بتاريخ {formatDate(Date.now())}</p>
              </div>
            </div>
          </div>

          {/* ملاحظات */}
          <div className="mt-8 text-center text-sm text-gray-600 bg-blue-50 rounded-xl p-4">
            <p className="font-bold text-blue-800 mb-1">📌 ملاحظة هامة</p>
            <p>هذا الوصل صالح للاستخدام الرسمي فقط - يرجى الاحتفاظ به في مكان آمن</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

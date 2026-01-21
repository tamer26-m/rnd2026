import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, User, CheckCircle, Image as ImageIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

// أنواع الاشتراكات
const SUBSCRIPTION_TYPES = {
  type_1: { amount: 1000, label: "الاشتراك 01", description: "ألف دينار جزائري" },
  type_2: { amount: 3000, label: "الاشتراك 02", description: "ثلاثة آلاف دينار جزائري" },
  type_3: { amount: 10000, label: "الاشتراك 03", description: "عشرة آلاف دينار جزائري" },
  type_4: { amount: 200000, label: "الاشتراك 04", description: "مائتي ألف دينار جزائري" },
};

interface MemberData {
  membershipNumber: string;
  firstName: string;
  lastName: string;
  birthDate?: number;
  birthPlace?: string;
  wilaya: string;
  baladiya: string;
  subscriptionType: string;
  subscriptionYear?: number;
  joinDate?: number;
  profilePhotoUrl?: string;
}

interface SubscriptionReceiptGeneratorProps {
  memberData: MemberData;
  onClose?: () => void;
  showCloseButton?: boolean;
  autoDownload?: boolean;
}

export default function SubscriptionReceiptGenerator({ 
  memberData, 
  onClose, 
  showCloseButton = true,
  autoDownload = false 
}: SubscriptionReceiptGeneratorProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  // تنسيق التاريخ
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "---";
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-DZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // الحصول على معلومات الاشتراك
  const subscriptionInfo = SUBSCRIPTION_TYPES[memberData.subscriptionType as keyof typeof SUBSCRIPTION_TYPES] || SUBSCRIPTION_TYPES.type_1;
  const subscriptionYear = memberData.subscriptionYear || new Date().getFullYear();

  // إنشاء بيانات QR Code
  const qrData = `الأمين العام الدكتور منذر بودن
━━━━━━━━━━━━━━━━━━━━
رقم العضوية: ${memberData.membershipNumber}
الاسم: ${memberData.lastName} ${memberData.firstName}
الولاية: ${memberData.wilaya}
نوع الاشتراك: ${subscriptionInfo.label}
المبلغ: ${subscriptionInfo.amount.toLocaleString('ar-DZ')} دج
سنة الاشتراك: ${subscriptionYear}
━━━━━━━━━━━━━━━━━━━━
RND - التجمع الوطني الديمقراطي`;

  // تحميل الوصل كـ JPEG
  const handleDownloadJPEG = async () => {
    if (!receiptRef.current) return;
    
    setIsDownloading(true);
    
    try {
      // انتظار تحميل الصور
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

      // انتظار قليل للتأكد من تحميل كل شيء
      await new Promise(resolve => setTimeout(resolve, 500));

      // تحويل الوصل إلى صورة
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // تحويل إلى JPEG
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // إنشاء رابط التحميل
      const link = document.createElement('a');
      link.download = `وصل_الاشتراك_${memberData.membershipNumber}_${subscriptionYear}.jpg`;
      link.href = imgData;
      link.click();

      setDownloadComplete(true);
      toast.success("تم تحميل وصل الاشتراك بنجاح! 📄");

    } catch (error) {
      console.error('خطأ في تحميل الوصل:', error);
      toast.error('حدث خطأ أثناء تحميل الوصل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsDownloading(false);
    }
  };

  // تحميل تلقائي عند التحميل
  useEffect(() => {
    if (autoDownload && !downloadComplete) {
      const timer = setTimeout(() => {
        handleDownloadJPEG();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoDownload]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* أزرار التحكم */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={handleDownloadJPEG}
          disabled={isDownloading}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري التحميل...
            </>
          ) : (
            <>
              <ImageIcon className="w-5 h-5" />
              تحميل الوصل (JPEG)
            </>
          )}
        </button>

        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
          >
            إغلاق
          </button>
        )}
      </div>

      {downloadComplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"
        >
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-bold">تم تحميل الوصل بنجاح!</p>
          <p className="text-green-600 text-sm">تحقق من مجلد التنزيلات على جهازك</p>
        </motion.div>
      )}

      {/* معاينة الوصل */}
      <div className="flex justify-center overflow-x-auto">
        <div 
          ref={receiptRef}
          className="w-[595px] bg-white border-2 border-gray-300 p-8 shadow-xl"
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
                  {memberData.membershipNumber}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">الاسم واللقب:</p>
                  <p className="text-lg font-bold text-gray-900">
                    {memberData.lastName} {memberData.firstName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">تاريخ ومكان الازدياد:</p>
                  <p className="text-lg text-gray-900">
                    {formatDate(memberData.birthDate)} - {memberData.birthPlace || '---'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">الولاية والبلدية:</p>
                  <p className="text-lg text-gray-900">
                    {memberData.wilaya} - {memberData.baladiya}
                  </p>
                </div>
              </div>
            </div>

            {/* صورة المنخرط على اليسار */}
            <div className="w-32 h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 flex-shrink-0">
              {memberData.profilePhotoUrl ? (
                <img
                  src={memberData.profilePhotoUrl}
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
                <p className="text-sm text-gray-600">تاريخ التسجيل:</p>
                <p className="text-lg text-gray-900">{formatDate(memberData.joinDate || Date.now())}</p>
              </div>
            </div>
          </div>

          {/* QR Code وتاريخ الانخراط */}
          <div className="flex items-end justify-between mt-8">
            <div>
              <p className="text-sm text-gray-600 mb-2">تاريخ التسجيل:</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(memberData.joinDate || Date.now())}</p>
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
      <div className="text-center text-sm text-gray-600 bg-blue-50 rounded-xl p-4">
        <p className="font-bold text-blue-800 mb-1">📌 ملاحظة هامة</p>
        <p>هذا الوصل صالح للاستخدام الرسمي فقط - يرجى الاحتفاظ به في مكان آمن</p>
      </div>
    </div>
  );
}

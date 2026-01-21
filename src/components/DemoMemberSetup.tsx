import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { UserPlus, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function DemoMemberSetup({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const createDemoMember = useMutation(api.demoData.createDemoMember);
  
  // الحصول على بيانات المنخرط من sessionStorage
  const currentMemberData = typeof window !== 'undefined' ? sessionStorage.getItem("currentMember") : null;
  const currentMember = currentMemberData ? JSON.parse(currentMemberData) : null;

  const handleCreateDemo = async () => {
    setLoading(true);
    try {
      const result: any = await createDemoMember({});
      if (result && result.membershipNumber) {
        toast.success("تم إنشاء حساب منخرط افتراضي بنجاح!");
        toast.success(`رقم العضوية: ${result.membershipNumber}`);
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // إذا كان لديه حساب منخرط بالفعل
  if (currentMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            لديك حساب منخرط! ✅
          </h2>
          <p className="text-gray-600 mb-6">
            رقم العضوية: <span className="font-mono font-bold">{currentMember.membershipNumber}</span>
          </p>
          <button
            onClick={onComplete}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            الذهاب إلى لوحة التحكم
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-6">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            إنشاء حساب منخرط
          </h1>
          <p className="text-gray-600">
            قم بإنشاء حساب منخرط افتراضي للاختبار
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-start">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  سيتم إنشاء حساب منخرط بالبيانات التالية:
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• الاسم: أحمد بن علي</li>
                  <li>• الولاية: الجزائر (Algiers)</li>
                  <li>• البلدية: باب الوادي</li>
                  <li>• الصفة: مناضل</li>
                  <li>• سنة الانخراط: 2010</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateDemo}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري الإنشاء...
              </span>
            ) : (
              "إنشاء حساب منخرط افتراضي"
            )}
          </button>

          {/* Skip Button */}
          <button
            onClick={onComplete}
            className="w-full mt-4 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            تخطي
          </button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 text-start">
            بعد إنشاء الحساب يمكنك:
          </h3>
          <ul className="space-y-3 text-start">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">الحصول على بطاقة العضوية</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">تحديث المعلومات الشخصية</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">رفع الصورة الشخصية</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">عرض الأنشطة والفعاليات</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}

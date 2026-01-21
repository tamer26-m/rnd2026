import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Image as ImageIcon,
  Download,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface SubscriptionUploadSectionProps {
  membershipNumber: string;
}

export default function SubscriptionUploadSection({ membershipNumber }: SubscriptionUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const receipts = useQuery(api.subscriptionReceipts.getMemberReceipts, { membershipNumber });
  const uploadReceipt = useMutation(api.subscriptionReceipts.uploadReceipt);
  const generateUploadUrl = useMutation(api.subscriptionReceipts.generateUploadUrl);

  const currentYear = new Date().getFullYear();
  const currentYearReceipt = receipts?.find((r) => r.year === currentYear);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الملف يجب أن لا يتجاوز 5 ميجابايت");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // رفع الملف
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!result.ok) throw new Error("فشل رفع الملف");

      const { storageId } = await result.json();

      // حفظ الوثيقة
      await uploadReceipt({
        membershipNumber,
        storageId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        year: currentYear,
      });

      toast.success("تم رفع وثيقة التسديد بنجاح! ✅");
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      toast.error("حدث خطأ أثناء رفع الوثيقة");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          label: "في انتظار التحقق",
        };
      case "verified":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
          label: "تم التحقق",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          label: "مرفوضة",
        };
      default:
        return {
          icon: FileText,
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          label: "غير معروف",
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">وثيقة تسديد الاشتراك</h3>
          <p className="text-gray-600 text-sm">رفع وثيقة إثبات تسديد الاشتراك السنوي {currentYear}</p>
        </div>
      </div>

      {/* حالة الوثيقة الحالية */}
      {currentYearReceipt && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${getStatusInfo(currentYearReceipt.status).bg} ${getStatusInfo(currentYearReceipt.status).border} border rounded-xl p-4 mb-6`}
        >
          <div className="flex items-center gap-3">
            {(() => {
              const StatusIcon = getStatusInfo(currentYearReceipt.status).icon;
              return <StatusIcon className={`w-6 h-6 ${getStatusInfo(currentYearReceipt.status).color}`} />;
            })()}
            <div className="flex-1">
              <p className={`font-bold ${getStatusInfo(currentYearReceipt.status).color}`}>
                {getStatusInfo(currentYearReceipt.status).label}
              </p>
              <p className="text-sm text-gray-600">
                تم الرفع بتاريخ: {new Date(currentYearReceipt.uploadedAt).toLocaleDateString("ar-DZ")}
              </p>
              {currentYearReceipt.status === "rejected" && currentYearReceipt.rejectionReason && (
                <p className="text-sm text-red-600 mt-1">
                  <AlertCircle className="w-4 h-4 inline ms-1" />
                  سبب الرفض: {currentYearReceipt.rejectionReason}
                </p>
              )}
            </div>
            {currentYearReceipt.url && (
              <button
                onClick={() => window.open(currentYearReceipt.url || "", "_blank")}
                className="flex items-center gap-1 px-3 py-2 bg-white rounded-lg text-blue-600 hover:bg-blue-50 text-sm"
              >
                <Download className="w-4 h-4" />
                عرض
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* منطقة الرفع */}
      {(!currentYearReceipt || currentYearReceipt.status === "rejected") && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="معاينة الوثيقة"
                className="w-full max-h-64 object-contain rounded-xl border-2 border-gray-200"
              />
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 font-medium">اضغط لاختيار وثيقة التسديد</p>
              <p className="text-sm text-gray-500 mt-2">صورة أو PDF (حد أقصى 5 ميجابايت)</p>
            </div>
          )}

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  رفع الوثيقة
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* سجل الوثائق السابقة */}
      {receipts && receipts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-bold text-gray-900 mb-4">سجل الوثائق</h4>
          <div className="space-y-3">
            {receipts.map((receipt) => (
              <div
                key={receipt._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {(() => {
                    const StatusIcon = getStatusInfo(receipt.status).icon;
                    return <StatusIcon className={`w-5 h-5 ${getStatusInfo(receipt.status).color}`} />;
                  })()}
                  <div>
                    <p className="font-medium text-gray-900">سنة {receipt.year}</p>
                    <p className="text-sm text-gray-500">
                      {receipt.amount.toLocaleString("ar-DZ")} دج
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(receipt.status).bg} ${getStatusInfo(receipt.status).color}`}>
                    {getStatusInfo(receipt.status).label}
                  </span>
                  {receipt.url && (
                    <button
                      onClick={() => window.open(receipt.url || "", "_blank")}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

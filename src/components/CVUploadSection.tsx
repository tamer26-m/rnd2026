import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { FileText, Upload, Trash2, Download, Loader2, CheckCircle, AlertCircle, File } from "lucide-react";

interface CVUploadSectionProps {
  membershipNumber: string;
}

export default function CVUploadSection({ membershipNumber }: CVUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cv = useQuery(api.memberCV.getCV, { membershipNumber });
  const generateUploadUrl = useMutation(api.members.generateUploadUrl);
  const uploadCV = useMutation(api.memberCV.uploadCV);
  const deleteCV = useMutation(api.memberCV.deleteCV);

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFileSelect = async (file: File) => {
    // التحقق من نوع الملف
    if (file.type !== "application/pdf") {
      toast.error("يرجى اختيار ملف PDF فقط");
      return;
    }

    // التحقق من حجم الملف (5 ميجابايت كحد أقصى)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("حجم الملف يتجاوز الحد المسموح (5 ميجابايت)");
      return;
    }

    setIsUploading(true);

    try {
      // الحصول على رابط الرفع
      const uploadUrl = await generateUploadUrl();

      // رفع الملف
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("فشل رفع الملف");
      }

      const { storageId } = await response.json();

      // حفظ بيانات السيرة الذاتية
      const result = await uploadCV({
        membershipNumber,
        storageId,
        fileName: file.name,
        fileSize: file.size,
      });

      toast.success(result.isUpdate ? "تم تحديث السيرة الذاتية بنجاح" : "تم رفع السيرة الذاتية بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل رفع السيرة الذاتية";
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف السيرة الذاتية؟")) return;

    try {
      await deleteCV({ membershipNumber });
      toast.success("تم حذف السيرة الذاتية بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل حذف السيرة الذاتية";
      toast.error(message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">السيرة الذاتية</h3>
          <p className="text-sm text-gray-500">قم برفع سيرتك الذاتية بصيغة PDF</p>
        </div>
      </div>

      {cv === undefined ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : cv ? (
        // عرض السيرة الذاتية الموجودة
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-start">
                <p className="font-bold text-green-800 mb-1">تم رفع السيرة الذاتية</p>
                <div className="space-y-1 text-sm text-green-700">
                  <p className="flex items-center gap-2">
                    <File className="w-4 h-4" />
                    {cv.fileName}
                  </p>
                  <p>الحجم: {formatFileSize(cv.fileSize)}</p>
                  <p>تاريخ الرفع: {formatDate(cv.uploadedAt)}</p>
                  {cv.updatedAt && (
                    <p>آخر تحديث: {formatDate(cv.updatedAt)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={cv.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              تحميل السيرة الذاتية
            </a>
            <button
              onClick={handleDelete}
              className="px-4 py-3 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              حذف
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-3 text-start">تحديث السيرة الذاتية:</p>
            <label className="block">
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
                disabled={isUploading}
              />
              <div className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all cursor-pointer flex items-center justify-center gap-2">
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    اختيار ملف جديد
                  </>
                )}
              </div>
            </label>
          </div>
        </div>
      ) : (
        // منطقة رفع السيرة الذاتية
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging
              ? "border-red-500 bg-red-50"
              : "border-gray-300 hover:border-red-400 hover:bg-red-50/50"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${isDragging ? "bg-red-100" : "bg-gray-100"}`}>
              <Upload className={`w-10 h-10 ${isDragging ? "text-red-600" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700 mb-1">
                {isDragging ? "أفلت الملف هنا" : "اسحب وأفلت ملف PDF هنا"}
              </p>
              <p className="text-sm text-gray-500">أو</p>
            </div>
            <label>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
                disabled={isUploading}
              />
              <span className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-xl transition-all cursor-pointer inline-flex items-center gap-2">
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    اختيار ملف
                  </>
                )}
              </span>
            </label>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <AlertCircle className="w-4 h-4" />
              <span>الحد الأقصى لحجم الملف: 5 ميجابايت</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

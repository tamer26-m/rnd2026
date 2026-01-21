import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Camera, Upload, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type Page = "home" | "activities" | "members" | "dashboard" | "gallery" | "register" | "login" | "updatePhoto";

export default function UpdatePhotoPage({ setCurrentPage }: { setCurrentPage: (page: Page) => void }) {
  // الحصول على بيانات المنخرط من sessionStorage
  const currentMemberData = typeof window !== 'undefined' ? sessionStorage.getItem("currentMember") : null;
  const currentMember = currentMemberData ? JSON.parse(currentMemberData) : null;
  
  const generateUploadUrl = useMutation(api.members.generateUploadUrl);
  const updateProfilePhoto = useMutation(api.members.updateProfilePhoto);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error("يرجى اختيار صورة أولاً");
      return;
    }

    if (!currentMember?.membershipNumber) {
      toast.error("يرجى تسجيل الدخول أولاً");
      setCurrentPage("login");
      return;
    }

    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });

      if (!result.ok) {
        throw new Error("فشل رفع الصورة");
      }

      const { storageId } = await result.json();
      await updateProfilePhoto({ 
        membershipNumber: currentMember.membershipNumber,
        photoId: storageId 
      });

      toast.success("تم تحديث الصورة بنجاح! ✅");
      
      // تحديث البيانات في sessionStorage
      const updatedMember = { ...currentMember, profilePhotoId: storageId };
      sessionStorage.setItem("currentMember", JSON.stringify(updatedMember));
      
      setTimeout(() => setCurrentPage("dashboard"), 1500);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploading(false);
    }
  };

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

  return (
    <div className="min-h-[80vh] px-4 py-12">
      <div className="max-w-2xl mx-auto">
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
            <div>
              <h2 className="text-3xl font-bold text-gray-900">تحديث الصورة الشخصية</h2>
              <p className="text-gray-600 mt-1">قم برفع صورة شخصية واضحة</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative w-64 h-64 mb-6">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="معاينة الصورة"
                    className="w-full h-full object-cover rounded-2xl shadow-lg"
                  />
                ) : currentMember.profilePhotoUrl ? (
                  <img
                    src={currentMember.profilePhotoUrl}
                    alt="الصورة الحالية"
                    className="w-full h-full object-cover rounded-2xl shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                    <Camera className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mb-4"
              >
                <Upload className="w-5 h-5" />
                اختر صورة جديدة
              </button>

              {selectedImage && (
                <p className="text-sm text-gray-600 mb-4">
                  الملف المختار: {selectedImage.name}
                </p>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-bold text-yellow-900 mb-2">إرشادات الصورة:</h4>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>يجب أن تكون الصورة واضحة وحديثة</li>
                <li>خلفية بيضاء أو محايدة</li>
                <li>حجم الملف لا يتجاوز 5 ميجابايت</li>
                <li>صيغة الصورة: JPG أو PNG</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleUpload}
                disabled={!selectedImage || isUploading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ الصورة
                  </>
                )}
              </button>

              <button
                onClick={() => setCurrentPage("dashboard")}
                className="px-6 py-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

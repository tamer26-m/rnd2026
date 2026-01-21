import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Save, Upload, RefreshCw } from "lucide-react";

interface HomePageSettingsSectionProps {
  adminUsername: string;
}

export default function HomePageSettingsSection({ adminUsername }: HomePageSettingsSectionProps) {
  const settings = useQuery(api.adminSettings.getHomePageSettings);
  const updateSettings = useMutation(api.adminSettings.updateHomePageSettings);
  const generateUploadUrl = useMutation(api.adminSettings.generateUploadUrl);

  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [statsMembers, setStatsMembers] = useState(0);
  const [statsActivities, setStatsActivities] = useState(0);
  const [statsWilayas, setStatsWilayas] = useState(0);
  const [statsYears, setStatsYears] = useState(0);
  const [backgroundId, setBackgroundId] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // تهيئة البيانات
  if (settings && !initialized) {
    setHeroTitle(settings.heroTitle);
    setHeroSubtitle(settings.heroSubtitle);
    setStatsMembers(settings.statsMembers);
    setStatsActivities(settings.statsActivities);
    setStatsWilayas(settings.statsWilayas);
    setStatsYears(settings.statsYears);
    setBackgroundId(settings.heroBackgroundId || null);
    setInitialized(true);
  }

  const handleUploadBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // عرض معاينة
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);

      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setBackgroundId(storageId);
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      toast.error("فشل في رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSettings({
        adminUsername,
        heroTitle,
        heroSubtitle,
        heroBackgroundId: backgroundId,
        statsMembers,
        statsActivities,
        statsWilayas,
        statsYears,
      });
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في حفظ الإعدادات";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">إعدادات الصفحة الرئيسية</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          حفظ التغييرات
        </button>
      </div>

      {/* Hero Section Settings */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">قسم الترحيب (Hero)</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">العنوان الرئيسي</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="أدخل العنوان الرئيسي"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">العنوان الفرعي</label>
            <textarea
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="أدخل العنوان الفرعي"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">صورة الخلفية</label>
            <div className="flex items-center gap-4">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="خلفية"
                  className="w-32 h-20 object-cover rounded-lg"
                />
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadBackground}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                {uploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {uploading ? "جاري الرفع..." : "رفع صورة جديدة"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Settings */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">الإحصائيات المعروضة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عدد المنخرطين</label>
            <input
              type="number"
              value={statsMembers}
              onChange={(e) => setStatsMembers(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عدد الأنشطة</label>
            <input
              type="number"
              value={statsActivities}
              onChange={(e) => setStatsActivities(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عدد الولايات</label>
            <input
              type="number"
              value={statsWilayas}
              onChange={(e) => setStatsWilayas(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">سنوات الخبرة</label>
            <input
              type="number"
              value={statsYears}
              onChange={(e) => setStatsYears(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

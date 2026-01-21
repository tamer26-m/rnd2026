import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Save, Upload, RefreshCw, User } from "lucide-react";

interface SecretaryGeneralSettingsSectionProps {
  adminUsername: string;
}

export default function SecretaryGeneralSettingsSection({ adminUsername }: SecretaryGeneralSettingsSectionProps) {
  const settings = useQuery(api.adminSettings.getSecretaryGeneralSettings);
  const updateSettings = useMutation(api.adminSettings.updateSecretaryGeneralSettings);
  const generateUploadUrl = useMutation(api.adminSettings.generateUploadUrl);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [speechContent, setSpeechContent] = useState("");
  const [photoId, setPhotoId] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (settings && !initialized) {
    setFullName(settings.fullName);
    setBio(settings.bio);
    setSpeechContent(settings.speechContent || "");
    setPhotoId(settings.photoId || null);
    setInitialized(true);
  }

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setPhotoId(storageId);
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
        fullName,
        bio,
        speechContent,
        photoId,
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
        <h2 className="text-2xl font-bold text-gray-800">إعدادات صفحة الأمين العام (العربية)</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          حفظ التغييرات
        </button>
      </div>

      {/* Photo Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">صورة الأمين العام</h3>
        
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {settings.photoUrl ? (
              <img src={settings.photoUrl} alt="الأمين العام" className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadPhoto}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
            >
              {uploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {uploading ? "جاري الرفع..." : "تغيير الصورة"}
            </button>
            <p className="text-sm text-gray-500 mt-2">يفضل صورة مربعة بحجم 400x400 بكسل</p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">المعلومات الأساسية</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="أدخل الاسم الكامل"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نبذة مختصرة</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="أدخل نبذة مختصرة"
            />
          </div>
        </div>
      </div>

      {/* Speech Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">كلمة الأمين العام</h3>
        
        <textarea
          value={speechContent}
          onChange={(e) => setSpeechContent(e.target.value)}
          rows={15}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
          placeholder="أدخل كلمة الأمين العام..."
        />
      </div>
    </div>
  );
}

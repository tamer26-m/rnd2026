import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Save, Upload, RefreshCw, CreditCard } from "lucide-react";

interface MemberCardSettingsSectionProps {
  adminUsername: string;
}

export default function MemberCardSettingsSection({ adminUsername }: MemberCardSettingsSectionProps) {
  const settings = useQuery(api.adminSettings.getMemberCardSettings);
  const updateSettings = useMutation(api.adminSettings.updateMemberCardSettings);
  const generateUploadUrl = useMutation(api.adminSettings.generateUploadUrl);

  const [backgroundId, setBackgroundId] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (settings && !initialized) {
    setBackgroundId(settings.backgroundId || null);
    setInitialized(true);
  }

  const handleUploadBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        backgroundId,
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
        <div className="flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">إعدادات بطاقة العضوية</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          حفظ التغييرات
        </button>
      </div>

      {/* Background Settings */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">خلفية البطاقة</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">صورة الخلفية</label>
            <p className="text-sm text-gray-500 mb-4">
              يفضل استخدام صورة بأبعاد 1000x600 بكسل للحصول على أفضل جودة
            </p>
            
            <div className="flex flex-col md:flex-row items-start gap-6">
              {settings.backgroundUrl && (
                <div className="w-full md:w-1/2">
                  <p className="text-sm font-medium text-gray-700 mb-2">الخلفية الحالية:</p>
                  <img
                    src={settings.backgroundUrl}
                    alt="خلفية البطاقة"
                    className="w-full rounded-xl shadow-lg"
                  />
                </div>
              )}
              
              <div className="w-full md:w-1/2">
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
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-500 transition-all"
                >
                  {uploading ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-gray-500">اضغط لرفع خلفية جديدة</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">معاينة البطاقة</h3>
        <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center">
          <div 
            className="w-[500px] h-[300px] rounded-xl shadow-2xl relative overflow-hidden"
            style={{
              backgroundImage: `url(${settings.backgroundUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <p className="text-white text-lg font-bold">معاينة البطاقة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-800 mb-2">ملاحظات هامة:</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>سيتم تطبيق الخلفية الجديدة على جميع بطاقات العضوية</li>
          <li>يفضل استخدام صورة عالية الجودة بأبعاد 1000x600 بكسل</li>
          <li>تأكد من أن الخلفية لا تؤثر على وضوح البيانات المكتوبة</li>
        </ul>
      </div>
    </div>
  );
}

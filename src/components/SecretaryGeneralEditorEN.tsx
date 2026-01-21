import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Globe, FileText } from "lucide-react";

export default function SecretaryGeneralEditorEN({ adminUsername }: { adminUsername: string }) {
  const settings = useQuery(api.adminSettings.getSecretaryGeneralSettingsEN);
  const updateSettings = useMutation(api.adminSettings.updateSecretaryGeneralSettingsEN);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [speechContent, setSpeechContent] = useState("");

  useEffect(() => {
    if (settings) {
      setFullName(settings.fullName);
      setBio(settings.bio);
      setSpeechContent(settings.speechContent || "");
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings({ 
        adminUsername, 
        fullName, 
        bio, 
        speechContent: speechContent || undefined,
      });
      toast.success("تم حفظ التغييرات بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل حفظ التغييرات";
      toast.error(message);
    }
  };

  if (!settings) return <div className="text-center py-12">جاري التحميل...</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-start mb-6 text-gray-800 flex items-center gap-3">
        <Globe className="w-7 h-7 text-blue-600" />
        تعديل صفحة الأمين العام (النسخة الإنجليزية)
      </h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-700 text-sm text-start">
          💡 هذه الصفحة لتعديل المحتوى الإنجليزي فقط. الصورة تُستخدم من النسخة العربية.
        </p>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
            Full Name (الاسم بالإنجليزية)
          </label>
          <input 
            type="text" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
            dir="ltr" 
            placeholder="Secretary General Name" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
            Biography (السيرة الذاتية بالإنجليزية)
          </label>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            rows={4} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
            dir="ltr" 
            placeholder="Brief biography in English..." 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-start flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Secretary General's Message (كلمة الأمين العام بالإنجليزية)
          </label>
          <textarea 
            value={speechContent} 
            onChange={(e) => setSpeechContent(e.target.value)} 
            rows={12} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
            dir="ltr" 
            placeholder="Write the Secretary General's message in English..." 
          />
        </div>
        <button 
          onClick={handleSave} 
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-xl transition-all"
        >
          حفظ التغييرات
        </button>
      </div>
    </div>
  );
}

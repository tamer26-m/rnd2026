import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Save, RefreshCw, Globe } from "lucide-react";

interface SecretaryGeneralSettingsENSectionProps {
  adminUsername: string;
}

export default function SecretaryGeneralSettingsENSection({ adminUsername }: SecretaryGeneralSettingsENSectionProps) {
  const settings = useQuery(api.adminSettings.getSecretaryGeneralSettingsEN);
  const updateSettings = useMutation(api.adminSettings.updateSecretaryGeneralSettingsEN);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [speechContent, setSpeechContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (settings && !initialized) {
    setFullName(settings.fullName);
    setBio(settings.bio);
    setSpeechContent(settings.speechContent || "");
    setInitialized(true);
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSettings({
        adminUsername,
        fullName,
        bio,
        speechContent,
      });
      toast.success("Settings saved successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save settings";
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
          <Globe className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Secretary General Page (English)</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm">
          هذه الصفحة لتعديل المحتوى الإنجليزي لصفحة الأمين العام. الصورة مشتركة مع النسخة العربية.
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Basic Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="Enter full name"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Short Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="Enter short bio"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Speech Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Secretary General's Speech</h3>
        
        <textarea
          value={speechContent}
          onChange={(e) => setSpeechContent(e.target.value)}
          rows={15}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
          placeholder="Enter the Secretary General's speech..."
          dir="ltr"
        />
      </div>
    </div>
  );
}

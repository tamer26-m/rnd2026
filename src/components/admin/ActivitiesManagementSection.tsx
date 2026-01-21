import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, X, Upload, RefreshCw, Calendar, MapPin, Image } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { WILAYAS } from "../../data/algeriaGeoData";

interface ActivitiesManagementSectionProps {
  adminUsername: string;
}

const ACTIVITY_TYPES = [
  { value: "meeting", label: "اجتماع" },
  { value: "conference", label: "مؤتمر" },
  { value: "campaign", label: "حملة" },
  { value: "event", label: "فعالية" },
  { value: "other", label: "أخرى" },
];

const STATUS_OPTIONS = [
  { value: "upcoming", label: "قادم" },
  { value: "ongoing", label: "جاري" },
  { value: "completed", label: "منتهي" },
];

export default function ActivitiesManagementSection({ adminUsername }: ActivitiesManagementSectionProps) {
  const activities = useQuery(api.activities.listActivitiesForAdmin, { adminUsername });
  const createActivity = useMutation(api.activities.createActivityByAdmin);
  const updateActivity = useMutation(api.activities.updateActivityByAdmin);
  const deleteActivity = useMutation(api.activities.deleteActivityByAdmin);
  const addMedia = useMutation(api.activities.addMediaToActivityByAdmin);
  const deleteMedia = useMutation(api.activities.deleteMediaFromActivity);
  const generateUploadUrl = useMutation(api.activities.generateUploadUrl);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    wilaya: "",
    baladiya: "",
    location: "",
    type: "event" as "meeting" | "conference" | "campaign" | "event" | "other",
    status: "upcoming" as "upcoming" | "ongoing" | "completed",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = async () => {
    if (!formData.title || !formData.description || !formData.date || !formData.wilaya || !formData.location) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setSaving(true);
      await createActivity({
        adminUsername,
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).getTime(),
        wilaya: formData.wilaya,
        baladiya: formData.baladiya || formData.wilaya,
        location: formData.location,
        type: formData.type,
        status: formData.status,
      });
      toast.success("تم إضافة النشاط بنجاح");
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في إضافة النشاط";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingActivity) return;

    try {
      setSaving(true);
      await updateActivity({
        adminUsername,
        activityId: editingActivity._id,
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).getTime(),
        wilaya: formData.wilaya,
        baladiya: formData.baladiya,
        location: formData.location,
        type: formData.type,
        status: formData.status,
        sendNotification: false,
      });
      toast.success("تم تحديث النشاط بنجاح");
      setEditingActivity(null);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في تحديث النشاط";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (activityId: Id<"activities">) => {
    if (!confirm("هل أنت متأكد من حذف هذا النشاط؟")) return;

    try {
      await deleteActivity({ adminUsername, activityId });
      toast.success("تم حذف النشاط بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في حذف النشاط";
      toast.error(message);
    }
  };

  const handleUploadMedia = async (activityId: Id<"activities">, e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      await addMedia({
        adminUsername,
        activityId,
        storageId,
        type: file.type.startsWith("video") ? "video" : "image",
      });
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      toast.error("فشل في رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      wilaya: "",
      baladiya: "",
      location: "",
      type: "event",
      status: "upcoming",
    });
  };

  const startEdit = (activity: any) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      date: new Date(activity.date).toISOString().split("T")[0],
      wilaya: activity.wilaya,
      baladiya: activity.baladiya,
      location: activity.location,
      type: activity.type,
      status: activity.status,
    });
    setShowAddForm(false);
  };

  if (!activities) {
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
          <Calendar className="w-8 h-8 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-800">إدارة الأنشطة العامة</h2>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingActivity(null);
            resetForm();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة نشاط
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingActivity) && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {editingActivity ? "تعديل نشاط" : "إضافة نشاط جديد"}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingActivity(null);
                resetForm();
              }}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">العنوان *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 transition-all"
                placeholder="أدخل عنوان النشاط"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">النوع</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 transition-all"
              >
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 transition-all"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الولاية *</label>
              <select
                value={formData.wilaya}
                onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 transition-all"
              >
                <option value="">اختر الولاية</option>
                {WILAYAS.map((w) => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المكان *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 transition-all"
                placeholder="أدخل مكان النشاط"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">الوصف *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 transition-all"
                placeholder="أدخل وصف النشاط"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingActivity(null);
                resetForm();
              }}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={editingActivity ? handleUpdate : handleAdd}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {editingActivity ? "تحديث" : "إضافة"}
            </button>
          </div>
        </div>
      )}

      {/* Activities List */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity._id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{activity.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activity.status === "completed" ? "bg-green-100 text-green-800" :
                    activity.status === "ongoing" ? "bg-blue-100 text-blue-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {STATUS_OPTIONS.find((s) => s.value === activity.status)?.label}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {ACTIVITY_TYPES.find((t) => t.value === activity.type)?.label}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{activity.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(activity.date).toLocaleDateString("ar-DZ")}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {activity.wilaya} - {activity.location}
                  </span>
                </div>

                {/* Media */}
                {activity.media && activity.media.length > 0 && (
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {activity.media.map((media: any) => (
                      <div key={media._id} className="relative w-20 h-20 rounded-lg overflow-hidden">
                        <img src={media.url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => deleteMedia({ adminUsername, mediaId: media._id })}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id={`media-${activity._id}`}
                  onChange={(e) => handleUploadMedia(activity._id, e)}
                  accept="image/*,video/*"
                  className="hidden"
                />
                <label
                  htmlFor={`media-${activity._id}`}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <Image className="w-5 h-5" />
                </label>
                <button
                  onClick={() => startEdit(activity)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(activity._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد أنشطة</p>
        </div>
      )}
    </div>
  );
}

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, X, Upload, RefreshCw, Image, Eye, EyeOff } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface GalleryManagementSectionProps {
  adminUsername: string;
}

const CATEGORIES = [
  { value: "events", label: "فعاليات" },
  { value: "meetings", label: "اجتماعات" },
  { value: "campaigns", label: "حملات" },
  { value: "general", label: "عام" },
];

export default function GalleryManagementSection({ adminUsername }: GalleryManagementSectionProps) {
  const images = useQuery(api.gallery.listGalleryImagesForAdmin, { adminUsername });
  const addImage = useMutation(api.gallery.addGalleryImage);
  const updateImage = useMutation(api.gallery.updateGalleryImage);
  const deleteImage = useMutation(api.gallery.deleteGalleryImage);
  const generateUploadUrl = useMutation(api.gallery.generateUploadUrl);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    caption: "",
    category: "general" as "events" | "meetings" | "campaigns" | "general",
    storageId: null as any,
    sendNotification: true,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setFormData({ ...formData, storageId });
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      toast.error("فشل في رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.storageId) {
      toast.error("يرجى إدخال العنوان ورفع صورة");
      return;
    }

    try {
      setSaving(true);
      await addImage({
        adminUsername,
        storageId: formData.storageId,
        title: formData.title,
        caption: formData.caption || undefined,
        category: formData.category,
        sendNotification: formData.sendNotification,
      });
      toast.success("تم إضافة الصورة بنجاح");
      setShowAddForm(false);
      setFormData({ title: "", caption: "", category: "general", storageId: null, sendNotification: true });
      setPreviewUrl(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في إضافة الصورة";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingImage) return;

    try {
      setSaving(true);
      await updateImage({
        adminUsername,
        imageId: editingImage._id,
        title: formData.title,
        caption: formData.caption || undefined,
        category: formData.category,
      });
      toast.success("تم تحديث الصورة بنجاح");
      setEditingImage(null);
      setFormData({ title: "", caption: "", category: "general", storageId: null, sendNotification: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في تحديث الصورة";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (imageId: Id<"galleryImages">) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;

    try {
      await deleteImage({ adminUsername, imageId });
      toast.success("تم حذف الصورة بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في حذف الصورة";
      toast.error(message);
    }
  };

  const handleToggleVisibility = async (image: any) => {
    try {
      await updateImage({
        adminUsername,
        imageId: image._id,
        isActive: !image.isActive,
      });
      toast.success(image.isActive ? "تم إخفاء الصورة" : "تم إظهار الصورة");
    } catch (error) {
      toast.error("فشل في تغيير حالة الصورة");
    }
  };

  const startEdit = (image: any) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      caption: image.caption || "",
      category: image.category,
      storageId: image.storageId,
      sendNotification: false,
    });
    setShowAddForm(false);
  };

  if (!images) {
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
          <Image className="w-8 h-8 text-pink-600" />
          <h2 className="text-2xl font-bold text-gray-800">إدارة المعرض</h2>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingImage(null);
            setFormData({ title: "", caption: "", category: "general", storageId: null, sendNotification: true });
            setPreviewUrl(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة صورة
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingImage) && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {editingImage ? "تعديل صورة" : "إضافة صورة جديدة"}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingImage(null);
                setPreviewUrl(null);
              }}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">العنوان *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 transition-all"
                  placeholder="أدخل عنوان الصورة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التعليق</label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 transition-all"
                  placeholder="أدخل تعليقاً على الصورة"
                />
              </div>

              {!editingImage && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendNotification"
                    checked={formData.sendNotification}
                    onChange={(e) => setFormData({ ...formData, sendNotification: e.target.checked })}
                    className="w-4 h-4 text-pink-600 rounded"
                  />
                  <label htmlFor="sendNotification" className="text-sm text-gray-700">
                    إرسال إشعار للمنخرطين
                  </label>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الصورة *</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadImage}
                accept="image/*"
                className="hidden"
              />
              
              {(previewUrl || editingImage?.url) ? (
                <div className="relative">
                  <img
                    src={previewUrl || editingImage?.url}
                    alt="معاينة"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  {!editingImage && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 px-3 py-1 bg-white/90 text-gray-700 rounded-lg text-sm hover:bg-white transition-all"
                    >
                      تغيير
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-pink-500 transition-all"
                >
                  {uploading ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-pink-600" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-gray-500">اضغط لرفع صورة</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingImage(null);
                setPreviewUrl(null);
              }}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={editingImage ? handleUpdate : handleAdd}
              disabled={saving || (!editingImage && !formData.storageId)}
              className="flex items-center gap-2 px-6 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {editingImage ? "تحديث" : "إضافة"}
            </button>
          </div>
        </div>
      )}

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <div key={image._id} className="bg-white rounded-2xl shadow-lg overflow-hidden group">
            <div className="relative h-48">
              <img
                src={image.url || ""}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                <button
                  onClick={() => startEdit(image)}
                  className="p-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleToggleVisibility(image)}
                  className="p-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  {image.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => handleDelete(image._id)}
                  className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              {!image.isActive && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                  مخفي
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-gray-800 truncate">{image.title}</h4>
              <p className="text-sm text-gray-500 mt-1">
                {CATEGORIES.find((c) => c.value === image.category)?.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد صور في المعرض</p>
        </div>
      )}
    </div>
  );
}

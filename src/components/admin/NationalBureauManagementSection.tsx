import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, X, Upload, RefreshCw, User, Users } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface NationalBureauManagementSectionProps {
  adminUsername: string;
}

export default function NationalBureauManagementSection({ adminUsername }: NationalBureauManagementSectionProps) {
  const members = useQuery(api.nationalBureau.listAllNationalBureauMembers, { adminUsername });
  const addMember = useMutation(api.nationalBureau.addNationalBureauMemberByAdmin);
  const updateMember = useMutation(api.nationalBureau.updateNationalBureauMemberByAdmin);
  const deleteMember = useMutation(api.nationalBureau.deleteNationalBureauMemberByAdmin);
  const generateUploadUrl = useMutation(api.nationalBureau.generateUploadUrl);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    position: "",
    bio: "",
    order: 1,
    photoId: null as any,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setFormData({ ...formData, photoId: storageId });
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      toast.error("فشل في رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.fullName || !formData.position) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setSaving(true);
      await addMember({
        adminUsername,
        fullName: formData.fullName,
        position: formData.position,
        bio: formData.bio || undefined,
        order: formData.order,
        photoId: formData.photoId || undefined,
      });
      toast.success("تم إضافة العضو بنجاح");
      setShowAddForm(false);
      setFormData({ fullName: "", position: "", bio: "", order: 1, photoId: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في إضافة العضو";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingMember) return;

    try {
      setSaving(true);
      await updateMember({
        adminUsername,
        memberId: editingMember._id,
        fullName: formData.fullName,
        position: formData.position,
        bio: formData.bio || undefined,
        order: formData.order,
        photoId: formData.photoId || undefined,
      });
      toast.success("تم تحديث العضو بنجاح");
      setEditingMember(null);
      setFormData({ fullName: "", position: "", bio: "", order: 1, photoId: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في تحديث العضو";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (memberId: Id<"nationalBureauMembers">) => {
    if (!confirm("هل أنت متأكد من حذف هذا العضو؟")) return;

    try {
      await deleteMember({ adminUsername, memberId });
      toast.success("تم حذف العضو بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في حذف العضو";
      toast.error(message);
    }
  };

  const handleToggleStatus = async (member: any) => {
    try {
      await updateMember({
        adminUsername,
        memberId: member._id,
        isActive: !member.isActive,
      });
      toast.success(member.isActive ? "تم إلغاء تفعيل العضو" : "تم تفعيل العضو");
    } catch (error) {
      toast.error("فشل في تغيير حالة العضو");
    }
  };

  const startEdit = (member: any) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName,
      position: member.position,
      bio: member.bio || "",
      order: member.order,
      photoId: member.photoId || null,
    });
    setShowAddForm(false);
  };

  if (!members) {
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
          <Users className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">إدارة المكتب الوطني</h2>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingMember(null);
            setFormData({ fullName: "", position: "", bio: "", order: (members?.length || 0) + 1, photoId: null });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة عضو
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingMember) && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {editingMember ? "تعديل عضو" : "إضافة عضو جديد"}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingMember(null);
                setFormData({ fullName: "", position: "", bio: "", order: 1, photoId: null });
              }}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                placeholder="أدخل الاسم الكامل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المنصب *</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                placeholder="أدخل المنصب"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الترتيب</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                min={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الصورة</label>
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
              >
                {uploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {uploading ? "جاري الرفع..." : formData.photoId ? "تم رفع الصورة ✓" : "رفع صورة"}
              </button>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">نبذة مختصرة</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                placeholder="أدخل نبذة مختصرة عن العضو"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingMember(null);
              }}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={editingMember ? handleUpdate : handleAdd}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {editingMember ? "تحديث" : "إضافة"}
            </button>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">الصورة</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">الاسم</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">المنصب</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">الترتيب</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">الحالة</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                      {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{member.fullName}</td>
                  <td className="px-6 py-4 text-gray-600">{member.position}</td>
                  <td className="px-6 py-4 text-gray-600">{member.order}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(member)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {member.isActive ? "نشط" : "غير نشط"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(member)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {members.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا يوجد أعضاء في المكتب الوطني</p>
          </div>
        )}
      </div>
    </div>
  );
}

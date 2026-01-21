import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Plus, Edit2, Save, X, RefreshCw, Shield, UserCheck, UserX } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface AdminsManagementSectionProps {
  adminUsername: string;
}

const ROLES = [
  { value: "super_admin", label: "مدير عام" },
  { value: "admin", label: "مسؤول" },
  { value: "editor", label: "محرر" },
  { value: "viewer", label: "مشاهد" },
];

export default function AdminsManagementSection({ adminUsername }: AdminsManagementSectionProps) {
  const admins = useQuery(api.adminManagement.getAllAdmins, { requestingUsername: adminUsername });
  const createAdmin = useMutation(api.adminManagement.createAdmin);
  const updatePermissions = useMutation(api.adminManagement.updateAdminPermissions);
  const toggleStatus = useMutation(api.adminManagement.toggleAdminStatus);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "admin",
    permissions: {
      canEditHomePage: false,
      canEditSecretaryGeneral: false,
      canEditNationalBureau: false,
      canManageAdmins: false,
      canViewStats: true,
      canManageMembers: false,
      canManageGallery: false,
      canManageActivities: false,
      canExportData: false,
      canSuspendMembers: false,
    },
  });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!formData.username || !formData.password || !formData.fullName) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setSaving(true);
      await createAdmin({
        requestingUsername: adminUsername,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        permissions: formData.permissions,
      });
      toast.success("تم إضافة المسؤول بنجاح");
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في إضافة المسؤول";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!editingAdmin) return;

    try {
      setSaving(true);
      await updatePermissions({
        requestingUsername: adminUsername,
        adminId: editingAdmin._id,
        permissions: formData.permissions,
        role: formData.role,
      });
      toast.success("تم تحديث الصلاحيات بنجاح");
      setEditingAdmin(null);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في تحديث الصلاحيات";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (adminId: Id<"admins">) => {
    try {
      await toggleStatus({ requestingUsername: adminUsername, adminId });
      toast.success("تم تغيير حالة المسؤول");
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في تغيير الحالة";
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      fullName: "",
      role: "admin",
      permissions: {
        canEditHomePage: false,
        canEditSecretaryGeneral: false,
        canEditNationalBureau: false,
        canManageAdmins: false,
        canViewStats: true,
        canManageMembers: false,
        canManageGallery: false,
        canManageActivities: false,
        canExportData: false,
        canSuspendMembers: false,
      },
    });
  };

  const startEdit = (admin: any) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      password: "",
      fullName: admin.fullName,
      role: admin.role,
      permissions: {
        canEditHomePage: admin.permissions.canEditHomePage,
        canEditSecretaryGeneral: admin.permissions.canEditSecretaryGeneral,
        canEditNationalBureau: admin.permissions.canEditNationalBureau,
        canManageAdmins: admin.permissions.canManageAdmins,
        canViewStats: admin.permissions.canViewStats,
        canManageMembers: admin.permissions.canManageMembers,
        canManageGallery: admin.permissions.canManageGallery || false,
        canManageActivities: admin.permissions.canManageActivities || false,
        canExportData: admin.permissions.canExportData || false,
        canSuspendMembers: admin.permissions.canSuspendMembers || false,
      },
    });
    setShowAddForm(false);
  };

  const togglePermission = (key: keyof typeof formData.permissions) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !formData.permissions[key],
      },
    });
  };

  if (!admins) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const permissionLabels: Record<string, string> = {
    canEditHomePage: "تعديل الصفحة الرئيسية",
    canEditSecretaryGeneral: "تعديل صفحة الأمين العام",
    canEditNationalBureau: "تعديل المكتب الوطني",
    canManageAdmins: "إدارة المسؤولين",
    canViewStats: "عرض الإحصائيات",
    canManageMembers: "إدارة المنخرطين",
    canManageGallery: "إدارة المعرض",
    canManageActivities: "إدارة الأنشطة",
    canExportData: "تصدير البيانات",
    canSuspendMembers: "تعليق المنخرطين",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">إدارة المسؤولين</h2>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingAdmin(null);
            resetForm();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة مسؤول
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingAdmin) && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {editingAdmin ? "تعديل صلاحيات المسؤول" : "إضافة مسؤول جديد"}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingAdmin(null);
                resetForm();
              }}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {!editingAdmin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all"
                    placeholder="أدخل اسم المستخدم"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all"
                    placeholder="أدخل كلمة المرور"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all"
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الدور</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all"
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">الصلاحيات</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => togglePermission(key as keyof typeof formData.permissions)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    formData.permissions[key as keyof typeof formData.permissions]
                      ? "bg-purple-100 text-purple-800 border-2 border-purple-300"
                      : "bg-gray-100 text-gray-600 border-2 border-transparent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingAdmin(null);
                resetForm();
              }}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={editingAdmin ? handleUpdatePermissions : handleAdd}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {editingAdmin ? "تحديث" : "إضافة"}
            </button>
          </div>
        </div>
      )}

      {/* Admins List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">الاسم</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">اسم المستخدم</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">الدور</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">الحالة</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{admin.fullName}</td>
                  <td className="px-6 py-4 text-gray-600">{admin.username}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {ROLES.find((r) => r.value === admin.role)?.label || admin.role}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      admin.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {admin.isActive ? "نشط" : "معطل"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(admin)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="تعديل الصلاحيات"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(admin._id)}
                        className={`p-2 rounded-lg transition-all ${
                          admin.isActive
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={admin.isActive ? "تعطيل" : "تفعيل"}
                      >
                        {admin.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

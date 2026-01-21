import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import {
  Users,
  Search,
  Edit,
  UserX,
  UserCheck,
  Download,
  Eye,
  X,
  Loader2,
  Filter,
  RefreshCw,
  Key,
  History,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";

interface MembersManagementSectionProps {
  adminUsername: string;
}

export default function MembersManagementSection({ adminUsername }: MembersManagementSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "inactive">("all");
  const [wilayaFilter, setWilayaFilter] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Queries
  const membersData = useQuery(api.memberManagement.listMembersForAdmin, {
    adminUsername,
    status: statusFilter === "all" ? undefined : statusFilter,
    wilaya: wilayaFilter || undefined,
    searchQuery: searchQuery || undefined,
    limit: 100,
  });

  const stats = useQuery(api.memberManagement.getMembersStats, { adminUsername });

  // Mutations
  const updateMember = useMutation(api.memberManagement.updateMemberByAdmin);
  const suspendMember = useMutation(api.memberManagement.suspendMember);
  const activateMember = useMutation(api.memberManagement.activateMember);
  const resetPassword = useMutation(api.memberManagement.resetMemberPassword);

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    wilaya: "",
    baladiya: "",
    address: "",
    memberType: "",
    role: "",
  });

  const handleOpenEdit = (member: any) => {
    setSelectedMember(member);
    setEditForm({
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      email: member.email || "",
      wilaya: member.wilaya,
      baladiya: member.baladiya,
      address: member.address,
      memberType: member.memberType || "militant",
      role: member.role,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMember) return;
    try {
      await updateMember({
        adminUsername,
        membershipNumber: selectedMember.membershipNumber,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        email: editForm.email || undefined,
        wilaya: editForm.wilaya,
        baladiya: editForm.baladiya,
        address: editForm.address,
        memberType: editForm.memberType as any,
        role: editForm.role as any,
      });
      toast.success("تم تحديث بيانات المنخرط بنجاح");
      setShowEditModal(false);
      setSelectedMember(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل تحديث البيانات";
      toast.error(message);
    }
  };

  const handleSuspend = async () => {
    if (!selectedMember || !suspensionReason) {
      toast.error("يرجى إدخال سبب التجميد");
      return;
    }
    try {
      await suspendMember({
        adminUsername,
        membershipNumber: selectedMember.membershipNumber,
        reason: suspensionReason,
      });
      toast.success("تم تجميد العضوية بنجاح");
      setShowSuspendModal(false);
      setSuspensionReason("");
      setSelectedMember(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل تجميد العضوية";
      toast.error(message);
    }
  };

  const handleActivate = async (member: any) => {
    try {
      await activateMember({
        adminUsername,
        membershipNumber: member.membershipNumber,
      });
      toast.success("تم إعادة تفعيل العضوية بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل إعادة التفعيل";
      toast.error(message);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedMember || !newPassword) {
      toast.error("يرجى إدخال كلمة المرور الجديدة");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    try {
      await resetPassword({
        adminUsername,
        membershipNumber: selectedMember.membershipNumber,
        newPassword,
      });
      toast.success("تم إعادة تعيين كلمة المرور بنجاح");
      setShowResetPasswordModal(false);
      setNewPassword("");
      setSelectedMember(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل إعادة تعيين كلمة المرور";
      toast.error(message);
    }
  };

  const handleExport = () => {
    if (!membersData?.members) return;
    
    const csvContent = [
      ["رقم العضوية", "الاسم", "اللقب", "الهاتف", "البريد", "الولاية", "البلدية", "الحالة"].join(","),
      ...membersData.members.map(m => [
        m.membershipNumber,
        m.firstName,
        m.lastName,
        m.phone,
        m.email || "",
        m.wilaya,
        m.baladiya,
        m.status === "active" ? "نشط" : m.status === "suspended" ? "مجمد" : "غير نشط"
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `members_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("تم تصدير البيانات بنجاح");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            نشط
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <XCircle className="w-3 h-3" />
            مجمد
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            غير نشط
          </span>
        );
    }
  };

  const memberTypeLabels: Record<string, string> = {
    militant: "مناضل",
    municipal_elected: "منتخب بلدي",
    wilaya_elected: "منتخب ولائي",
    apn_elected: "نائب برلماني",
    senate_elected: "عضو مجلس الأمة",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Users className="w-7 h-7 text-green-600" />
          إدارة المنخرطين
        </h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          تصدير CSV
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            <p className="text-blue-600 text-sm">إجمالي المنخرطين</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{stats.active}</p>
            <p className="text-green-600 text-sm">نشط</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-700">{stats.suspended}</p>
            <p className="text-red-600 text-sm">مجمد</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-purple-700">{stats.male + stats.female > 0 ? Math.round((stats.female / (stats.male + stats.female)) * 100) : 0}%</p>
            <p className="text-purple-600 text-sm">نسبة الإناث</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو رقم العضوية..."
              className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="suspended">مجمد</option>
            <option value="inactive">غير نشط</option>
          </select>
          <input
            type="text"
            value={wilayaFilter}
            onChange={(e) => setWilayaFilter(e.target.value)}
            placeholder="تصفية حسب الولاية..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
          />
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setWilayaFilter("");
            }}
            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            إعادة تعيين
          </button>
        </div>
      </div>

      {/* Members Table */}
      {membersData === undefined ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : membersData.members.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">لا يوجد منخرطين مطابقين للبحث</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-4 text-start">
            عرض {membersData.members.length} من {membersData.total} منخرط
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full">
              <thead className="bg-gradient-to-b from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">المنخرط</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">رقم العضوية</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">الهاتف</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">الولاية</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">الحالة</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {membersData.members.map((member: any) => (
                  <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={member.fullName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                            {member.firstName[0]}
                          </div>
                        )}
                        <div className="text-start">
                          <p className="font-medium text-gray-900">{member.fullName}</p>
                          <p className="text-sm text-gray-500">{member.email || "بدون بريد"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 font-mono">{member.membershipNumber}</td>
                    <td className="px-4 py-4 text-sm text-gray-600" dir="ltr">{member.phone}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{member.wilaya}</td>
                    <td className="px-4 py-4">{getStatusBadge(member.status)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowCVModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="السيرة الذاتية"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowResetPasswordModal(true);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="إعادة تعيين كلمة المرور"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        {member.status === "active" ? (
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowSuspendModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="تجميد العضوية"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(member)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="إعادة التفعيل"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">تعديل بيانات المنخرط</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الاسم</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">اللقب</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الهاتف</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الولاية</label>
                  <input
                    type="text"
                    value={editForm.wilaya}
                    onChange={(e) => setEditForm({ ...editForm, wilaya: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">البلدية</label>
                  <input
                    type="text"
                    value={editForm.baladiya}
                    onChange={(e) => setEditForm({ ...editForm, baladiya: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">العنوان</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">نوع المنخرط</label>
                  <select
                    value={editForm.memberType}
                    onChange={(e) => setEditForm({ ...editForm, memberType: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500"
                  >
                    <option value="militant">مناضل</option>
                    <option value="municipal_elected">منتخب بلدي</option>
                    <option value="wilaya_elected">منتخب ولائي</option>
                    <option value="apn_elected">نائب برلماني</option>
                    <option value="senate_elected">عضو مجلس الأمة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الدور</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500"
                  >
                    <option value="member">عضو</option>
                    <option value="coordinator">منسق</option>
                    <option value="admin">مسؤول</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:shadow-xl transition-all"
              >
                حفظ التعديلات
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-xl font-bold">تجميد العضوية</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 text-start">
                أنت على وشك تجميد عضوية <strong>{selectedMember.fullName}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">سبب التجميد *</label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  rows={3}
                  placeholder="أدخل سبب تجميد العضوية..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={handleSuspend}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all"
              >
                تأكيد التجميد
              </button>
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspensionReason("");
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 text-purple-600">
                <Key className="w-6 h-6" />
                <h3 className="text-xl font-bold">إعادة تعيين كلمة المرور</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 text-start">
                إعادة تعيين كلمة مرور <strong>{selectedMember.fullName}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">كلمة المرور الجديدة *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={handleResetPassword}
                className="flex-1 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all"
              >
                تأكيد
              </button>
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setNewPassword("");
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">تفاصيل المنخرط</h3>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                {selectedMember.photoUrl ? (
                  <img src={selectedMember.photoUrl} alt={selectedMember.fullName} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedMember.firstName[0]}
                  </div>
                )}
                <div className="text-start">
                  <h4 className="text-xl font-bold text-gray-800">{selectedMember.fullName}</h4>
                  <p className="text-gray-500">{selectedMember.fullNameLatin}</p>
                  <p className="text-green-600 font-mono">{selectedMember.membershipNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-start">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">الهاتف</p>
                  <p className="font-medium" dir="ltr">{selectedMember.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                  <p className="font-medium">{selectedMember.email || "غير محدد"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">الولاية</p>
                  <p className="font-medium">{selectedMember.wilaya}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">البلدية</p>
                  <p className="font-medium">{selectedMember.baladiya}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">العنوان</p>
                  <p className="font-medium">{selectedMember.address}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">نوع المنخرط</p>
                  <p className="font-medium">{memberTypeLabels[selectedMember.memberType] || "مناضل"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">تاريخ الانخراط</p>
                  <p className="font-medium">{new Date(selectedMember.joinDate).toLocaleDateString("ar-DZ")}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">الحالة</p>
                  {getStatusBadge(selectedMember.status)}
                </div>
              </div>

              {selectedMember.status === "suspended" && selectedMember.suspensionReason && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-start">
                  <p className="text-sm text-red-600 font-medium">سبب التجميد:</p>
                  <p className="text-red-800">{selectedMember.suspensionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CV Modal */}
      {showCVModal && selectedMember && (
        <CVPreviewModal
          membershipNumber={selectedMember.membershipNumber}
          memberName={selectedMember.fullName}
          onClose={() => setShowCVModal(false)}
        />
      )}
    </div>
  );
}

// مكون معاينة السيرة الذاتية
function CVPreviewModal({ membershipNumber, memberName, onClose }: { membershipNumber: string; memberName: string; onClose: () => void }) {
  const cv = useQuery(api.memberCV.getCV, { membershipNumber });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " بايت";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " كيلوبايت";
    return (bytes / (1024 * 1024)).toFixed(2) + " ميجابايت";
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">السيرة الذاتية</h3>
            <p className="text-gray-500">{memberName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {cv === undefined ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : cv === null ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">لم يقم هذا المنخرط برفع سيرته الذاتية بعد</p>
          </div>
        ) : (
          <>
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-start">
                    <p className="font-medium text-gray-900">{cv.fileName}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(cv.fileSize)} • رُفع في {formatDate(cv.uploadedAt)}
                    </p>
                  </div>
                </div>
                <a
                  href={cv.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  تحميل
                </a>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={cv.url || ""}
                className="w-full h-full min-h-[500px]"
                title="معاينة السيرة الذاتية"
              />
            </div>
          </>
        )}

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

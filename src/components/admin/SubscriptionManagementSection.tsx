import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  Receipt,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Search,
  Filter,
  Eye,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  DollarSign,
  FileText,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";

// أنواع الاشتراكات
const SUBSCRIPTION_TYPES = {
  type_1: { amount: 1000, label: "الاشتراك 01", description: "1,000 دج" },
  type_2: { amount: 3000, label: "الاشتراك 02", description: "3,000 دج" },
  type_3: { amount: 10000, label: "الاشتراك 03", description: "10,000 دج" },
  type_4: { amount: 200000, label: "الاشتراك 04", description: "200,000 دج" },
};

export default function SubscriptionManagementSection() {
  const [activeTab, setActiveTab] = useState<"stats" | "receipts" | "paid" | "unpaid">("stats");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // الحصول على البيانات
  const stats = useQuery(api.subscriptionReceipts.getSubscriptionStats, {
    year: selectedYear,
    wilaya: selectedWilaya || undefined,
  });

  const receipts = useQuery(api.subscriptionReceipts.getAllReceipts, {
    year: selectedYear,
    status: statusFilter === "all" ? undefined : statusFilter,
    wilaya: selectedWilaya || undefined,
  });

  const paidMembers = useQuery(api.subscriptionReceipts.getPaidMembers, {
    year: selectedYear,
    wilaya: selectedWilaya || undefined,
  });

  const unpaidMembers = useQuery(api.subscriptionReceipts.getUnpaidMembers, {
    year: selectedYear,
    wilaya: selectedWilaya || undefined,
  });

  // الدوال
  const verifyReceipt = useMutation(api.subscriptionReceipts.verifyReceipt);
  const rejectReceipt = useMutation(api.subscriptionReceipts.rejectReceipt);
  const confirmPaymentManually = useMutation(api.subscriptionReceipts.confirmPaymentManually);

  const adminData = typeof window !== "undefined" ? sessionStorage.getItem("adminData") : null;
  const admin = adminData ? JSON.parse(adminData) : null;

  // تنسيق التاريخ
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // التحقق من الوثيقة
  const handleVerify = async (receiptId: Id<"subscriptionReceipts">) => {
    if (!admin) return;
    setIsProcessing(true);
    try {
      await verifyReceipt({ receiptId, adminUsername: admin.username });
      toast.success("تم التحقق من الوثيقة بنجاح");
      setSelectedReceipt(null);
    } catch (error) {
      toast.error("حدث خطأ أثناء التحقق");
    } finally {
      setIsProcessing(false);
    }
  };

  // رفض الوثيقة
  const handleReject = async () => {
    if (!admin || !selectedReceipt || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await rejectReceipt({
        receiptId: selectedReceipt._id,
        adminUsername: admin.username,
        reason: rejectReason,
      });
      toast.success("تم رفض الوثيقة");
      setShowRejectModal(false);
      setSelectedReceipt(null);
      setRejectReason("");
    } catch (error) {
      toast.error("حدث خطأ أثناء الرفض");
    } finally {
      setIsProcessing(false);
    }
  };

  // تأكيد التسديد يدوياً
  const handleManualConfirm = async (membershipNumber: string) => {
    if (!admin) return;
    try {
      await confirmPaymentManually({
        membershipNumber,
        adminUsername: admin.username,
        year: selectedYear,
      });
      toast.success("تم تأكيد التسديد بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء التأكيد");
    }
  };

  // تحميل الوثائق جماعياً
  const handleBulkDownload = async () => {
    if (!paidMembers || paidMembers.length === 0) {
      toast.error("لا توجد وثائق للتحميل");
      return;
    }

    const receiptsWithUrls = paidMembers.filter((m) => m.receiptUrl);
    if (receiptsWithUrls.length === 0) {
      toast.error("لا توجد وثائق مرفوعة للتحميل");
      return;
    }

    toast.info(`جاري تحميل ${receiptsWithUrls.length} وثيقة...`);

    for (const member of receiptsWithUrls) {
      if (member.receiptUrl) {
        const link = document.createElement("a");
        link.href = member.receiptUrl;
        link.download = `وصل_${member.membershipNumber}_${selectedYear}.jpg`;
        link.click();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    toast.success("تم تحميل جميع الوثائق");
  };

  // تصفية النتائج
  const filteredReceipts = receipts?.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.membershipNumber.toLowerCase().includes(query) ||
      r.member?.firstName?.toLowerCase().includes(query) ||
      r.member?.lastName?.toLowerCase().includes(query)
    );
  });

  const filteredPaidMembers = paidMembers?.filter((m) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.membershipNumber.toLowerCase().includes(query) ||
      m.firstName.toLowerCase().includes(query) ||
      m.lastName.toLowerCase().includes(query)
    );
  });

  const filteredUnpaidMembers = unpaidMembers?.filter((m) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.membershipNumber.toLowerCase().includes(query) ||
      m.firstName.toLowerCase().includes(query) ||
      m.lastName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* العنوان */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
          <Receipt className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الاشتراكات</h2>
          <p className="text-gray-600">متابعة حالة تسديد الاشتراكات السنوية</p>
        </div>
      </div>

      {/* الفلاتر */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">السنة</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">البحث</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="رقم العضوية أو الاسم..."
                className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "stats", label: "الإحصائيات", icon: TrendingUp },
          { id: "receipts", label: "الوثائق المرفوعة", icon: FileText },
          { id: "paid", label: "المسددين", icon: CheckCircle },
          { id: "unpaid", label: "غير المسددين", icon: XCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* المحتوى */}
      {activeTab === "stats" && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="إجمالي المنخرطين"
              value={stats.totalMembers}
              color="blue"
            />
            <StatCard
              icon={CheckCircle}
              label="المسددين"
              value={stats.paidMembers}
              subValue={`${stats.paymentRate}%`}
              color="green"
            />
            <StatCard
              icon={XCircle}
              label="غير المسددين"
              value={stats.unpaidMembers}
              color="red"
            />
            <StatCard
              icon={DollarSign}
              label="إجمالي المبالغ"
              value={`${stats.totalAmount.toLocaleString("ar-DZ")} دج`}
              color="yellow"
            />
          </div>

          {/* حالة الوثائق */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">حالة الوثائق المرفوعة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-700">{stats.pendingReceipts}</p>
                    <p className="text-yellow-600">في انتظار التحقق</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-700">{stats.verifiedReceipts}</p>
                    <p className="text-green-600">تم التحقق</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-red-700">{stats.rejectedReceipts}</p>
                    <p className="text-red-600">مرفوضة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* إحصائيات حسب نوع الاشتراك */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">توزيع أنواع الاشتراكات</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(SUBSCRIPTION_TYPES).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.byType[key as keyof typeof stats.byType]}
                  </p>
                  <p className="text-sm text-gray-600">{value.label}</p>
                  <p className="text-xs text-gray-500">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "receipts" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* فلتر الحالة */}
          <div className="flex gap-2">
            {[
              { id: "all", label: "الكل" },
              { id: "pending", label: "في الانتظار" },
              { id: "verified", label: "تم التحقق" },
              { id: "rejected", label: "مرفوضة" },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => setStatusFilter(status.id as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  statusFilter === status.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>

          {/* جدول الوثائق */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">رقم العضوية</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الاسم</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الولاية</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">نوع الاشتراك</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">المبلغ</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الحالة</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReceipts?.map((receipt) => (
                    <tr key={receipt._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">{receipt.membershipNumber}</td>
                      <td className="px-4 py-3">
                        {receipt.member?.lastName} {receipt.member?.firstName}
                      </td>
                      <td className="px-4 py-3 text-sm">{receipt.member?.wilaya}</td>
                      <td className="px-4 py-3 text-sm">
                        {SUBSCRIPTION_TYPES[receipt.subscriptionType as keyof typeof SUBSCRIPTION_TYPES]?.label}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">
                        {receipt.amount.toLocaleString("ar-DZ")} دج
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={receipt.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(receipt.url || "", "_blank")}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="عرض الوثيقة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {receipt.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleVerify(receipt._id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="تأكيد"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedReceipt(receipt);
                                  setShowRejectModal(true);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="رفض"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              if (receipt.url) {
                                const link = document.createElement("a");
                                link.href = receipt.url;
                                link.download = `وصل_${receipt.membershipNumber}_${receipt.year}.jpg`;
                                link.click();
                              }
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="تحميل"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!filteredReceipts || filteredReceipts.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد وثائق</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === "paid" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* زر التحميل الجماعي */}
          <div className="flex justify-end">
            <button
              onClick={handleBulkDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-5 h-5" />
              تحميل جميع الوثائق
            </button>
          </div>

          {/* جدول المسددين */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">رقم العضوية</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الاسم</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الولاية</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">نوع الاشتراك</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">تاريخ التسديد</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الوثيقة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPaidMembers?.map((member) => (
                    <tr key={member.membershipNumber} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">{member.membershipNumber}</td>
                      <td className="px-4 py-3">{member.lastName} {member.firstName}</td>
                      <td className="px-4 py-3 text-sm">{member.wilaya}</td>
                      <td className="px-4 py-3 text-sm">
                        {SUBSCRIPTION_TYPES[member.subscriptionType as keyof typeof SUBSCRIPTION_TYPES]?.label}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {member.paidAt ? formatDate(member.paidAt) : "---"}
                      </td>
                      <td className="px-4 py-3">
                        {member.receiptUrl ? (
                          <button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = member.receiptUrl!;
                              link.download = `وصل_${member.membershipNumber}_${selectedYear}.jpg`;
                              link.click();
                            }}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-4 h-4" />
                            تحميل
                          </button>
                        ) : (
                          <span className="text-gray-400">لا توجد وثيقة</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!filteredPaidMembers || filteredPaidMembers.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا يوجد منخرطين مسددين</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === "unpaid" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* جدول غير المسددين */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">رقم العضوية</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الاسم</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الولاية</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الهاتف</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">نوع الاشتراك</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUnpaidMembers?.map((member) => (
                    <tr key={member.membershipNumber} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">{member.membershipNumber}</td>
                      <td className="px-4 py-3">{member.lastName} {member.firstName}</td>
                      <td className="px-4 py-3 text-sm">{member.wilaya}</td>
                      <td className="px-4 py-3 text-sm" dir="ltr">{member.phone}</td>
                      <td className="px-4 py-3 text-sm">
                        {SUBSCRIPTION_TYPES[member.subscriptionType as keyof typeof SUBSCRIPTION_TYPES]?.label}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleManualConfirm(member.membershipNumber)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                        >
                          <Check className="w-4 h-4" />
                          تأكيد التسديد
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!filteredUnpaidMembers || filteredUnpaidMembers.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>جميع المنخرطين قاموا بالتسديد</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* نافذة الرفض */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">رفض الوثيقة</h3>
            <p className="text-gray-600 mb-4">
              يرجى إدخال سبب رفض وثيقة المنخرط: {selectedReceipt?.membershipNumber}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="سبب الرفض..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isProcessing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? "جاري الرفض..." : "تأكيد الرفض"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// مكون بطاقة الإحصائيات
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  color: "blue" | "green" | "red" | "yellow";
}) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    yellow: "from-yellow-500 to-yellow-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 bg-gradient-to-br ${colors[color]} rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subValue && <p className="text-sm text-green-600 font-bold">{subValue}</p>}
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

// مكون شارة الحالة
function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    verified: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const labels = {
    pending: "في الانتظار",
    verified: "تم التحقق",
    rejected: "مرفوضة",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
}

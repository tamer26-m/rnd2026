import { motion } from "framer-motion";
import { User, Phone, MapPin, Calendar, CreditCard, Edit, Bell, Award, Image as ImageIcon, Activity, Mail, Users, FileText, Globe, CheckCircle, Building, Briefcase, Receipt, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import CVUploadSection from "./CVUploadSection";
import SubscriptionUploadSection from "./SubscriptionUploadSection";

type Page = "home" | "activities" | "members" | "dashboard" | "gallery" | "register" | "login" | "updateProfile" | "memberCard" | "updatePhoto" | "myPoliticalActivities" | "subscriptionReceipt";

export default function DashboardPage({ member, setCurrentPage }: { member: any; setCurrentPage: (page: Page) => void }) {

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "غير محدد";
    return new Date(timestamp).toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMemberTypeLabel = (type: string | undefined) => {
    if (!type) return "غير محدد";
    const types: Record<string, string> = {
      militant: "مناضل",
      municipal_elected: "منتخب بلدي",
      wilaya_elected: "منتخب ولائي",
      apn_elected: "منتخب مجلس شعبي وطني",
      senate_elected: "منتخب مجلس الأمة",
    };
    return types[type] || "غير محدد";
  };

  const getStructuralPositionLabel = (position: string | undefined) => {
    if (!position) return "غير محدد";
    const positions: Record<string, string> = {
      militant: "مناضل",
      municipal_bureau_member: "عضو مكتب بلدي",
      wilaya_bureau_member: "عضو مكتب ولائي",
      national_bureau_member: "عضو مكتب وطني",
    };
    return positions[position] || "غير محدد";
  };

  const getAdministrativePositionLabel = (position: string | undefined) => {
    if (!position) return "غير محدد";
    const positions: Record<string, string> = {
      militant: "مناضل",
      municipal_secretary: "أمين بلدي",
      wilaya_secretary: "أمين ولائي",
    };
    return positions[position] || "غير محدد";
  };

  const getPositionLabel = (position: string | undefined) => {
    if (!position) return "غير محدد";
    const positions: Record<string, string> = {
      municipal_president: "رئيس مجلس شعبي بلدي",
      wilaya_president: "رئيس مجلس شعبي ولائي",
    };
    return positions[position] || "غير محدد";
  };

  const getSubscriptionLabel = (type: string | undefined) => {
    if (!type) return "غير محدد";
    const labels: Record<string, string> = {
      type_1: "الاشتراك 01 - 1,000 دج",
      type_2: "الاشتراك 02 - 3,000 دج",
      type_3: "الاشتراك 03 - 10,000 دج",
      type_4: "الاشتراك 04 - 200,000 دج",
    };
    return labels[type] || "غير محدد";
  };

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 text-start">
            مرحباً، {member.fullName}
          </h1>
          <p className="text-xl text-gray-600 text-start">
            لوحة التحكم الشخصية
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* البطاقة الشخصية */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
            <div className="text-center mb-6">
              {member.profilePhotoUrl ? (
                <img
                  src={member.profilePhotoUrl}
                  alt="الصورة الشخصية"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg border-4 border-green-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{member.fullName}</h2>
              {member.fullNameLatin && (
                <p className="text-gray-500 text-sm mb-2" dir="ltr">{member.fullNameLatin}</p>
              )}
              <p className="text-gray-600 font-mono text-lg" dir="ltr">{member.membershipNumber}</p>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold mt-3 ${
                member.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}>
                {member.status === "active" ? "✅ نشط" : "⏸️ غير نشط"}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <InfoRow icon={Phone} label="الهاتف" value={member.phone} />
              <InfoRow icon={Mail} label="البريد الإلكتروني" value={member.email || "غير محدد"} />
              <InfoRow icon={Globe} label="الدولة" value={member.country || "الجزائر"} />
              <InfoRow icon={MapPin} label="الولاية" value={member.wilaya} />
              {member.daira && <InfoRow icon={MapPin} label="الدائرة" value={member.daira} />}
              <InfoRow icon={MapPin} label="البلدية" value={member.baladiya} />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setCurrentPage("memberCard")}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                عرض بطاقة المنخرط
              </button>
              
              <button
                onClick={() => setCurrentPage("updatePhoto")}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-5 h-5" />
                تحديث الصورة الشخصية
              </button>

              <button
                onClick={() => setCurrentPage("myPoliticalActivities" as any)}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Activity className="w-5 h-5" />
                أنشطتي السياسية
              </button>

              <button
                onClick={() => setCurrentPage("updateProfile")}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-5 h-5" />
                تحديث المعلومات
              </button>

              {member.subscriptionType && (
                <button
                  onClick={() => setCurrentPage("subscriptionReceipt" as any)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Receipt className="w-5 h-5" />
                  تحميل وصل الاشتراك
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* المحتوى الرئيسي */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* قسم رفع وثيقة تسديد الاشتراك */}
          {member.subscriptionType && (
            <SubscriptionUploadSection membershipNumber={member.membershipNumber} />
          )}

          {/* قسم السيرة الذاتية */}
          <CVUploadSection membershipNumber={member.membershipNumber} />

          {/* المعلومات الشخصية */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">المعلومات الشخصية</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard label="الاسم (بالعربية)" value={member.firstName} />
              <DetailCard label="اللقب (بالعربية)" value={member.lastName} />
              <DetailCard label="الاسم (باللاتينية)" value={member.firstNameLatin || "غير محدد"} />
              <DetailCard label="اللقب (باللاتينية)" value={member.lastNameLatin || "غير محدد"} />
              <DetailCard label="رقم التعريف الوطني (NIN)" value={member.nin} isCode />
              <DetailCard label="الجنس" value={member.gender === "male" ? "ذكر" : member.gender === "female" ? "أنثى" : "غير محدد"} />
              <DetailCard label="تاريخ الميلاد" value={formatDate(member.birthDate)} />
              <DetailCard label="مكان الازدياد" value={member.birthPlace || "غير محدد"} />
            </div>
          </div>

          {/* معلومات الاتصال والعنوان */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">معلومات الاتصال والعنوان</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard label="رقم الهاتف" value={member.phone} isCode />
              <DetailCard label="البريد الإلكتروني" value={member.email || "غير محدد"} />
              <DetailCard label="الدولة" value={member.country || "الجزائر"} />
              <DetailCard label="الولاية" value={member.wilaya} />
              <DetailCard label="الدائرة" value={member.daira || "غير محدد"} />
              <DetailCard label="البلدية" value={member.baladiya} />
              <div className="md:col-span-2">
                <DetailCard label="العنوان" value={member.address || "غير محدد"} />
              </div>
            </div>
          </div>

          {/* معلومات العضوية */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">معلومات العضوية</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard label="رقم العضوية" value={member.membershipNumber} isCode highlight />
              <DetailCard label="تاريخ الانضمام" value={formatDate(member.joinDate)} />
              <DetailCard label="سنة أول انخراط" value={member.firstJoinYear?.toString() || "غير محدد"} />
              <DetailCard label="حالة العضوية" value={member.status === "active" ? "نشط ✅" : "غير نشط ⏸️"} />
            </div>
          </div>

          {/* معلومات الاشتراك السنوي */}
          {member.subscriptionType && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-6 border border-yellow-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">الاشتراك السنوي</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard label="نوع الاشتراك" value={getSubscriptionLabel(member.subscriptionType)} />
                <DetailCard label="سنة الاشتراك" value={member.subscriptionYear?.toString() || new Date().getFullYear().toString()} />
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setCurrentPage("subscriptionReceipt" as any)}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  تحميل وصل تسديد الاشتراك
                </button>
              </div>
            </div>
          )}

          {/* معلومات بطاقة الناخب */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">معلومات بطاقة الناخب</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard label="رقم بطاقة الانتخاب" value={member.electoralCardNumber || "غير محدد"} isCode />
              <DetailCard label="تاريخ إصدار البطاقة" value={formatDate(member.electoralCardIssueDate)} />
            </div>
          </div>

          {/* الصفات والمناصب */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">الصفات والمناصب</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard label="الصفة السياسية" value={getMemberTypeLabel(member.memberType)} />
              <DetailCard label="الصفة الهيكلية" value={getStructuralPositionLabel(member.structuralPosition)} />
              <DetailCard label="الصفة الإدارية" value={getAdministrativePositionLabel(member.administrativePosition)} />
              <DetailCard label="الوظيفة" value={getPositionLabel(member.position)} />
              <div className="md:col-span-2">
                <div className={`p-4 rounded-xl ${member.isNationalCouncilMember ? "bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.isNationalCouncilMember ? "bg-green-500" : "bg-gray-300"}`}>
                      {member.isNationalCouncilMember ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Users className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">عضوية المجلس الوطني</p>
                      <p className={`font-bold ${member.isNationalCouncilMember ? "text-green-700" : "text-gray-500"}`}>
                        {member.isNationalCouncilMember ? "عضو في المجلس الوطني ✅" : "ليس عضواً في المجلس الوطني"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ملاحظة التحديث */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-2">هل تريد تحديث بياناتك؟</h4>
                <p className="text-blue-700 text-sm mb-4">
                  يمكنك تحديث معلوماتك الشخصية مثل رقم الهاتف والعنوان والولاية والبلدية من خلال صفحة تحديث المعلومات.
                </p>
                <button
                  onClick={() => setCurrentPage("updateProfile")}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  تحديث المعلومات الآن
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-start">
      <Icon className="w-5 h-5 text-gray-400" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value || "غير محدد"}</p>
      </div>
    </div>
  );
}

function DetailCard({ label, value, isCode, highlight }: { label: string; value: string; isCode?: boolean; highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-xl ${highlight ? "bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200" : "bg-gray-50"}`}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`font-bold ${highlight ? "text-green-700 text-lg" : "text-gray-900"} ${isCode ? "font-mono" : ""}`} dir={isCode ? "ltr" : "rtl"}>
        {value || "غير محدد"}
      </p>
    </div>
  );
}

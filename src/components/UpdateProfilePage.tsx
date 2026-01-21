import { useState, useEffect, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Phone, MapPin, Save, ArrowLeft, User, Calendar, CreditCard, Award, Globe, FileText, GraduationCap, Briefcase, Users } from "lucide-react";
import DateInput from "./DateInput";
import { toast } from "sonner";
import { WILAYA_OPTIONS, getCommunesByWilaya } from "../data/algeriaGeoData";

const COMMON_COUNTRIES = [
  "الجزائر", "فرنسا", "كندا", "الولايات المتحدة", "المملكة المتحدة", "ألمانيا",
  "إسبانيا", "إيطاليا", "بلجيكا", "هولندا", "السويد", "سويسرا",
  "الإمارات العربية المتحدة", "السعودية", "قطر", "الكويت", "تونس", "المغرب", "مصر",
];

type Page = "home" | "activities" | "members" | "dashboard" | "gallery" | "register" | "login" | "updateProfile";

type MemberType = "militant" | "municipal_elected" | "wilaya_elected" | "apn_elected" | "senate_elected";
type StructuralPosition = "militant" | "municipal_bureau_member" | "wilaya_bureau_member" | "national_bureau_member";
type AdministrativePosition = "militant" | "municipal_secretary" | "wilaya_secretary";
type Position = "municipal_president" | "wilaya_president";
type Gender = "male" | "female";
type EducationLevel = "none" | "primary" | "secondary" | "university" | "postgraduate";
type Profession = "unemployed" | "student" | "employee" | "freelancer" | "farmer" | "other";

export default function UpdateProfilePage({ setCurrentPage }: { setCurrentPage: (page: Page) => void }) {
  const currentMemberData = typeof window !== 'undefined' ? sessionStorage.getItem("currentMember") : null;
  const currentMember = currentMemberData ? JSON.parse(currentMemberData) : null;
  
  const updatePersonalInfo = useMutation(api.members.updatePersonalInfo);

  const [formData, setFormData] = useState({
    // الاسم باللاتينية (قابل للتعديل)
    firstNameLatin: "",
    lastNameLatin: "",
    // رقم التعريف الوطني
    nin: "",
    // البريد الإلكتروني
    email: "",
    // العنوان
    address: "",
    country: "",
    wilayaCode: "",
    baladiya: "",
    // بطاقة الناخب
    electoralCardNumber: "",
    electoralCardIssueDate: "",
    // معلومات شخصية
    gender: "",
    birthDate: "",
    birthPlace: "",
    // المستوى التعليمي والمهنة
    educationLevel: "",
    profession: "",
    professionDetails: "",
    // الصفات والمناصب
    memberType: "",
    structuralPosition: "",
    administrativePosition: "",
    isNationalCouncilMember: false,
    position: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);

  const availableCommunes = useMemo(() => {
    if (!formData.wilayaCode) return [];
    return getCommunesByWilaya(formData.wilayaCode);
  }, [formData.wilayaCode]);

  useEffect(() => {
    if (currentMember) {
      const isAlgeria = currentMember.country === "الجزائر" || !currentMember.country;
      setShowWilayaDropdown(isAlgeria);
      
      // البحث عن رمز الولاية من الاسم
      const wilayaOption = WILAYA_OPTIONS.find(w => w.label === currentMember.wilaya);
      
      setFormData({
        firstNameLatin: currentMember.firstNameLatin || "",
        lastNameLatin: currentMember.lastNameLatin || "",
        nin: currentMember.nin || "",
        email: currentMember.email || "",
        address: currentMember.address || "",
        country: currentMember.country || "الجزائر",
        wilayaCode: wilayaOption?.code || "",
        baladiya: currentMember.baladiya || "",
        electoralCardNumber: currentMember.electoralCardNumber || "",
        electoralCardIssueDate: currentMember.electoralCardIssueDate ? new Date(currentMember.electoralCardIssueDate).toISOString().split('T')[0] : "",
        gender: currentMember.gender || "",
        birthDate: currentMember.birthDate ? new Date(currentMember.birthDate).toISOString().split('T')[0] : "",
        birthPlace: currentMember.birthPlace || "",
        educationLevel: currentMember.educationLevel || "",
        profession: currentMember.profession || "",
        professionDetails: currentMember.professionDetails || "",
        memberType: currentMember.memberType || "",
        structuralPosition: currentMember.structuralPosition || "",
        administrativePosition: currentMember.administrativePosition || "",
        isNationalCouncilMember: currentMember.isNationalCouncilMember || false,
        position: currentMember.position || "",
      });
    }
  }, []);

  const handleCountryChange = (country: string) => {
    setFormData({ ...formData, country, wilayaCode: "", baladiya: "" });
    setShowWilayaDropdown(country === "الجزائر");
  };

  const handleWilayaChange = (wilayaCode: string) => {
    setFormData({ ...formData, wilayaCode, baladiya: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMember?.membershipNumber) {
      toast.error("يرجى تسجيل الدخول أولاً");
      setCurrentPage("login");
      return;
    }

    const selectedWilaya = WILAYA_OPTIONS.find(w => w.code === formData.wilayaCode);
    
    const wilayaName = showWilayaDropdown ? (selectedWilaya?.label || "") : formData.wilayaCode;
    
    setIsSubmitting(true);
    try {
      await updatePersonalInfo({
        membershipNumber: currentMember.membershipNumber,
        // الاسم باللاتينية
        firstNameLatin: formData.firstNameLatin || undefined,
        lastNameLatin: formData.lastNameLatin || undefined,
        // رقم التعريف الوطني
        nin: formData.nin || undefined,
        // البريد الإلكتروني
        email: formData.email || undefined,
        // العنوان
        address: formData.address,
        country: formData.country,
        wilaya: wilayaName,
        baladiya: formData.baladiya,
        // بطاقة الناخب
        electoralCardNumber: formData.electoralCardNumber || undefined,
        electoralCardIssueDate: formData.electoralCardIssueDate ? new Date(formData.electoralCardIssueDate).getTime() : undefined,
        // معلومات شخصية
        gender: (formData.gender || undefined) as Gender | undefined,
        birthDate: formData.birthDate ? new Date(formData.birthDate).getTime() : undefined,
        birthPlace: formData.birthPlace || undefined,
        // المستوى التعليمي والمهنة
        educationLevel: (formData.educationLevel || undefined) as EducationLevel | undefined,
        profession: (formData.profession || undefined) as Profession | undefined,
        professionDetails: formData.professionDetails || undefined,
        // الصفات والمناصب
        memberType: (formData.memberType || undefined) as MemberType | undefined,
        structuralPosition: (formData.structuralPosition || undefined) as StructuralPosition | undefined,
        administrativePosition: (formData.administrativePosition || undefined) as AdministrativePosition | undefined,
        isNationalCouncilMember: formData.isNationalCouncilMember,
        position: (formData.position || undefined) as Position | undefined,
      });
      
      toast.success("تم تحديث معلوماتك بنجاح! ✅");
      
      // تحديث البيانات في sessionStorage
      const updatedMember = { 
        ...currentMember, 
        firstNameLatin: formData.firstNameLatin,
        lastNameLatin: formData.lastNameLatin,
        nin: formData.nin,
        email: formData.email,
        address: formData.address,
        country: formData.country,
        wilaya: wilayaName,
        baladiya: formData.baladiya,
        electoralCardNumber: formData.electoralCardNumber,
        electoralCardIssueDate: formData.electoralCardIssueDate ? new Date(formData.electoralCardIssueDate).getTime() : undefined,
        gender: formData.gender,
        birthDate: formData.birthDate ? new Date(formData.birthDate).getTime() : undefined,
        birthPlace: formData.birthPlace,
        educationLevel: formData.educationLevel,
        profession: formData.profession,
        professionDetails: formData.professionDetails,
        memberType: formData.memberType,
        structuralPosition: formData.structuralPosition,
        administrativePosition: formData.administrativePosition,
        isNationalCouncilMember: formData.isNationalCouncilMember,
        position: formData.position,
      };
      sessionStorage.setItem("currentMember", JSON.stringify(updatedMember));
      
      setTimeout(() => setCurrentPage("dashboard"), 1500);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء التحديث");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentMember) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">يرجى تسجيل الدخول أولاً</p>
          <button
            onClick={() => setCurrentPage("login")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">تحديث المعلومات الشخصية</h2>
              <p className="text-gray-600 mt-1">قم بتحديث بياناتك الشخصية</p>
            </div>
          </div>

          {/* المعلومات الثابتة (غير قابلة للتعديل) */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              المعلومات الأساسية (غير قابلة للتعديل)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <span className="text-blue-700 font-medium block mb-1">الاسم الكامل:</span>
                <p className="text-blue-900 font-bold">{currentMember.fullName || `${currentMember.firstName} ${currentMember.lastName}`}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <span className="text-blue-700 font-medium block mb-1">رقم العضوية:</span>
                <p className="text-blue-900 font-bold font-mono" dir="ltr">{currentMember.membershipNumber}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <span className="text-blue-700 font-medium block mb-1">رقم الهاتف:</span>
                <p className="text-blue-900 font-bold font-mono" dir="ltr">{currentMember.phone}</p>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-3 bg-blue-100 p-2 rounded-lg">
              💡 لتغيير الاسم أو رقم الهاتف، يرجى التواصل مع الإدارة
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* الاسم باللاتينية */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 text-start">
                <Globe className="w-5 h-5 text-blue-600" />
                الاسم باللاتينية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الاسم باللاتينية</label>
                  <input
                    type="text"
                    value={formData.firstNameLatin}
                    onChange={(e) => setFormData({ ...formData, firstNameLatin: e.target.value })}
                    placeholder="First Name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">اللقب باللاتينية</label>
                  <input
                    type="text"
                    value={formData.lastNameLatin}
                    onChange={(e) => setFormData({ ...formData, lastNameLatin: e.target.value })}
                    placeholder="Last Name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* رقم التعريف الوطني */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 text-start">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                رقم التعريف الوطني (NIN)
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">رقم التعريف الوطني</label>
                <input
                  type="text"
                  value={formData.nin}
                  onChange={(e) => setFormData({ ...formData, nin: e.target.value })}
                  placeholder="أدخل رقم التعريف الوطني"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1 text-start">رقم التعريف الوطني مكون من 18 رقماً</p>
              </div>
            </div>

            {/* معلومات الاتصال */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 text-start">
                <Phone className="w-5 h-5 text-green-600" />
                معلومات الاتصال
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  dir="ltr"
                />
              </div>
            </div>

            {/* معلومات شخصية */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 text-start">
                <Calendar className="w-5 h-5 text-purple-600" />
                المعلومات الشخصية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الجنس</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  >
                    <option value="">اختر الجنس</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">تاريخ الميلاد</label>
                  <DateInput
                    value={formData.birthDate}
                    onChange={(value) => setFormData({ ...formData, birthDate: value })}
                    placeholder="يوم/شهر/سنة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">مكان الميلاد</label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="أدخل مكان الميلاد"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* المستوى التعليمي والمهنة */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 text-start">
                <GraduationCap className="w-5 h-5 text-teal-600" />
                المستوى التعليمي والمهنة
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">المستوى التعليمي</label>
                  <select
                    value={formData.educationLevel}
                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                  >
                    <option value="">اختر المستوى التعليمي</option>
                    <option value="none">بدون مستوى</option>
                    <option value="primary">ابتدائي</option>
                    <option value="secondary">ثانوي</option>
                    <option value="university">جامعي</option>
                    <option value="postgraduate">دراسات عليا</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">المهنة</label>
                  <select
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                  >
                    <option value="">اختر المهنة</option>
                    <option value="unemployed">بدون عمل</option>
                    <option value="student">طالب</option>
                    <option value="employee">موظف</option>
                    <option value="freelancer">عمل حر</option>
                    <option value="farmer">فلاح</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>
              {formData.profession === "other" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">تفاصيل المهنة</label>
                  <input
                    type="text"
                    value={formData.professionDetails}
                    onChange={(e) => setFormData({ ...formData, professionDetails: e.target.value })}
                    placeholder="أدخل تفاصيل المهنة"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                  />
                </div>
              )}
            </div>

            {/* العنوان */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 text-start">
                <MapPin className="w-5 h-5 text-blue-600" />
                العنوان
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الدولة *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    required
                  >
                    <option value="">اختر الدولة</option>
                    {COMMON_COUNTRIES.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                    <option value="أخرى">دولة أخرى</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الولاية *</label>
                    {showWilayaDropdown ? (
                      <select
                        value={formData.wilayaCode}
                        onChange={(e) => handleWilayaChange(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        required
                      >
                        <option value="">اختر الولاية</option>
                        {WILAYA_OPTIONS.map((wilaya) => (
                          <option key={wilaya.code} value={wilaya.code}>{wilaya.code} - {wilaya.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData.wilayaCode}
                        onChange={(e) => setFormData({ ...formData, wilayaCode: e.target.value })}
                        placeholder="أدخل الولاية"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-start">البلدية *</label>
                    {showWilayaDropdown && formData.wilayaCode ? (
                      <select
                        value={formData.baladiya}
                        onChange={(e) => setFormData({ ...formData, baladiya: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        required
                      >
                        <option value="">اختر البلدية</option>
                        {availableCommunes.map((commune) => (
                          <option key={commune.name} value={commune.nameAr}>{commune.nameAr}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData.baladiya}
                        onChange={(e) => setFormData({ ...formData, baladiya: e.target.value })}
                        placeholder="أدخل البلدية"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        required
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">العنوان الكامل</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="أدخل العنوان"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* بطاقة الناخب */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 text-start">
                <FileText className="w-5 h-5 text-amber-600" />
                معلومات بطاقة الناخب
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">رقم بطاقة الانتخاب</label>
                  <input
                    type="text"
                    value={formData.electoralCardNumber}
                    onChange={(e) => setFormData({ ...formData, electoralCardNumber: e.target.value })}
                    placeholder="123456789"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">تاريخ إصدار البطاقة</label>
                  <DateInput
                    value={formData.electoralCardIssueDate}
                    onChange={(value) => setFormData({ ...formData, electoralCardIssueDate: value })}
                    placeholder="يوم/شهر/سنة"
                  />
                </div>
              </div>
            </div>

            {/* الصفات والمناصب */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 text-start">
                <Award className="w-5 h-5 text-purple-600" />
                الصفات والمناصب
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الصفة السياسية</label>
                  <select
                    value={formData.memberType}
                    onChange={(e) => setFormData({ ...formData, memberType: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  >
                    <option value="">اختر الصفة السياسية</option>
                    <option value="militant">مناضل</option>
                    <option value="municipal_elected">منتخب بلدي</option>
                    <option value="wilaya_elected">منتخب ولائي</option>
                    <option value="apn_elected">منتخب مجلس شعبي وطني</option>
                    <option value="senate_elected">منتخب مجلس الأمة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الصفة الهيكلية</label>
                  <select
                    value={formData.structuralPosition}
                    onChange={(e) => setFormData({ ...formData, structuralPosition: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  >
                    <option value="">اختر الصفة الهيكلية</option>
                    <option value="militant">مناضل</option>
                    <option value="municipal_bureau_member">عضو مكتب بلدي</option>
                    <option value="wilaya_bureau_member">عضو مكتب ولائي</option>
                    <option value="national_bureau_member">عضو مكتب وطني</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الصفة الإدارية</label>
                  <select
                    value={formData.administrativePosition}
                    onChange={(e) => setFormData({ ...formData, administrativePosition: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  >
                    <option value="">اختر الصفة الإدارية</option>
                    <option value="militant">مناضل</option>
                    <option value="municipal_secretary">أمين بلدي</option>
                    <option value="wilaya_secretary">أمين ولائي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الوظيفة</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  >
                    <option value="">اختر الوظيفة</option>
                    <option value="municipal_president">رئيس مجلس شعبي بلدي</option>
                    <option value="wilaya_president">رئيس مجلس شعبي ولائي</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNationalCouncilMember}
                    onChange={(e) => setFormData({ ...formData, isNationalCouncilMember: e.target.checked })}
                    className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    عضو المجلس الوطني
                  </span>
                </label>
              </div>
            </div>

            {/* أزرار الحفظ */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ التغييرات
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setCurrentPage("dashboard")}
                className="px-6 py-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

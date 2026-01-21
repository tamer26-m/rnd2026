import { useState, useRef, useMemo, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  Zap,
  User,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Lock,
  CheckCircle,
  AlertCircle,
  X,
  ImageIcon,
  Video,
  Eye,
  EyeOff,
  ArrowLeft,
  CreditCard,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { WILAYAS, WILAYA_OPTIONS } from "../data/algeriaGeoData";
import DateInput from "./DateInput";
import SubscriptionReceiptGenerator from "./SubscriptionReceiptGenerator";

type Page = 
  | "home" 
  | "activities" 
  | "members" 
  | "dashboard" 
  | "gallery" 
  | "register" 
  | "login" 
  | "recoverMembership" 
  | "updateProfile" 
  | "updatePhoto" 
  | "memberCard" 
  | "stats" 
  | "secretaryGeneral" 
  | "nationalBureau" 
  | "adminLogin"
  | "adminDashboard"
  | "myPoliticalActivities"
  | "secretaryGeneralEN"
  | "quickRegister"
  | "subscriptionReceipt";

interface QuickRegisterPageProps {
  setCurrentPage: (page: Page) => void;
}

// أنواع الاشتراكات
const SUBSCRIPTION_TYPES = [
  { id: "type_1", amount: 1000, label: "الاشتراك 01", description: "ألف دينار جزائري (1,000 دج)" },
  { id: "type_2", amount: 3000, label: "الاشتراك 02", description: "ثلاثة آلاف دينار جزائري (3,000 دج)" },
  { id: "type_3", amount: 10000, label: "الاشتراك 03", description: "عشرة آلاف دينار جزائري (10,000 دج)" },
  { id: "type_4", amount: 200000, label: "الاشتراك 04", description: "مائتي ألف دينار جزائري (200,000 دج) - خاص بنواب البرلمان ومجلس الأمة" },
];

export default function QuickRegisterPage({ setCurrentPage }: QuickRegisterPageProps) {
  // حالات النموذج
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthWilayaCode, setBirthWilayaCode] = useState("");
  const [firstJoinYear, setFirstJoinYear] = useState("");
  const [joinWilayaCode, setJoinWilayaCode] = useState("");
  const [joinBaladiya, setJoinBaladiya] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState("");

  // حالات الصورة
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedPhotoId, setUploadedPhotoId] = useState<Id<"_storage"> | null>(null);

  // حالات أخرى
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [membershipNumber, setMembershipNumber] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  // المراجع
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // الدوال
  const quickRegister = useMutation(api.members.quickRegister);
  const generateUploadUrl = useMutation(api.members.generateUploadUrl);

  // الحصول على البلديات حسب الولاية المختارة
  const availableBaladiyas = useMemo(() => {
    if (!joinWilayaCode) return [];
    const selectedWilaya = WILAYAS.find(w => w.code === joinWilayaCode);
    if (!selectedWilaya) return [];
    
    const baladiyas: { name: string; nameAr: string }[] = [];
    selectedWilaya.dairas.forEach(daira => {
      daira.communes.forEach(commune => {
        baladiyas.push({ name: commune.name, nameAr: commune.nameAr });
      });
    });
    return baladiyas.sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar'));
  }, [joinWilayaCode]);

  // التحقق من تطابق كلمة المرور
  const checkPasswordMatch = useCallback((pass: string, confirm: string) => {
    if (confirm && pass !== confirm) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  }, []);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    checkPasswordMatch(value, confirmPassword);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    checkPasswordMatch(password, value);
  };

  // اختيار الصورة
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // رفع الصورة
  const handleUploadImage = async () => {
    if (!selectedImage) return null;
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });
      if (!result.ok) throw new Error("فشل رفع الصورة");
      const { storageId } = await result.json();
      setUploadedPhotoId(storageId);
      return storageId;
    } catch (error) {
      toast.error("حدث خطأ أثناء رفع الصورة");
      return null;
    }
  };

  // إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من الحقول المطلوبة
    if (!firstName.trim()) {
      toast.error("يرجى إدخال الاسم");
      return;
    }
    if (!lastName.trim()) {
      toast.error("يرجى إدخال اللقب");
      return;
    }
    if (!birthDate) {
      toast.error("يرجى إدخال تاريخ الازدياد");
      return;
    }
    if (!birthWilayaCode) {
      toast.error("يرجى اختيار ولاية الازدياد");
      return;
    }
    if (!firstJoinYear) {
      toast.error("يرجى إدخال سنة أول انخراط");
      return;
    }
    if (!joinWilayaCode) {
      toast.error("يرجى اختيار ولاية الانخراط");
      return;
    }
    if (!joinBaladiya) {
      toast.error("يرجى اختيار بلدية الانخراط");
      return;
    }
    if (!phone.trim()) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }
    if (!subscriptionType) {
      toast.error("يرجى اختيار نوع الاشتراك");
      return;
    }
    
    // التحقق من صيغة رقم الهاتف
    const phoneRegex = /^(0|\+213)[5-7][0-9]{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      toast.error("صيغة رقم الهاتف غير صحيحة. يجب أن يبدأ بـ 05 أو 06 أو 07");
      return;
    }
    
    if (!password) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("كلمة المرور غير متطابقة");
      return;
    }

    // التحقق من سنة الانخراط
    const year = parseInt(firstJoinYear);
    if (year < 1997) {
      toast.error("سنة أول انخراط يجب أن لا تكون قبل 1997");
      return;
    }
    if (year > new Date().getFullYear()) {
      toast.error("سنة أول انخراط لا يمكن أن تكون في المستقبل");
      return;
    }

    setIsSubmitting(true);
    try {
      // رفع الصورة إذا وجدت
      let photoId = uploadedPhotoId;
      if (selectedImage && !uploadedPhotoId) {
        photoId = await handleUploadImage();
      }

      // الحصول على اسم الولاية
      const birthWilaya = WILAYA_OPTIONS.find(w => w.code === birthWilayaCode)?.label || "";
      const joinWilaya = WILAYA_OPTIONS.find(w => w.code === joinWilayaCode)?.label || "";

      const result = await quickRegister({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate: new Date(birthDate).getTime(),
        birthWilaya,
        firstJoinYear: year,
        joinWilaya,
        joinBaladiya,
        phone: phone.trim(),
        password,
        profilePhotoId: photoId || undefined,
        subscriptionType: subscriptionType as "type_1" | "type_2" | "type_3" | "type_4",
      });

      setMembershipNumber(result.membershipNumber);
      setRegistrationSuccess(true);
      toast.success("تم التسجيل بنجاح! 🎉");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء التسجيل";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // صفحة النجاح مع وصل الاشتراك
  if (registrationSuccess) {
    const selectedSubscription = SUBSCRIPTION_TYPES.find(s => s.id === subscriptionType);
    const joinWilaya = WILAYA_OPTIONS.find(w => w.code === joinWilayaCode)?.label || "";
    
    const memberDataForReceipt = {
      membershipNumber,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate: birthDate ? new Date(birthDate).getTime() : undefined,
      birthPlace: WILAYA_OPTIONS.find(w => w.code === birthWilayaCode)?.label || "",
      wilaya: joinWilaya,
      baladiya: joinBaladiya,
      subscriptionType,
      subscriptionYear: new Date().getFullYear(),
      joinDate: Date.now(),
      profilePhotoUrl: imagePreview || undefined,
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }} className="text-center mb-8">
          <CheckCircle className="w-24 h-24 mx-auto mb-4 text-green-600" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">تم التسجيل بنجاح! 🎉</h2>
          <p className="text-lg text-gray-600">مرحباً بك في حزب التجمع الوطني الديمقراطي</p>
        </motion.div>

        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 mb-6 text-center">
          <p className="text-lg text-gray-700 mb-2">رقم العضوية الخاص بك:</p>
          <p className="text-4xl font-bold text-green-600 tracking-wider" dir="ltr">{membershipNumber}</p>
        </div>

        {selectedSubscription && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-blue-800 font-bold mb-1">💳 نوع الاشتراك المختار</p>
            <p className="text-blue-700">{selectedSubscription.label} - {selectedSubscription.description}</p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-yellow-800 font-bold mb-1">⚠️ مهم جداً</p>
          <p className="text-yellow-700 text-sm">احتفظ برقم العضوية وكلمة المرور في مكان آمن. ستحتاجهما لتسجيل الدخول.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <FileText className="w-8 h-8 text-green-600" />
            <h3 className="text-2xl font-bold text-gray-900">وصل تسديد الاشتراك</h3>
          </div>
          <p className="text-center text-gray-600 mb-6">
            قم بتحميل وصل الاشتراك الآن واحتفظ به. يمكنك أيضاً إعادة تحميله لاحقاً من لوحة التحكم.
          </p>
          <SubscriptionReceiptGenerator 
            memberData={memberDataForReceipt}
            showCloseButton={false}
            autoDownload={false}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={() => setCurrentPage("login")}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            تسجيل الدخول الآن
          </button>
          <button
            onClick={() => setCurrentPage("home")}
            className="px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12" dir="rtl">
      {/* العنوان */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-4 shadow-xl">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">الانضمام السريع</h1>
        <p className="text-lg text-gray-600">انضم للحزب في دقائق معدودة</p>
      </motion.div>

      {/* النموذج */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* الصورة الشخصية */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
            <label className="block text-lg font-bold text-gray-800 mb-4 text-start">
              <Camera className="w-5 h-5 inline ms-2" />
              الصورة الشخصية
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="معاينة الصورة"
                    className="w-32 h-32 rounded-xl object-cover border-4 border-green-500 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      setUploadedPhotoId(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white">
                  <Camera className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">لا توجد صورة</span>
                </div>
              )}
              <div className="flex-1 space-y-3">
                <p className="text-sm text-gray-600 text-start">اختر طريقة إضافة الصورة:</p>
                <div className="flex flex-wrap gap-3">
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="camera-capture"
                  />
                  <label
                    htmlFor="camera-capture"
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md text-sm"
                  >
                    <Video className="w-4 h-4" />
                    التقاط بالكاميرا
                  </label>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md text-sm"
                  >
                    <ImageIcon className="w-4 h-4" />
                    اختيار من الجهاز
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* الاسم واللقب */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
                <User className="w-4 h-4 inline ms-1" />
                الاسم *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                placeholder="مثال: محمد"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
                <User className="w-4 h-4 inline ms-1" />
                اللقب *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                placeholder="مثال: بن علي"
                required
              />
            </div>
          </div>

          {/* تاريخ الازدياد */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
              <Calendar className="w-4 h-4 inline ms-1" />
              تاريخ الازدياد *
            </label>
            <DateInput
              value={birthDate}
              onChange={(value) => setBirthDate(value)}
              placeholder="يوم/شهر/سنة"
            />
          </div>

          {/* ولاية الازدياد */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
              <MapPin className="w-4 h-4 inline ms-1" />
              ولاية الازدياد *
            </label>
            <select
              value={birthWilayaCode}
              onChange={(e) => setBirthWilayaCode(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              required
            >
              <option value="">اختر ولاية الازدياد</option>
              {WILAYA_OPTIONS.map((wilaya) => (
                <option key={wilaya.code} value={wilaya.code}>
                  {wilaya.code} - {wilaya.label}
                </option>
              ))}
            </select>
          </div>

          {/* سنة أول انخراط */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
              <Calendar className="w-4 h-4 inline ms-1" />
              سنة أول انخراط في الحزب *
            </label>
            <input
              type="number"
              min="1997"
              max={new Date().getFullYear()}
              value={firstJoinYear}
              onChange={(e) => setFirstJoinYear(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="مثال: 2010"
              required
            />
            <p className="text-xs text-gray-500 mt-1 text-start">يجب أن لا تكون قبل 1997</p>
          </div>

          {/* ولاية الانخراط */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
              <MapPin className="w-4 h-4 inline ms-1" />
              ولاية الانخراط *
            </label>
            <select
              value={joinWilayaCode}
              onChange={(e) => {
                setJoinWilayaCode(e.target.value);
                setJoinBaladiya("");
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              required
            >
              <option value="">اختر ولاية الانخراط</option>
              {WILAYA_OPTIONS.map((wilaya) => (
                <option key={wilaya.code} value={wilaya.code}>
                  {wilaya.code} - {wilaya.label}
                </option>
              ))}
            </select>
          </div>

          {/* بلدية الانخراط */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
              <MapPin className="w-4 h-4 inline ms-1" />
              بلدية الانخراط *
            </label>
            <select
              value={joinBaladiya}
              onChange={(e) => setJoinBaladiya(e.target.value)}
              disabled={!joinWilayaCode}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            >
              <option value="">اختر البلدية</option>
              {availableBaladiyas.map((baladiya) => (
                <option key={baladiya.name} value={baladiya.nameAr}>
                  {baladiya.nameAr}
                </option>
              ))}
            </select>
            {!joinWilayaCode && (
              <p className="text-xs text-gray-500 mt-1 text-start">اختر الولاية أولاً</p>
            )}
          </div>

          {/* رقم الهاتف */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
              <Phone className="w-4 h-4 inline ms-1" />
              رقم الهاتف *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="مثال: 0555123456"
              dir="ltr"
              required
            />
            <p className="text-xs text-gray-500 mt-1 text-start">يجب أن يبدأ بـ 05 أو 06 أو 07</p>
          </div>

          {/* نوع الاشتراك */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
            <label className="block text-lg font-bold text-gray-800 mb-4 text-start">
              <CreditCard className="w-5 h-5 inline ms-2" />
              نوع الاشتراك السنوي *
            </label>
            <div className="space-y-3">
              {SUBSCRIPTION_TYPES.map((sub) => (
                <label
                  key={sub.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    subscriptionType === sub.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white hover:border-green-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="subscriptionType"
                    value={sub.id}
                    checked={subscriptionType === sub.id}
                    onChange={(e) => setSubscriptionType(e.target.value)}
                    className="mt-1 w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{sub.label}</span>
                      <span className="font-bold text-green-600">{sub.amount.toLocaleString('ar-DZ')} دج</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{sub.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* كلمة المرور */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
                <Lock className="w-4 h-4 inline ms-1" />
                كلمة المرور *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all ps-10"
                  placeholder="6 أحرف على الأقل"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 text-start">
                <Lock className="w-4 h-4 inline ms-1" />
                تأكيد كلمة المرور *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all ps-10 ${
                    passwordMismatch
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  }`}
                  placeholder="أعد إدخال كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordMismatch && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1 text-start">
                  <AlertCircle className="w-4 h-4" />
                  كلمة المرور غير متطابقة
                </p>
              )}
            </div>
          </div>

          {/* زر التسجيل */}
          <button
            type="submit"
            disabled={isSubmitting || passwordMismatch}
            className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري التسجيل...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                انضم الآن
              </span>
            )}
          </button>
        </form>
      </motion.div>

      {/* ملاحظات */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-blue-50 rounded-xl p-6"
      >
        <h3 className="font-bold text-lg text-start mb-3">ملاحظات هامة:</h3>
        <ul className="space-y-2 text-gray-700 text-start text-sm">
          <li>• الحقول المميزة بـ (*) إلزامية</li>
          <li>• كلمة المرور يجب أن تكون 6 أحرف على الأقل</li>
          <li>• سيتم إصدار رقم عضوية فريد بعد التسجيل</li>
          <li>• سيتم عرض وصل تسديد الاشتراك مباشرة بعد التسجيل</li>
          <li>• احتفظ برقم العضوية وكلمة المرور في مكان آمن</li>
        </ul>
      </motion.div>

      {/* رابط التسجيل الكامل */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="text-gray-600">
          تريد تسجيل جميع بياناتك الآن؟{" "}
          <button
            onClick={() => setCurrentPage("register")}
            className="text-green-600 font-bold hover:underline"
          >
            التسجيل الكامل
          </button>
        </p>
      </motion.div>
    </div>
  );
}

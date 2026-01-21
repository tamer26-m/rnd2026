import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, User, Phone, MapPin, CreditCard, CheckCircle, Calendar, Users, Upload, Globe, Camera, Mail, Lock, FileText, AlertCircle, Plane, X, Video, ImageIcon, GraduationCap, Briefcase, ChevronLeft, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { WILAYAS, getCommunesByWilaya, WILAYA_OPTIONS } from "../data/algeriaGeoData";
import DocumentUploader from "./DocumentUploader";
import DateInput from "./DateInput";

// مفتاح التخزين المحلي
const STORAGE_KEY = "rnd_registration_form_data";
const STORAGE_STEP_KEY = "rnd_registration_step";

const COMMON_COUNTRIES = [
  "الجزائر",
  "فرنسا",
  "كندا",
  "الولايات المتحدة",
  "المملكة المتحدة",
  "ألمانيا",
  "إسبانيا",
  "إيطاليا",
  "بلجيكا",
  "هولندا",
  "السويد",
  "سويسرا",
  "الإمارات العربية المتحدة",
  "السعودية",
  "قطر",
  "الكويت",
  "تونس",
  "المغرب",
  "مصر",
];

// خيارات المستوى الدراسي
const EDUCATION_LEVELS = [
  { value: "none", label: "دون مستوى" },
  { value: "primary", label: "إبتدائي" },
  { value: "secondary", label: "ثانوي" },
  { value: "university", label: "جامعي" },
  { value: "postgraduate", label: "ما بعد التدرج" },
];

// خيارات المهنة
const PROFESSIONS = [
  { value: "unemployed", label: "بطال" },
  { value: "student", label: "طالب" },
  { value: "employee", label: "موظف" },
  { value: "freelancer", label: "أعمال حرة" },
  { value: "farmer", label: "فلاح" },
  { value: "other", label: "أخرى (مع التحديد)" },
];

// دالة استرجاع البيانات المحفوظة
const getSavedFormData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return null;
};

const getSavedStep = () => {
  try {
    const s = localStorage.getItem(STORAGE_STEP_KEY);
    return s ? parseInt(s, 10) : 1;
  } catch (e) { return 1; }
};

export default function RegisterPage({ setCurrentPage }: { setCurrentPage: (page: any) => void }) {
  const saved = getSavedFormData();
  const [formData, setFormData] = useState({
    firstName: saved?.firstName || "",
    lastName: saved?.lastName || "",
    firstNameLatin: saved?.firstNameLatin || "",
    lastNameLatin: saved?.lastNameLatin || "",
    nin: saved?.nin || "",
    birthDate: saved?.birthDate || "",
    birthPlaceCode: saved?.birthPlaceCode || "",
    gender: (saved?.gender || "") as "male" | "female" | "",
    phone: saved?.phone || "",
    email: saved?.email || "",
    password: "",
    confirmPassword: "",
    country: saved?.country || "",
    wilayaCode: saved?.wilayaCode || "",
    baladiya: saved?.baladiya || "",
    firstJoinYear: saved?.firstJoinYear || "",
    electoralCardNumber: saved?.electoralCardNumber || "",
    electoralCardIssueDate: saved?.electoralCardIssueDate || "",
    educationLevel: (saved?.educationLevel || "") as any,
    profession: (saved?.profession || "") as any,
    professionDetails: saved?.professionDetails || "",
    memberType: (saved?.memberType || "") as any,
    structuralPosition: (saved?.structuralPosition || "") as any,
    administrativePosition: (saved?.administrativePosition || "") as any,
    isNationalCouncilMember: saved?.isNationalCouncilMember || false,
    position: (saved?.position || "") as any,
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [membershipNumber, setMembershipNumber] = useState("");
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(saved?.country === "الجزائر");
  const [currentStep, setCurrentStep] = useState(getSavedStep());
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedPhotoId, setUploadedPhotoId] = useState<Id<"_storage"> | null>(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // حالات الوثائق
  const [nationalIdStorageId, setNationalIdStorageId] = useState<string | null>(null);
  const [nationalIdPreview, setNationalIdPreview] = useState<string | null>(null);
  const [passportStorageId, setPassportStorageId] = useState<string | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [electoralCardStorageId, setElectoralCardStorageId] = useState<string | null>(null);
  const [electoralCardPreview, setElectoralCardPreview] = useState<string | null>(null);

  const registerMember = useMutation(api.members.registerMember);
  const generateUploadUrl = useMutation(api.members.generateUploadUrl);
  const uploadDocument = useMutation(api.memberDocuments.uploadDocument);

  // الحفظ التلقائي للبيانات
  useEffect(() => {
    const saveData = () => {
      try {
        const dataToSave = { ...formData, password: "", confirmPassword: "" };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        localStorage.setItem(STORAGE_STEP_KEY, currentStep.toString());
        setLastSaved(new Date());
      } catch (e) { console.error("Error saving form data:", e); }
    };
    const timer = setTimeout(saveData, 1000);
    return () => clearTimeout(timer);
  }, [formData, currentStep]);

  // مسح البيانات المحفوظة
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_STEP_KEY);
    setLastSaved(null);
  }, []);

  const availableCommunes = useMemo(() => {
    if (!formData.wilayaCode) return [];
    return getCommunesByWilaya(formData.wilayaCode);
  }, [formData.wilayaCode]);

  const handleCountryChange = (country: string) => {
    setFormData({ ...formData, country, wilayaCode: "", baladiya: "" });
    setShowWilayaDropdown(country === "الجزائر");
  };

  const handleWilayaChange = (wilayaCode: string) => {
    setFormData({ ...formData, wilayaCode, baladiya: "" });
  };

  const checkPasswordMatch = (password: string, confirmPassword: string) => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setFormData({ ...formData, password: value });
    checkPasswordMatch(value, formData.confirmPassword);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setFormData({ ...formData, confirmPassword: value });
    checkPasswordMatch(formData.password, value);
  };

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

  // فتح الكاميرا
  const openCamera = useCallback(async () => {
    setCameraError(null);
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setCameraError("لا يمكن الوصول إلى الكاميرا. تأكد من منح الإذن.");
    }
  }, []);

  // إغلاق الكاميرا
  const closeCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
    setCameraError(null);
  }, [cameraStream]);

  // التقاط صورة من الكاميرا
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
            setSelectedImage(file);
            setImagePreview(canvas.toDataURL("image/jpeg"));
            closeCamera();
            toast.success("تم التقاط الصورة بنجاح!");
          }
        }, "image/jpeg", 0.9);
      }
    }
  }, [closeCamera]);

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

  // التحقق من صحة المرحلة الأولى والانتقال للمرحلة الثانية
  const handleNextStep = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error("يرجى إدخال الاسم واللقب بالعربية");
      return;
    }
    if (!formData.firstNameLatin || !formData.lastNameLatin) {
      toast.error("يرجى إدخال الاسم واللقب باللاتينية");
      return;
    }
    if (!formData.nin) {
      toast.error("يرجى إدخال رقم التعريف الوطني");
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // العودة للمرحلة الأولى
  const handlePrevStep = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedWilaya = WILAYA_OPTIONS.find(w => w.code === formData.wilayaCode);
    const selectedBirthPlace = WILAYA_OPTIONS.find(w => w.code === formData.birthPlaceCode);
    
    const wilayaName = showWilayaDropdown ? (selectedWilaya?.label || "") : formData.wilayaCode;
    const birthPlaceName = selectedBirthPlace?.label || "";
    
    if (!formData.firstName || !formData.lastName || !formData.firstNameLatin || 
        !formData.lastNameLatin || !formData.nin || !formData.phone || !formData.email ||
        !formData.password || !formData.confirmPassword ||
        !formData.country || !wilayaName || !formData.baladiya) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("كلمة مرور غير متطابقة");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("البريد الإلكتروني غير صحيح");
      return;
    }

    if (formData.firstJoinYear) {
      const year = parseInt(formData.firstJoinYear);
      if (year < 1997) {
        toast.error("سنة أول انخراط يجب أن لا تكون قبل 1997");
        return;
      }
      if (year > new Date().getFullYear()) {
        toast.error("سنة أول انخراط لا يمكن أن تكون في المستقبل");
        return;
      }
    }

    // التحقق من تفاصيل المهنة إذا تم اختيار "أخرى"
    if (formData.profession === "other" && !formData.professionDetails.trim()) {
      toast.error("يرجى تحديد المهنة");
      return;
    }

    setIsSubmitting(true);
    try {
      let photoId = uploadedPhotoId;
      if (selectedImage && !uploadedPhotoId) {
        photoId = await handleUploadImage();
      }

      const birthDateTimestamp = formData.birthDate ? new Date(formData.birthDate).getTime() : undefined;
      const electoralCardIssueDateTimestamp = formData.electoralCardIssueDate ? new Date(formData.electoralCardIssueDate).getTime() : undefined;
      const firstJoinYear = formData.firstJoinYear ? parseInt(formData.firstJoinYear) : undefined;
      
      const result = await registerMember({
        firstName: formData.firstName,
        lastName: formData.lastName,
        firstNameLatin: formData.firstNameLatin,
        lastNameLatin: formData.lastNameLatin,
        nin: formData.nin,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        wilaya: wilayaName,
        baladiya: formData.baladiya,
        address: "-",
        firstJoinYear,
        electoralCardNumber: formData.electoralCardNumber || undefined,
        electoralCardIssueDate: electoralCardIssueDateTimestamp,
        gender: formData.gender || undefined,
        birthDate: birthDateTimestamp,
        birthPlace: birthPlaceName || undefined,
        educationLevel: formData.educationLevel || undefined,
        profession: formData.profession || undefined,
        professionDetails: formData.profession === "other" ? formData.professionDetails : undefined,
        memberType: formData.memberType || undefined,
        structuralPosition: formData.structuralPosition || undefined,
        administrativePosition: formData.administrativePosition || undefined,
        isNationalCouncilMember: formData.isNationalCouncilMember || undefined,
        position: formData.position || undefined,
        profilePhotoId: photoId || undefined,
      });

      // رفع الوثائق بعد التسجيل الناجح
      const newMembershipNumber = result.membershipNumber;

      if (nationalIdStorageId) {
        await uploadDocument({
          membershipNumber: newMembershipNumber,
          documentType: "national_id",
          storageId: nationalIdStorageId as Id<"_storage">,
        });
      }

      if (passportStorageId) {
        await uploadDocument({
          membershipNumber: newMembershipNumber,
          documentType: "passport",
          storageId: passportStorageId as Id<"_storage">,
        });
      }

      if (electoralCardStorageId) {
        await uploadDocument({
          membershipNumber: newMembershipNumber,
          documentType: "electoral_card",
          storageId: electoralCardStorageId as Id<"_storage">,
        });
      }

      setMembershipNumber(newMembershipNumber);
      setRegistrationSuccess(true);
      toast.success("تم التسجيل بنجاح! 🎉");
      
      // إعادة تعيين النموذج
      setFormData({
        firstName: "",
        lastName: "",
        firstNameLatin: "",
        lastNameLatin: "",
        nin: "",
        birthDate: "",
        birthPlaceCode: "",
        gender: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        country: "",
        wilayaCode: "",
        baladiya: "",
        firstJoinYear: "",
        electoralCardNumber: "",
        electoralCardIssueDate: "",
        educationLevel: "",
        profession: "",
        professionDetails: "",
        memberType: "",
        structuralPosition: "",
        administrativePosition: "",
        isNationalCouncilMember: false,
        position: "",
      });
      setShowWilayaDropdown(false);
      setSelectedImage(null);
      setImagePreview(null);
      setUploadedPhotoId(null);
      setPasswordMismatch(false);
      setNationalIdStorageId(null);
      setNationalIdPreview(null);
      setPassportStorageId(null);
      setPassportPreview(null);
      setElectoralCardStorageId(null);
      setElectoralCardPreview(null);
      setCurrentStep(1);
      // مسح البيانات المحفوظة بعد التسجيل الناجح
      clearSavedData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء التسجيل";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterAnother = () => {
    setRegistrationSuccess(false);
    setMembershipNumber("");
  };

  if (registrationSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }}>
          <CheckCircle className="w-32 h-32 mx-auto mb-6 text-green-600" />
        </motion.div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">تم التسجيل بنجاح! 🎉</h2>
        <p className="text-xl text-gray-600 mb-6">تم تسجيل المنخرط بنجاح في حزب التجمع الوطني الديمقراطي</p>
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 mb-6">
          <p className="text-lg text-gray-700 mb-2">رقم العضوية:</p>
          <p className="text-4xl font-bold text-green-600 tracking-wider" dir="ltr">{membershipNumber}</p>
          <p className="text-sm text-gray-600 mt-4">رقم العضوية مكون من 12 رقماً:</p>
          <ul className="text-sm text-gray-600 mt-2 space-y-1">
            <li>• الرقمان الأولان: رقم الولاية (88 للدول خارج الجزائر)</li>
            <li>• الأربعة أرقام التالية: سنة أول انخراط</li>
            <li>• الستة أرقام الأخيرة: الرقم التسلسلي</li>
          </ul>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <p className="text-yellow-800 font-bold mb-2">⚠️ مهم جداً</p>
          <p className="text-yellow-700">احتفظ برقم العضوية وكلمة المرور في مكان آمن. ستحتاجهما لتسجيل الدخول إلى حسابك.</p>
        </div>
        <button onClick={handleRegisterAnother} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
          تسجيل منخرط آخر
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* العنوان ومؤشر المراحل */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <UserPlus className="w-16 h-16 mx-auto mb-4 text-green-600" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">تسجيل منخرط جديد</h1>
        <p className="text-lg text-gray-600 mb-4">انضم إلى حزب التجمع الوطني الديمقراطي</p>
        
        {/* مؤشر الحفظ التلقائي */}
        {lastSaved && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 mb-4">
            <Save className="w-4 h-4" />
            <span>تم الحفظ تلقائياً {lastSaved.toLocaleTimeString('ar-DZ')}</span>
          </div>
        )}
        
        {/* مؤشر المراحل */}
        <div className="flex items-center justify-center gap-2 md:gap-4 max-w-lg mx-auto">
          <div className={`flex-1 flex items-center gap-2 p-3 rounded-xl transition-all ${currentStep === 1 ? 'bg-green-600 text-white shadow-lg' : 'bg-green-100 text-green-700'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 1 ? 'bg-white text-green-600' : 'bg-green-600 text-white'}`}>
              {currentStep > 1 ? '✓' : '1'}
            </div>
            <span className="font-semibold text-xs md:text-sm hidden sm:block">المعلومات الشخصية</span>
            <span className="font-semibold text-xs sm:hidden">الشخصية</span>
          </div>
          <ChevronLeft className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div className={`flex-1 flex items-center gap-2 p-3 rounded-xl transition-all ${currentStep === 2 ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 2 ? 'bg-white text-green-600' : 'bg-gray-300 text-gray-600'}`}>2</div>
            <span className="font-semibold text-xs md:text-sm hidden sm:block">معلومات الاتصال</span>
            <span className="font-semibold text-xs sm:hidden">الاتصال</span>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {/* ==================== المرحلة الأولى ==================== */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* عنوان المرحلة */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-4 mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <User className="w-6 h-6" />
                    المرحلة الأولى: المعلومات الشخصية والصورة
                  </h2>
                  <p className="text-green-100 text-sm mt-1">أدخل بياناتك الشخصية والصورة</p>
                </div>

                {/* الصورة الشخصية */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                  <label className="block text-lg font-bold text-gray-800 mb-4 text-start">
                    <Camera className="w-5 h-5 inline ms-2" />
                    الصورة الشخصية (اختياري)
                  </label>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="معاينة الصورة" className="w-40 h-40 rounded-xl object-cover border-4 border-green-500 shadow-lg" />
                        <button type="button" onClick={() => { setSelectedImage(null); setImagePreview(null); setUploadedPhotoId(null); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-lg"><X className="w-5 h-5" /></button>
                      </div>
                    ) : (
                      <div className="w-40 h-40 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white">
                        <Camera className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">لا توجد صورة</span>
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <p className="text-sm text-gray-600 mb-2 text-start">اختر طريقة إضافة الصورة:</p>
                      <div className="flex flex-wrap gap-3">
                        <input ref={cameraInputRef} type="file" accept="image/*" capture="user" onChange={handleImageSelect} className="hidden" id="camera-capture" />
                        <label htmlFor="camera-capture" className="cursor-pointer flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md">
                          <Video className="w-5 h-5" />
                          التقاط بالكاميرا
                        </label>
                        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" id="photo-upload" />
                        <label htmlFor="photo-upload" className="cursor-pointer flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md">
                          <ImageIcon className="w-5 h-5" />
                          اختيار من الجهاز
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 text-start">• الحد الأقصى: 5 ميجابايت</p>
                    </div>
                  </div>
                </div>

                {/* الاسم واللقب بالعربية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><User className="w-4 h-4 inline ms-2" />الاسم (بالعربية) *</label>
                    <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" placeholder="مثال: محمد" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><User className="w-4 h-4 inline ms-2" />اللقب (بالعربية) *</label>
                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" placeholder="مثال: بن علي" required />
                  </div>
                </div>

                {/* الاسم واللقب باللاتينية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><User className="w-4 h-4 inline ms-2" />الاسم (باللاتينية) *</label>
                    <input type="text" value={formData.firstNameLatin} onChange={(e) => setFormData({ ...formData, firstNameLatin: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" placeholder="Example: Mohamed" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><User className="w-4 h-4 inline ms-2" />اللقب (باللاتينية) *</label>
                    <input type="text" value={formData.lastNameLatin} onChange={(e) => setFormData({ ...formData, lastNameLatin: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" placeholder="Example: Ben Ali" required />
                  </div>
                </div>

                {/* رقم التعريف الوطني NIN */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><CreditCard className="w-4 h-4 inline ms-2" />رقم التعريف الوطني (NIN) *</label>
                  <input type="text" value={formData.nin} onChange={(e) => setFormData({ ...formData, nin: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" placeholder="مثال: 123456789012345678" required />
                </div>

                {/* تاريخ الميلاد */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><Calendar className="w-4 h-4 inline ms-2" />تاريخ الميلاد</label>
                  <DateInput
                    value={formData.birthDate}
                    onChange={(value) => setFormData({ ...formData, birthDate: value })}
                    placeholder="يوم/شهر/سنة"
                  />
                </div>

                {/* مكان الازدياد */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><MapPin className="w-4 h-4 inline ms-2" />مكان الازدياد (الولاية)</label>
                  <select value={formData.birthPlaceCode} onChange={(e) => setFormData({ ...formData, birthPlaceCode: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all">
                    <option value="">اختر ولاية الازدياد</option>
                    {WILAYA_OPTIONS.map((wilaya) => (
                      <option key={wilaya.code} value={wilaya.code}>{wilaya.code} - {wilaya.label}</option>
                    ))}
                  </select>
                </div>

                {/* الجنس */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><Users className="w-4 h-4 inline ms-2" />الجنس</label>
                  <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value as "male" | "female" })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all">
                    <option value="">اختر الجنس</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>

                {/* المستوى الدراسي */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><GraduationCap className="w-4 h-4 inline ms-2" />المستوى الدراسي</label>
                  <select value={formData.educationLevel} onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as any })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all">
                    <option value="">اختر المستوى الدراسي</option>
                    {EDUCATION_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                {/* المهنة */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><Briefcase className="w-4 h-4 inline ms-2" />المهنة</label>
                  <select value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value as any, professionDetails: "" })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all">
                    <option value="">اختر المهنة</option>
                    {PROFESSIONS.map((prof) => (
                      <option key={prof.value} value={prof.value}>{prof.label}</option>
                    ))}
                  </select>
                </div>

                {/* تفاصيل المهنة (في حالة اختيار "أخرى") */}
                {formData.profession === "other" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><Briefcase className="w-4 h-4 inline ms-2" />تحديد المهنة *</label>
                    <input type="text" value={formData.professionDetails} onChange={(e) => setFormData({ ...formData, professionDetails: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" placeholder="أدخل المهنة بالتفصيل" required />
                  </div>
                )}

                {/* زر الانتقال للمرحلة التالية */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                  >
                    <span>المتابعة للمرحلة التالية</span>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ==================== المرحلة الثانية ==================== */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* عنوان المرحلة */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-4 mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Mail className="w-6 h-6" />
                    المرحلة الثانية: معلومات الاتصال والتأكيد
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">أدخل بيانات الاتصال والموقع الجغرافي</p>
                </div>

                {/* رقم الهاتف */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><Phone className="w-4 h-4 inline ms-2" />رقم الهاتف *</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" placeholder="مثال: 0555123456" required />
                </div>

                {/* البريد الإلكتروني */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><Mail className="w-4 h-4 inline ms-2" />البريد الإلكتروني *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" placeholder="example@email.com" required />
                </div>

                {/* كلمة المرور */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><Lock className="w-4 h-4 inline ms-2" />كلمة المرور *</label>
                    <input type="password" value={formData.password} onChange={(e) => handlePasswordChange(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" placeholder="6 أحرف على الأقل" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><Lock className="w-4 h-4 inline ms-2" />تأكيد كلمة المرور *</label>
                    <input type="password" value={formData.confirmPassword} onChange={(e) => handleConfirmPasswordChange(e.target.value)} className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${passwordMismatch ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"}`} placeholder="أعد إدخال كلمة المرور" required />
                    {passwordMismatch && <p className="text-red-500 text-sm mt-1 flex items-center gap-1 text-start"><AlertCircle className="w-4 h-4" />كلمة مرور غير متطابقة</p>}
                  </div>
                </div>

                {/* رقم بطاقة الانتخاب وتاريخ الإصدار */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><FileText className="w-4 h-4 inline ms-2" />رقم بطاقة الانتخاب</label>
                    <input type="text" value={formData.electoralCardNumber} onChange={(e) => setFormData({ ...formData, electoralCardNumber: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" placeholder="مثال: 123456789" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><Calendar className="w-4 h-4 inline ms-2" />تاريخ إصدار بطاقة الانتخاب</label>
                    <DateInput
                      value={formData.electoralCardIssueDate}
                      onChange={(value) => setFormData({ ...formData, electoralCardIssueDate: value })}
                      placeholder="يوم/شهر/سنة"
                    />
                  </div>
                </div>

                {/* سنة أول انخراط */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><Calendar className="w-4 h-4 inline ms-2" />سنة أول انخراط (لا تقل عن 1997)</label>
                  <input type="number" min="1997" max={new Date().getFullYear()} value={formData.firstJoinYear} onChange={(e) => setFormData({ ...formData, firstJoinYear: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" placeholder="مثال: 2010" />
                </div>

                {/* الصفة السياسية */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><CreditCard className="w-4 h-4 inline ms-2" />الصفة السياسية</label>
                  <select value={formData.memberType} onChange={(e) => setFormData({ ...formData, memberType: e.target.value as any })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all">
                    <option value="">اختر الصفة السياسية</option>
                    <option value="militant">مناضل</option>
                    <option value="municipal_elected">منتخب بلدي</option>
                    <option value="wilaya_elected">منتخب ولائي</option>
                    <option value="apn_elected">منتخب مجلس شعبي وطني</option>
                    <option value="senate_elected">منتخب مجلس الأمة</option>
                  </select>
                </div>

                {/* الصفة الهيكلية */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><Users className="w-4 h-4 inline ms-2" />الصفة الهيكلية</label>
                  <select value={formData.structuralPosition} onChange={(e) => setFormData({ ...formData, structuralPosition: e.target.value as any })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all">
                    <option value="">اختر الصفة الهيكلية</option>
                    <option value="militant">مناضل</option>
                    <option value="municipal_bureau_member">عضو مكتب بلدي</option>
                    <option value="wilaya_bureau_member">عضو مكتب ولائي</option>
                    <option value="national_bureau_member">عضو مكتب وطني</option>
                  </select>
                </div>

                {/* الصفة الإدارية */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><UserPlus className="w-4 h-4 inline ms-2" />الصفة الإدارية</label>
                  <select value={formData.administrativePosition} onChange={(e) => setFormData({ ...formData, administrativePosition: e.target.value as any })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all">
                    <option value="">اختر الصفة الإدارية</option>
                    <option value="militant">مناضل</option>
                    <option value="municipal_secretary">أمين بلدي</option>
                    <option value="wilaya_secretary">أمين ولائي</option>
                  </select>
                </div>

                {/* عضو المجلس الوطني */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isNationalCouncilMember} onChange={(e) => setFormData({ ...formData, isNationalCouncilMember: e.target.checked })} className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500" />
                    <span className="text-sm font-bold text-gray-700">عضو المجلس الوطني</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2 ms-8">علّم هذه الخانة إذا كنت عضواً في المجلس الوطني للحزب</p>
                </div>

                {/* الوظيفة */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><CreditCard className="w-4 h-4 inline ms-2" />الوظيفة</label>
                  <select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value as any })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all">
                    <option value="">اختر الوظيفة (اختياري)</option>
                    <option value="municipal_president">رئيس مجلس شعبي بلدي</option>
                    <option value="wilaya_president">رئيس مجلس شعبي ولائي</option>
                  </select>
                </div>

                {/* الدولة */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><Globe className="w-4 h-4 inline ms-2" />الدولة *</label>
                  <select value={formData.country} onChange={(e) => handleCountryChange(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" required>
                    <option value="">اختر الدولة</option>
                    {COMMON_COUNTRIES.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                    <option value="أخرى">دولة أخرى</option>
                  </select>
                  {formData.country === "أخرى" && (
                    <input type="text" placeholder="أدخل اسم الدولة" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all mt-2" onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                  )}
                </div>

                {/* الولاية */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><MapPin className="w-4 h-4 inline ms-2" />الولاية / المحافظة *</label>
                  {showWilayaDropdown ? (
                    <select value={formData.wilayaCode} onChange={(e) => handleWilayaChange(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" required>
                      <option value="">اختر الولاية (58 ولاية)</option>
                      {WILAYA_OPTIONS.map((wilaya) => (
                        <option key={wilaya.code} value={wilaya.code}>{wilaya.code} - {wilaya.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={formData.wilayaCode} onChange={(e) => setFormData({ ...formData, wilayaCode: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" placeholder="أدخل الولاية أو المحافظة" required />
                  )}
                </div>

                {/* البلدية */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-start"><MapPin className="w-4 h-4 inline ms-2" />البلدية / المدينة *</label>
                  {showWilayaDropdown && formData.wilayaCode ? (
                    <select value={formData.baladiya} onChange={(e) => setFormData({ ...formData, baladiya: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" required>
                      <option value="">اختر البلدية</option>
                      {availableCommunes.map((commune) => (
                        <option key={commune.name} value={commune.nameAr}>{commune.nameAr} ({commune.name})</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={formData.baladiya} onChange={(e) => setFormData({ ...formData, baladiya: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" placeholder="أدخل اسم البلدية أو المدينة" required />
                  )}
                </div>

                {/* قسم تحميل الوثائق */}
                <div className="border-t-2 border-gray-100 pt-8 mt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">الوثائق الرسمية</h3>
                      <p className="text-sm text-gray-500">يمكنك تحميل صور الوثائق أو التقاطها بالكاميرا</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* بطاقة التعريف الوطنية أو جواز السفر */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                      <h4 className="font-bold text-gray-800 mb-3 text-start flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        بطاقة التعريف الوطنية أو جواز السفر
                      </h4>
                      <p className="text-sm text-gray-600 mb-4 text-start">قم بتحميل صورة واضحة لبطاقة التعريف الوطنية أو جواز السفر</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DocumentUploader
                          documentType="national_id"
                          label="بطاقة التعريف الوطنية"
                          description="الوجه الأمامي والخلفي"
                          onUploadComplete={(storageId) => setNationalIdStorageId(storageId)}
                          existingPreview={nationalIdPreview}
                          onRemove={() => { setNationalIdStorageId(null); setNationalIdPreview(null); }}
                        />
                        <DocumentUploader
                          documentType="passport"
                          label="جواز السفر"
                          description="صفحة المعلومات الشخصية"
                          onUploadComplete={(storageId) => setPassportStorageId(storageId)}
                          existingPreview={passportPreview}
                          onRemove={() => { setPassportStorageId(null); setPassportPreview(null); }}
                        />
                      </div>
                    </div>

                    {/* بطاقة الناخب */}
                    <DocumentUploader
                      documentType="electoral_card"
                      label="بطاقة الناخب"
                      description="صورة واضحة لبطاقة الناخب (الوجه الأمامي)"
                      onUploadComplete={(storageId) => setElectoralCardStorageId(storageId)}
                      existingPreview={electoralCardPreview}
                      onRemove={() => { setElectoralCardStorageId(null); setElectoralCardPreview(null); }}
                    />
                  </div>

                  <div className="mt-4 flex items-start gap-2 text-amber-700 bg-amber-50 p-4 rounded-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-start">
                      <p className="font-bold mb-1">ملاحظة هامة:</p>
                      <ul className="space-y-1">
                        <li>• تأكد من وضوح الصور وظهور جميع المعلومات</li>
                        <li>• الحد الأقصى لحجم كل ملف: 10 ميجابايت</li>
                        <li>• يتم تسمية الوثائق تلقائياً برقم الانخراط</li>
                        <li>• الوثائق محفوظة بشكل آمن ولا يمكن الوصول إليها إلا من قبل الإدارة</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* أزرار التنقل والتسجيل */}
                <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    <span>العودة للمرحلة السابقة</span>
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || passwordMismatch} 
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        جاري التسجيل...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        تسجيل الآن
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* معلومات إضافية */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 bg-blue-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-start">ملاحظات هامة:</h3>
          {lastSaved && (
            <button type="button" onClick={() => { if (confirm("هل تريد مسح جميع البيانات المحفوظة؟")) { clearSavedData(); window.location.reload(); } }} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              <X className="w-4 h-4" />مسح البيانات المحفوظة
            </button>
          )}
        </div>
        <ul className="space-y-2 text-gray-700 text-start">
          <li>• الحقول المميزة بـ (*) إلزامية</li>
          <li>• تأكد من صحة جميع البيانات المدخلة</li>
          <li>• يجب كتابة الاسم واللقب بالعربية وباللاتينية</li>
          <li>• رقم التعريف الوطني (NIN) يجب أن يكون صحيحاً ومكون من 18 رقماً</li>
          <li>• البريد الإلكتروني يجب أن يكون صحيحاً ومفعلاً</li>
          <li>• كلمة المرور يجب أن تكون 6 أحرف على الأقل</li>
          <li>• سنة أول انخراط يجب أن لا تكون قبل 1997</li>
          <li>• الجزائر تضم 58 ولاية مع البلديات التابعة لها</li>
          <li>• سيتم إصدار رقم عضوية فريد مكون من 12 رقماً بعد التسجيل</li>
          <li>• احتفظ برقم العضوية وكلمة المرور للدخول إلى حسابك</li>
          <li>• يمكنك تحميل صور الوثائق الرسمية (بطاقة التعريف، جواز السفر، بطاقة الناخب)</li>
          <li className="text-green-700 font-medium">• يتم حفظ بياناتك تلقائياً أثناء الكتابة (ما عدا كلمة المرور)</li>
        </ul>
      </motion.div>
    </div>
  );
}

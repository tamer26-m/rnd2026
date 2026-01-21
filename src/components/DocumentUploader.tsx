import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Camera, Upload, X, FileText, CreditCard, Plane, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface DocumentUploaderProps {
  documentType: "national_id" | "passport" | "electoral_card";
  label: string;
  description: string;
  onUploadComplete: (storageId: string) => void;
  existingPreview?: string | null;
  onRemove?: () => void;
}

export default function DocumentUploader({
  documentType,
  label,
  description,
  onUploadComplete,
  existingPreview,
  onRemove,
}: DocumentUploaderProps) {
  const [preview, setPreview] = useState<string | null>(existingPreview || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const generateUploadUrl = useMutation(api.memberDocuments.generateDocumentUploadUrl);

  // تنظيف الكاميرا عند إغلاق المكون
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const getIcon = () => {
    switch (documentType) {
      case "national_id":
        return <CreditCard className="w-8 h-8 text-blue-500" />;
      case "passport":
        return <Plane className="w-8 h-8 text-green-500" />;
      case "electoral_card":
        return <FileText className="w-8 h-8 text-purple-500" />;
    }
  };

  const handleFileSelect = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن لا يتجاوز 10 ميجابايت");
      return;
    }

    // عرض المعاينة
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // رفع الملف
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("فشل رفع الملف");

      const { storageId } = await result.json();
      onUploadComplete(storageId);
      toast.success("تم رفع الوثيقة بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء رفع الوثيقة");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // إيقاف الكاميرا
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCameraModal(false);
    setIsCameraLoading(false);
    setIsCameraReady(false);
  }, []);

  // تشغيل الكاميرا
  const initializeCamera = useCallback(async () => {
    setIsCameraLoading(true);
    setIsCameraReady(false);
    
    try {
      // التحقق من دعم الكاميرا
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("المتصفح لا يدعم الكاميرا");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" }, 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // انتظار تحميل الفيديو
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setIsCameraLoading(false);
                setIsCameraReady(true);
              })
              .catch((err) => {
                console.error("خطأ في تشغيل الفيديو:", err);
                setIsCameraLoading(false);
                setIsCameraReady(true);
              });
          }
        };
      }
    } catch (error: any) {
      console.error("خطأ في الكاميرا:", error);
      stopCamera();
      
      if (error.name === "NotAllowedError") {
        toast.error("تم رفض إذن الكاميرا. يرجى السماح بالوصول إلى الكاميرا من إعدادات المتصفح.");
      } else if (error.name === "NotFoundError") {
        toast.error("لم يتم العثور على كاميرا. تأكد من توصيل الكاميرا.");
      } else if (error.name === "NotReadableError") {
        toast.error("الكاميرا مستخدمة من تطبيق آخر. أغلق التطبيقات الأخرى وحاول مرة أخرى.");
      } else {
        toast.error("لا يمكن الوصول إلى الكاميرا. تأكد من منح الإذن.");
      }
    }
  }, [stopCamera]);

  // فتح نافذة الكاميرا
  const startCamera = () => {
    setShowCameraModal(true);
  };

  // تهيئة الكاميرا عند فتح النافذة
  useEffect(() => {
    if (showCameraModal) {
      // تأخير قصير للسماح بعرض النافذة أولاً
      const timer = setTimeout(() => {
        initializeCamera();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showCameraModal, initializeCamera]);

  // التقاط الصورة
  const capturePhoto = () => {
    if (!isCameraReady) {
      toast.error("انتظر حتى تكون الكاميرا جاهزة");
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // التأكد من أن الفيديو يعمل
      if (video.readyState !== 4) {
        toast.error("الكاميرا غير جاهزة بعد، حاول مرة أخرى");
        return;
      }

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `${documentType}_capture.jpg`, { type: "image/jpeg" });
              handleFileSelect(file);
              stopCamera();
            } else {
              toast.error("فشل في التقاط الصورة، حاول مرة أخرى");
            }
          },
          "image/jpeg",
          0.9
        );
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-green-300 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-start">{label}</h4>
          <p className="text-sm text-gray-500 text-start mb-3">{description}</p>

          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt={label}
                className="w-full max-h-48 object-contain rounded-lg border border-gray-200"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                <CheckCircle className="w-4 h-4" />
                تم الرفع
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
                id={`file-${documentType}`}
              />
              <label
                htmlFor={`file-${documentType}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                <Upload className="w-5 h-5" />
                <span>تحميل من الجهاز</span>
              </label>
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
              >
                <Camera className="w-5 h-5" />
                <span>التقاط بالكاميرا</span>
              </button>
            </div>
          )}

          {isUploading && (
            <div className="mt-3 flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>جاري الرفع...</span>
            </div>
          )}
        </div>
      </div>

      {/* نافذة الكاميرا */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-4 bg-gradient-to-r from-green-600 to-blue-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg">التقاط صورة {label}</h3>
              <button
                onClick={stopCamera}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4" style={{ minHeight: "300px" }}>
                {isCameraLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-3"></div>
                      <p>جاري تشغيل الكاميرا...</p>
                      <p className="text-sm text-gray-400 mt-2">قد يُطلب منك السماح بالوصول للكاميرا</p>
                    </div>
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto"
                  style={{ minHeight: "300px", objectFit: "cover", display: isCameraReady ? "block" : "none" }}
                />
                {!isCameraLoading && !isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white">جاري تحميل الكاميرا...</p>
                  </div>
                )}
                {isCameraReady && (
                  <div className="absolute inset-0 border-4 border-dashed border-white/50 m-8 rounded-lg pointer-events-none"></div>
                )}
              </div>
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm text-start">تأكد من وضوح الوثيقة وظهور جميع المعلومات بشكل كامل</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  disabled={!isCameraReady}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold rounded-lg transition-all ${
                    isCameraReady 
                      ? "bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-xl cursor-pointer" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Camera className="w-6 h-6" />
                  {isCameraReady ? "التقاط الصورة" : "انتظر..."}
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-4 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}

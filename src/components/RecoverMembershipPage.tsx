import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Search, Phone, CreditCard, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

type Page = "home" | "activities" | "members" | "dashboard" | "gallery" | "register" | "login" | "recoverMembership";

export default function RecoverMembershipPage({ setCurrentPage }: { setCurrentPage: (page: Page) => void }) {
  const [searchMethod, setSearchMethod] = useState<"phone" | "nin">("phone");
  const [phone, setPhone] = useState("");
  const [nin, setNin] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);

  // استعلام البحث برقم الهاتف
  const memberByPhone = useQuery(
    api.members.recoverByPhone,
    searchTriggered && searchMethod === "phone" && phone.trim()
      ? { phone: phone.trim() }
      : "skip"
  );

  // استعلام البحث برقم التعريف الوطني
  const memberByNin = useQuery(
    api.members.recoverByNin,
    searchTriggered && searchMethod === "nin" && nin.trim()
      ? { nin: nin.trim() }
      : "skip"
  );

  // النتيجة النهائية
  const foundMembership = searchMethod === "phone" ? memberByPhone : memberByNin;

  // معالجة نتيجة البحث
  useEffect(() => {
    if (searchTriggered && foundMembership !== undefined) {
      setIsSearching(false);
      if (foundMembership) {
        toast.success("تم العثور على رقم العضوية!");
      } else {
        toast.error("لم يتم العثور على عضوية مطابقة");
        setSearchTriggered(false);
      }
    }
  }, [foundMembership, searchTriggered]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchMethod === "phone" && !phone.trim()) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }
    
    if (searchMethod === "nin" && !nin.trim()) {
      toast.error("يرجى إدخال رقم التعريف الوطني");
      return;
    }

    setIsSearching(true);
    setSearchTriggered(true);
  };

  const handleReset = () => {
    setSearchTriggered(false);
    setPhone("");
    setNin("");
    setIsSearching(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              استرجاع رقم العضوية
            </h2>
            <p className="text-gray-600">
              ابحث عن رقم عضويتك باستخدام رقم الهاتف أو NIN
            </p>
          </div>

          {!foundMembership || !searchTriggered ? (
            <>
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => {
                    setSearchMethod("phone");
                    setSearchTriggered(false);
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    searchMethod === "phone"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Phone className="w-5 h-5 inline-block ml-2" />
                  رقم الهاتف
                </button>
                <button
                  onClick={() => {
                    setSearchMethod("nin");
                    setSearchTriggered(false);
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    searchMethod === "nin"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <CreditCard className="w-5 h-5 inline-block ml-2" />
                  رقم NIN
                </button>
              </div>

              <form onSubmit={handleSearch} className="space-y-6">
                {searchMethod === "phone" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                      رقم الهاتف
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0555123456"
                        className="w-full pr-10 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-end"
                        dir="ltr"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                      رقم التعريف الوطني (NIN)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={nin}
                        onChange={(e) => setNin(e.target.value)}
                        placeholder="123456789012345678"
                        className="w-full pr-10 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-end"
                        dir="ltr"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSearching ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري البحث...
                    </span>
                  ) : (
                    "البحث عن رقم العضوية"
                  )}
                </button>
              </form>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 text-start">
                  <p className="font-medium mb-1">تذكر رقم عضويتك؟</p>
                  <button
                    type="button"
                    onClick={() => setCurrentPage("login")}
                    className="text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    سجل الدخول مباشرة من هنا
                  </button>
                </div>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h3 className="text-xl font-bold text-green-900">تم العثور على العضوية!</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">الاسم الكامل</p>
                    <p className="text-lg font-bold text-gray-900">{foundMembership.fullName}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">رقم العضوية</p>
                    <p className="text-2xl font-bold text-blue-600 font-mono" dir="ltr">
                      {foundMembership.membershipNumber}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">تاريخ الانخراط</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(foundMembership.joinDate).toLocaleDateString('ar-DZ')}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentPage("login")}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                تسجيل الدخول الآن
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={handleReset}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
              >
                بحث جديد
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

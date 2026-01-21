import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { LogIn, CreditCard, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

type Page = "home" | "activities" | "members" | "dashboard" | "gallery" | "register" | "login" | "recoverMembership";

export default function LoginPage({ setCurrentPage }: { setCurrentPage: (page: Page) => void }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [membershipNumber, setMembershipNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const loginWithMembership = useMutation(api.members.loginWithMembership);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!membershipNumber.trim()) {
      toast.error(isRTL ? "يرجى إدخال رقم العضوية" : "Please enter membership number");
      return;
    }

    if (!password.trim()) {
      toast.error(isRTL ? "يرجى إدخال كلمة المرور" : "Please enter password");
      return;
    }

    setIsLoggingIn(true);
    
    try {
      const member = await loginWithMembership({
        membershipNumber: membershipNumber.trim(),
        password: password.trim(),
      });

      // حفظ بيانات المنخرط في sessionStorage
      sessionStorage.setItem("currentMember", JSON.stringify(member));
      
      toast.success(isRTL ? `مرحباً ${member.fullName}! تم تسجيل الدخول بنجاح` : `Welcome ${member.fullName}! Login successful`);
      setCurrentPage("dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : (isRTL ? "حدث خطأ أثناء تسجيل الدخول" : "An error occurred during login");
      toast.error(message);
    } finally {
      setIsLoggingIn(false);
    }
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
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('login.title')}
            </h2>
            <p className="text-gray-600">
              {t('login.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-start' : 'text-left'}`}>
                {t('login.membershipNumber')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                  <CreditCard className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={membershipNumber}
                  onChange={(e) => setMembershipNumber(e.target.value)}
                  placeholder="123456789012"
                  className={`w-full ${isRTL ? 'pr-10' : 'pl-10'} px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all ${isRTL ? 'text-end' : 'text-start'}`}
                  dir="ltr"
                />
              </div>
              <p className={`mt-2 text-sm text-gray-500 ${isRTL ? 'text-start' : 'text-left'}`}>
                {t('login.membershipNumberHint')}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-start' : 'text-left'}`}>
                {t('login.password')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full ${isRTL ? 'pr-10' : 'pl-10'} px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className={`text-sm text-blue-800 ${isRTL ? 'text-start' : 'text-left'}`}>
                  <p className="font-medium mb-1">{t('login.forgotMembership')}</p>
                  <button
                    type="button"
                    onClick={() => setCurrentPage("recoverMembership")}
                    className="text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    {t('login.recoverMembership')}
                  </button>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className={`text-sm text-green-800 ${isRTL ? 'text-start' : 'text-left'}`}>
                  <p className="font-medium mb-1">{t('login.noMembership')}</p>
                  <button
                    type="button"
                    onClick={() => setCurrentPage("register")}
                    className="text-green-600 hover:text-green-800 font-medium underline"
                  >
                    {t('login.registerHere')}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t('login.loggingIn')}
                </span>
              ) : (
                t('login.loginButton')
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">
              {t('login.afterLogin')}
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                <span>{t('login.viewCard')}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                <span>{t('login.followActivities')}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                <span>{t('login.updateProfile')}</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

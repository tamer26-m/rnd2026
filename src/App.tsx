import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { useTranslation } from "react-i18next";
import { Menu, X, Home, Calendar, Building2, LayoutDashboard, Image, User, BarChart3, Zap } from "lucide-react";
import HomePage from "./components/HomePage";
import ActivitiesPage from "./components/ActivitiesPage";
import MembersPage from "./components/MembersPage";
import DashboardPage from "./components/DashboardPage";
import GalleryPage from "./components/GalleryPage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import RecoverMembershipPage from "./components/RecoverMembershipPage";
import UpdateProfilePage from "./components/UpdateProfilePage";
import UpdatePhotoPage from "./components/UpdatePhotoPage";
import MemberCardPage from "./components/MemberCardPage";
import StatsPage from "./components/StatsPage";
import SecretaryGeneralPage from "./components/SecretaryGeneralPage";
import SecretaryGeneralPageEN from "./components/SecretaryGeneralPageEN";
import NationalBureauPage from "./components/NationalBureauPage";
import AdminLoginPage from "./components/AdminLoginPage";
import AdminDashboardPage from "./components/AdminDashboardPage";
import MemberPoliticalActivitiesPage from "./components/MemberPoliticalActivitiesPage";
import NotificationsDropdown from "./components/NotificationsDropdown";
import LanguageSwitcher from "./components/LanguageSwitcher";
import QuickRegisterPage from "./components/QuickRegisterPage";
import SubscriptionReceiptPage from "./components/SubscriptionReceiptPage";


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

function App() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('adminLoggedIn') === 'true';
  });

  // تحديث اتجاه الصفحة عند تغيير اللغة
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // التحقق من تسجيل دخول المنخرط
  const currentMemberData = typeof window !== 'undefined' ? sessionStorage.getItem("currentMember") : null;
  const currentMember = currentMemberData ? JSON.parse(currentMemberData) : null;

  // التحقق من بيانات المسؤول
  const adminData = typeof window !== 'undefined' ? sessionStorage.getItem("adminData") : null;
  const currentAdmin = adminData ? JSON.parse(adminData) : null;

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem("currentMember");
    }
    setCurrentPage("home");
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setCurrentPage("adminDashboard");
  };

  const handleAdminLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adminLoggedIn');
      sessionStorage.removeItem('adminUsername');
    }
    setIsAdminLoggedIn(false);
    setCurrentPage("home");
  };

  // إذا كان المسؤول مسجل دخول، عرض لوحة التحكم فقط
  if (isAdminLoggedIn && currentPage === "adminDashboard") {
    return (
      <>
        <AdminDashboardPage admin={currentAdmin} onLogout={handleAdminLogout} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  const isRTL = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="bg-gradient-to-l from-[#003A3E] via-[#085860] to-[#328A91] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="https://polished-pony-114.convex.cloud/api/storage/f4515af9-29b8-44c3-829b-725279348c90"
                alt={t('siteName')}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h1 className={`text-xl font-bold text-white ${isRTL ? 'text-start' : 'text-left'}`}>{t('siteName')}</h1>
                <p className={`text-sm text-white/80 ${isRTL ? 'text-start' : 'text-left'}`}>{t('siteNameFr')}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-4">
              <button
                onClick={() => setCurrentPage("home")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  currentPage === "home"
                    ? "bg-green-900 text-white"
                    : "text-white hover:bg-green-800/50"
                }`}
              >
                <Home className="w-5 h-5" />
                {t('nav.home')}
              </button>
              <button
                onClick={() => setCurrentPage("activities")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  currentPage === "activities"
                    ? "bg-green-900 text-white"
                    : "text-white hover:bg-green-800/50"
                }`}
              >
                <Calendar className="w-5 h-5" />
                {t('nav.activities')}
              </button>
              <button
                onClick={() => setCurrentPage("secretaryGeneral")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  currentPage === "secretaryGeneral"
                    ? "bg-green-900 text-white"
                    : "text-white hover:bg-green-800/50"
                }`}
              >
                <User className="w-5 h-5" />
                {t('nav.secretaryGeneral')}
              </button>
              <button
                onClick={() => setCurrentPage("nationalBureau")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  currentPage === "nationalBureau"
                    ? "bg-green-900 text-white"
                    : "text-white hover:bg-green-800/50"
                }`}
              >
                <Building2 className="w-5 h-5" />
                {t('nav.nationalBureau')}
              </button>
              <button
                onClick={() => setCurrentPage("gallery")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  currentPage === "gallery"
                    ? "bg-green-900 text-white"
                    : "text-white hover:bg-green-800/50"
                }`}
              >
                <Image className="w-5 h-5" />
                {t('nav.gallery')}
              </button>
              <button
                onClick={() => setCurrentPage("stats")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  currentPage === "stats"
                    ? "bg-green-900 text-white"
                    : "text-white hover:bg-green-800/50"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                {t('nav.stats')}
              </button>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {currentMember ? (
                <>
                  {/* زر الإشعارات */}
                  <NotificationsDropdown membershipNumber={currentMember.membershipNumber} />
                  
                  <button
                    onClick={() => setCurrentPage("dashboard")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      currentPage === "dashboard"
                        ? "bg-green-900 text-white"
                        : "text-white hover:bg-green-800/50"
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    {t('nav.dashboard')}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentPage("login")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    {t('nav.login')}
                  </button>
                  <button
                    onClick={() => setCurrentPage("register")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    {t('nav.register')}
                  </button>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              {/* Language Switcher for Mobile */}
              <LanguageSwitcher />
              {/* زر الإشعارات للموبايل */}
              {currentMember && (
                <NotificationsDropdown membershipNumber={currentMember.membershipNumber} />
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-green-800/50 text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 space-y-2">
              <button
                onClick={() => {
                  setCurrentPage("home");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all ${isRTL ? 'text-start' : 'text-left'}`}
              >
                <Home className="w-5 h-5" />
                {t('nav.home')}
              </button>
              <button
                onClick={() => {
                  setCurrentPage("activities");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all ${isRTL ? 'text-start' : 'text-left'}`}
              >
                <Calendar className="w-5 h-5" />
                {t('nav.activities')}
              </button>
              <button
                onClick={() => {
                  setCurrentPage("secretaryGeneral");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all ${isRTL ? 'text-start' : 'text-left'}`}
              >
                <User className="w-5 h-5" />
                {t('nav.secretaryGeneral')}
              </button>
              <button
                onClick={() => {
                  setCurrentPage("nationalBureau");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all ${isRTL ? 'text-start' : 'text-left'}`}
              >
                <Building2 className="w-5 h-5" />
                {t('nav.nationalBureau')}
              </button>
              <button
                onClick={() => {
                  setCurrentPage("gallery");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all ${isRTL ? 'text-start' : 'text-left'}`}
              >
                <Image className="w-5 h-5" />
                {t('nav.gallery')}
              </button>
              <button
                onClick={() => {
                  setCurrentPage("stats");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all ${isRTL ? 'text-start' : 'text-left'}`}
              >
                <BarChart3 className="w-5 h-5" />
                {t('nav.stats')}
              </button>

              {currentMember ? (
                <>
                  <button
                    onClick={() => {
                      setCurrentPage("dashboard");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all ${isRTL ? 'text-start' : 'text-left'}`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    {t('nav.dashboard')}
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all ${isRTL ? 'text-start' : 'text-left'}`}
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  {/* رابط التسجيل السريع */}
                  <button
                    onClick={() => {
                      setCurrentPage("quickRegister");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold hover:from-green-600 hover:to-blue-600 transition-all ${isRTL ? 'text-start' : 'text-left'}`}
                  >
                    <Zap className="w-5 h-5" />
                    الانضمام السريع ⚡
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("login");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all ${isRTL ? 'text-start' : 'text-left'}`}
                  >
                    {t('nav.login')}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("register");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all ${isRTL ? 'text-start' : 'text-left'}`}
                  >
                    {t('nav.register')}
                  </button>
                </>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {currentPage === "home" && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === "activities" && <ActivitiesPage />}
        {currentPage === "members" && <MembersPage />}
        {currentPage === "dashboard" && <DashboardPage member={currentMember} setCurrentPage={setCurrentPage} />}
        {currentPage === "gallery" && <GalleryPage />}
        {currentPage === "register" && <RegisterPage setCurrentPage={setCurrentPage} />}
        {currentPage === "login" && <LoginPage setCurrentPage={setCurrentPage} />}
        {currentPage === "recoverMembership" && <RecoverMembershipPage setCurrentPage={setCurrentPage} />}
        {currentPage === "updateProfile" && <UpdateProfilePage setCurrentPage={setCurrentPage} />}
        {currentPage === "updatePhoto" && <UpdatePhotoPage setCurrentPage={setCurrentPage} />}
        {currentPage === "memberCard" && <MemberCardPage setCurrentPage={setCurrentPage} />}
        {currentPage === "stats" && <StatsPage />}
        {currentPage === "secretaryGeneral" && <SecretaryGeneralPage setCurrentPage={setCurrentPage as any} />}
        {currentPage === "secretaryGeneralEN" && <SecretaryGeneralPageEN setCurrentPage={setCurrentPage as any} />}
        {currentPage === "nationalBureau" && <NationalBureauPage />}
        {currentPage === "adminLogin" && <AdminLoginPage setCurrentPage={setCurrentPage} setIsAdminLoggedIn={setIsAdminLoggedIn} />}
        {currentPage === "myPoliticalActivities" && currentMember && (
          <MemberPoliticalActivitiesPage membershipNumber={currentMember.membershipNumber} />
        )}
        {currentPage === "quickRegister" && <QuickRegisterPage setCurrentPage={setCurrentPage} />}
        {currentPage === "subscriptionReceipt" && <SubscriptionReceiptPage setCurrentPage={setCurrentPage} />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={isRTL ? 'text-start' : 'text-left'}>
              <h3 className="text-xl font-bold mb-4">{t('footer.partyName')}</h3>
              <p className="text-gray-400">
                {t('footer.foundedDate')}
              </p>
            </div>
            <div className={isRTL ? 'text-start' : 'text-left'}>
              <h3 className="text-xl font-bold mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => setCurrentPage("home")} className="hover:text-white transition-colors">
                    {t('nav.home')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentPage("activities")} className="hover:text-white transition-colors">
                    {t('nav.activities')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentPage("nationalBureau")} className="hover:text-white transition-colors">
                    {t('nav.nationalBureau')}
                  </button>
                </li>
              </ul>
            </div>
            <div className={isRTL ? 'text-start' : 'text-left'}>
              <h3 className="text-xl font-bold mb-4">{t('footer.contactUs')}</h3>
              <p className="text-gray-400">
                {t('footer.contactText')}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2026 {t('footer.partyName')}. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

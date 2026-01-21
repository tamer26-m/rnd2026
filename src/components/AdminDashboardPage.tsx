import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Home,
  User,
  Shield,
  BarChart3,
  Image,
  Calendar,
  FileText,
  Download,
  CreditCard,
  Menu,
  X,
  ChevronRight,
  Key,
  Activity,
  Globe,
  Database,
  PieChart,
  Receipt,
} from "lucide-react";
import MembersManagementSection from "./MembersManagementSection";
import CVManagementSection from "./CVManagementSection";
import ExportMembersSection from "./ExportMembersSection";
import BulkCardsDownloadSection from "./BulkCardsDownloadSection";
import HomePageSettingsSection from "./admin/HomePageSettingsSection";
import SecretaryGeneralSettingsSection from "./admin/SecretaryGeneralSettingsSection";
import SecretaryGeneralSettingsENSection from "./admin/SecretaryGeneralSettingsENSection";
import NationalBureauManagementSection from "./admin/NationalBureauManagementSection";
import GalleryManagementSection from "./admin/GalleryManagementSection";
import ActivitiesManagementSection from "./admin/ActivitiesManagementSection";
import AdminsManagementSection from "./admin/AdminsManagementSection";
import MemberCardSettingsSection from "./admin/MemberCardSettingsSection";
import ComprehensiveStatsSection from "./admin/ComprehensiveStatsSection";
import MemberActivitiesManagementSection from "./admin/MemberActivitiesManagementSection";
import ChangePasswordSection from "./admin/ChangePasswordSection";
import DatabaseManagementSection from "./admin/DatabaseManagementSection";
import SubscriptionManagementSection from "./admin/SubscriptionManagementSection";

interface AdminDashboardPageProps {
  admin: any;
  onLogout: () => void;
}

type AdminSection = 
  | "dashboard" 
  | "members" 
  | "cvs"
  | "export" 
  | "cards" 
  | "cardSettings"
  | "subscriptions"
  | "homepage" 
  | "secretary" 
  | "secretaryEN"
  | "bureau" 
  | "gallery" 
  | "activities" 
  | "memberActivities"
  | "admins" 
  | "stats"
  | "database"
  | "changePassword";

export default function AdminDashboardPage({ admin, onLogout }: AdminDashboardPageProps) {
  const [currentSection, setCurrentSection] = useState<AdminSection>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const stats = useQuery(api.memberManagement.getMembersStats, { adminUsername: admin.username });
  const cvStats = useQuery(api.memberCV.getCVStats, { adminUsername: admin.username });

  const menuItems = [
    { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, permission: true },
    { id: "members", label: "إدارة المنخرطين", icon: Users, permission: admin.permissions?.canManageMembers },
    { id: "cvs", label: "السير الذاتية", icon: FileText, permission: admin.permissions?.canManageMembers },
    { id: "export", label: "تصدير البيانات", icon: Download, permission: admin.permissions?.canExportData },
    { id: "cards", label: "تحميل البطاقات", icon: CreditCard, permission: admin.permissions?.canManageMembers },
    { id: "cardSettings", label: "إعدادات البطاقة", icon: CreditCard, permission: admin.permissions?.canEditHomePage },
    { id: "subscriptions", label: "إدارة الاشتراكات", icon: Receipt, permission: admin.permissions?.canManageMembers },
    { id: "database", label: "قاعدة البيانات", icon: Database, permission: admin.permissions?.canExportData },
    { id: "homepage", label: "الصفحة الرئيسية", icon: Home, permission: admin.permissions?.canEditHomePage },
    { id: "secretary", label: "الأمين العام (عربي)", icon: User, permission: admin.permissions?.canEditSecretaryGeneral },
    { id: "secretaryEN", label: "الأمين العام (إنجليزي)", icon: Globe, permission: admin.permissions?.canEditSecretaryGeneral },
    { id: "bureau", label: "المكتب الوطني", icon: Shield, permission: admin.permissions?.canEditNationalBureau },
    { id: "gallery", label: "المعرض", icon: Image, permission: admin.permissions?.canManageGallery },
    { id: "activities", label: "الأنشطة العامة", icon: Calendar, permission: admin.permissions?.canManageActivities },
    { id: "memberActivities", label: "أنشطة المنخرطين", icon: Activity, permission: admin.permissions?.canManageActivities },
    { id: "admins", label: "إدارة المسؤولين", icon: Shield, permission: admin.permissions?.canManageAdmins },
    { id: "stats", label: "الإحصائيات الشاملة", icon: PieChart, permission: admin.permissions?.canViewStats },
    { id: "changePassword", label: "تغيير كلمة المرور", icon: Key, permission: true },
  ];

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-start">مرحباً، {admin.fullName}</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">إجمالي المنخرطين</p>
                    <p className="text-4xl font-bold mt-2">{stats?.total || 0}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">المنخرطين النشطين</p>
                    <p className="text-4xl font-bold mt-2">{stats?.active || 0}</p>
                  </div>
                  <Users className="w-12 h-12 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">السير الذاتية</p>
                    <p className="text-4xl font-bold mt-2">{cvStats?.totalCVs || 0}</p>
                  </div>
                  <FileText className="w-12 h-12 text-red-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">نسبة تغطية CV</p>
                    <p className="text-4xl font-bold mt-2">{cvStats?.cvPercentage || 0}%</p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-start">الإجراءات السريعة</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <button
                  onClick={() => setCurrentSection("members")}
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all flex flex-col items-center gap-2"
                >
                  <Users className="w-8 h-8 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">المنخرطين</span>
                </button>
                <button
                  onClick={() => setCurrentSection("export")}
                  className="p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all flex flex-col items-center gap-2"
                >
                  <Download className="w-8 h-8 text-green-600" />
                  <span className="text-sm font-medium text-green-800">تصدير Excel</span>
                </button>
                <button
                  onClick={() => setCurrentSection("homepage")}
                  className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all flex flex-col items-center gap-2"
                >
                  <Home className="w-8 h-8 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">الصفحة الرئيسية</span>
                </button>
                <button
                  onClick={() => setCurrentSection("gallery")}
                  className="p-4 bg-pink-50 hover:bg-pink-100 rounded-xl transition-all flex flex-col items-center gap-2"
                >
                  <Image className="w-8 h-8 text-pink-600" />
                  <span className="text-sm font-medium text-pink-800">المعرض</span>
                </button>
                <button
                  onClick={() => setCurrentSection("stats")}
                  className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all flex flex-col items-center gap-2"
                >
                  <PieChart className="w-8 h-8 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-800">الإحصائيات</span>
                </button>
                <button
                  onClick={() => setCurrentSection("database")}
                  className="p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-all flex flex-col items-center gap-2"
                >
                  <Database className="w-8 h-8 text-red-600" />
                  <span className="text-sm font-medium text-red-800">قاعدة البيانات</span>
                </button>
              </div>
            </div>

            {/* Gender Stats */}
            {stats && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-start">توزيع المنخرطين حسب الجنس</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-blue-700">{stats.male}</p>
                    <p className="text-blue-600">ذكور</p>
                  </div>
                  <div className="bg-pink-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-pink-700">{stats.female}</p>
                    <p className="text-pink-600">إناث</p>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-start">معلومات الحساب</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">اسم المستخدم</p>
                  <p className="font-semibold text-gray-800">{admin.username}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">الدور</p>
                  <p className="font-semibold text-gray-800">{admin.role}</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "members":
        return <MembersManagementSection adminUsername={admin.username} />;
      
      case "cvs":
        return <CVManagementSection adminUsername={admin.username} />;
      
      case "export":
        return <ExportMembersSection adminUsername={admin.username} />;
      
      case "cards":
        return <BulkCardsDownloadSection adminUsername={admin.username} />;
      
      case "cardSettings":
        return <MemberCardSettingsSection adminUsername={admin.username} />;
      
      case "subscriptions":
        return <SubscriptionManagementSection />;
      
      case "database":
        return <DatabaseManagementSection adminUsername={admin.username} />;
      
      case "homepage":
        return <HomePageSettingsSection adminUsername={admin.username} />;
      
      case "secretary":
        return <SecretaryGeneralSettingsSection adminUsername={admin.username} />;
      
      case "secretaryEN":
        return <SecretaryGeneralSettingsENSection adminUsername={admin.username} />;
      
      case "bureau":
        return <NationalBureauManagementSection adminUsername={admin.username} />;
      
      case "gallery":
        return <GalleryManagementSection adminUsername={admin.username} />;
      
      case "activities":
        return <ActivitiesManagementSection adminUsername={admin.username} />;
      
      case "memberActivities":
        return <MemberActivitiesManagementSection adminUsername={admin.username} />;
      
      case "admins":
        return <AdminsManagementSection adminUsername={admin.username} />;
      
      case "stats":
        return <ComprehensiveStatsSection adminUsername={admin.username} />;
      
      case "changePassword":
        return <ChangePasswordSection adminUsername={admin.username} />;
      
      default:
        return (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">قريباً</h3>
            <p className="text-gray-500">هذا القسم قيد التطوير</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-md p-4 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">لوحة التحكم</h1>
        <button
          onClick={onLogout}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 right-0 z-50 w-72 bg-gradient-to-b from-gray-900 to-gray-800 transform transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">لوحة الإدارة</h2>
                <p className="text-gray-400 text-sm">{admin.fullName}</p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            {menuItems.map((item) => {
              if (!item.permission) return null;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentSection(item.id as AdminSection);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                    currentSection === item.id
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {currentSection === item.id && (
                    <ChevronRight className="w-4 h-4 mr-auto" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/30 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto min-h-screen">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

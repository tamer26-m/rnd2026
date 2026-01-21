import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  Filter,
} from "lucide-react";
import { WILAYAS } from "../data/algeriaGeoData";
import DateInput from "./DateInput";

const ACTIVITY_TYPES = {
  public_gathering: "تجمع شعبي",
  community_work: "عمل جواري",
  executive_meeting: "لقاء مع مسؤول تنفيذي",
  party_meeting: "اجتماع حزبي",
  electoral_campaign: "حملة انتخابية",
  media_appearance: "ظهور إعلامي",
  citizen_reception: "استقبال المواطنين",
  field_visit: "زيارة ميدانية",
  other: "أخرى",
};

const STATUS_LABELS = {
  planned: { label: "مخطط", color: "bg-blue-100 text-blue-700" },
  completed: { label: "منجز", color: "bg-green-100 text-green-700" },
  cancelled: { label: "ملغى", color: "bg-red-100 text-red-700" },
};

interface MemberPoliticalActivitiesPageProps {
  membershipNumber: string;
}

export default function MemberPoliticalActivitiesPage({ membershipNumber }: MemberPoliticalActivitiesPageProps) {
  const activities = useQuery(api.memberPoliticalActivities.getMyPoliticalActivities, { membershipNumber });
  const stats = useQuery(api.memberPoliticalActivities.getMyActivitiesStats, { membershipNumber });
  const addActivity = useMutation(api.memberPoliticalActivities.addPoliticalActivity);
  const updateActivity = useMutation(api.memberPoliticalActivities.updatePoliticalActivity);
  const deleteActivity = useMutation(api.memberPoliticalActivities.deletePoliticalActivity);

  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // حقول النموذج
  const [activityType, setActivityType] = useState<string>("public_gathering");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [baladiya, setBaladiya] = useState("");
  const [attendeesCount, setAttendeesCount] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"planned" | "completed" | "cancelled">("planned");
  const [submitting, setSubmitting] = useState(false);

  // الحصول على البلديات حسب الولاية المختارة
  const availableBaladiyas = useMemo(() => {
    if (!wilaya) return [];
    const selectedWilaya = WILAYAS.find(w => w.nameAr === wilaya);
    if (!selectedWilaya) return [];
    
    // جمع جميع البلديات من جميع الدوائر
    const baladiyas: string[] = [];
    selectedWilaya.dairas.forEach(daira => {
      daira.communes.forEach(commune => {
        baladiyas.push(commune.nameAr);
      });
    });
    return baladiyas.sort((a, b) => a.localeCompare(b, 'ar'));
  }, [wilaya]);

  const resetForm = () => {
    setActivityType("public_gathering");
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setLocation("");
    setWilaya("");
    setBaladiya("");
    setAttendeesCount("");
    setNotes("");
    setStatus("planned");
    setEditingActivity(null);
    setShowForm(false);
  };

  // إعادة تعيين البلدية عند تغيير الولاية
  const handleWilayaChange = (newWilaya: string) => {
    setWilaya(newWilaya);
    setBaladiya("");
  };

  const handleSubmit = async () => {
    if (!title || !date || !time || !location || !wilaya) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setSubmitting(true);
    try {
      if (editingActivity) {
        await updateActivity({
          membershipNumber,
          activityId: editingActivity._id,
          activityType: activityType as any,
          title,
          description: description || undefined,
          date: new Date(date).getTime(),
          time,
          location,
          wilaya,
          baladiya: baladiya || undefined,
          attendeesCount: attendeesCount ? Number(attendeesCount) : undefined,
          notes: notes || undefined,
          status,
        });
        toast.success("تم تحديث النشاط بنجاح");
      } else {
        await addActivity({
          membershipNumber,
          activityType: activityType as any,
          title,
          description: description || undefined,
          date: new Date(date).getTime(),
          time,
          location,
          wilaya,
          baladiya: baladiya || undefined,
          attendeesCount: attendeesCount ? Number(attendeesCount) : undefined,
          notes: notes || undefined,
          status,
        });
        toast.success("تم إضافة النشاط بنجاح");
      }
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (activityId: any) => {
    if (!confirm("هل أنت متأكد من حذف هذا النشاط؟")) return;
    try {
      await deleteActivity({ membershipNumber, activityId });
      toast.success("تم حذف النشاط بنجاح");
    } catch (error) {
      toast.error("فشل حذف النشاط");
    }
  };

  const startEdit = (activity: any) => {
    setEditingActivity(activity);
    setActivityType(activity.activityType);
    setTitle(activity.title);
    setDescription(activity.description || "");
    setDate(new Date(activity.date).toISOString().split("T")[0]);
    setTime(activity.time);
    setLocation(activity.location);
    setWilaya(activity.wilaya);
    setBaladiya(activity.baladiya || "");
    setAttendeesCount(activity.attendeesCount || "");
    setNotes(activity.notes || "");
    setStatus(activity.status);
    setShowForm(true);
  };

  // فلترة الأنشطة
  const filteredActivities = activities?.filter((activity) => {
    if (filterType !== "all" && activity.activityType !== filterType) return false;
    if (filterStatus !== "all" && activity.status !== filterStatus) return false;
    return true;
  });

  if (activities === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* العنوان */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-start">أنشطتي السياسية</h1>
            <p className="text-gray-600 mt-1 text-start">سجل ومتابعة جميع أنشطتك السياسية</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة نشاط
          </button>
        </div>

        {/* الإحصائيات */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              <p className="text-blue-600 text-sm">إجمالي الأنشطة</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
              <p className="text-green-600 text-sm">أنشطة منجزة</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
              <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-700">{stats.planned}</p>
              <p className="text-orange-600 text-sm">أنشطة مخططة</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-700">{stats.totalAttendees}</p>
              <p className="text-purple-600 text-sm">إجمالي الحضور</p>
            </div>
          </div>
        )}

        {/* نموذج الإضافة/التعديل */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingActivity ? "تعديل النشاط" : "إضافة نشاط جديد"}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">نوع النشاط *</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                >
                  {Object.entries(ACTIVITY_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">عنوان النشاط *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: لقاء مع المواطنين حول مشاكل الحي"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">التاريخ *</label>
                <DateInput
                  value={date}
                  onChange={(value) => setDate(value)}
                  placeholder="يوم/شهر/سنة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الساعة *</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">الحالة</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                >
                  <option value="planned">مخطط</option>
                  <option value="completed">منجز</option>
                  <option value="cancelled">ملغى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                  <MapPin className="w-4 h-4 inline ms-1" />
                  الولاية *
                </label>
                <select
                  value={wilaya}
                  onChange={(e) => handleWilayaChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                >
                  <option value="">اختر الولاية</option>
                  {WILAYAS.map((w) => (
                    <option key={w.code} value={w.nameAr}>
                      {w.code} - {w.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                  <MapPin className="w-4 h-4 inline ms-1" />
                  البلدية
                </label>
                <select
                  value={baladiya}
                  onChange={(e) => setBaladiya(e.target.value)}
                  disabled={!wilaya}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">اختر البلدية</option>
                  {availableBaladiyas.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                {!wilaya && (
                  <p className="text-xs text-gray-500 mt-1">اختر الولاية أولاً</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">المكان *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="مثال: قاعة الاجتماعات البلدية"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">عدد الحضور (تقديري)</label>
                <input
                  type="number"
                  value={attendeesCount}
                  onChange={(e) => setAttendeesCount(e.target.value ? Number(e.target.value) : "")}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">وصف النشاط</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="وصف مختصر للنشاط..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">ملاحظات إضافية</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="أي ملاحظات إضافية..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {editingActivity ? "حفظ التعديلات" : "إضافة النشاط"}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        )}

        {/* الفلاتر */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500"
            >
              <option value="all">جميع الأنواع</option>
              {Object.entries(ACTIVITY_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="planned">مخطط</option>
            <option value="completed">منجز</option>
            <option value="cancelled">ملغى</option>
          </select>
        </div>

        {/* قائمة الأنشطة */}
        {filteredActivities && filteredActivities.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد أنشطة</h3>
            <p className="text-gray-500 mb-6">ابدأ بإضافة أول نشاط سياسي لك</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all"
            >
              إضافة نشاط جديد
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities?.map((activity) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 text-start">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${STATUS_LABELS[activity.status].color}`}>
                        {STATUS_LABELS[activity.status].label}
                      </span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                        {ACTIVITY_TYPES[activity.activityType as keyof typeof ACTIVITY_TYPES]}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{activity.title}</h3>
                    {activity.description && (
                      <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(activity.date).toLocaleDateString("ar-DZ")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {activity.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {activity.wilaya} {activity.baladiya ? `- ${activity.baladiya}` : ""} - {activity.location}
                      </span>
                      {activity.attendeesCount && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {activity.attendeesCount} حاضر
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(activity)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="تعديل"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(activity._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="حذف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

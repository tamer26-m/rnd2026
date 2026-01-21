import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ActivitiesPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");
  const activities = useQuery(api.activities.listActivities, {
    status: filter === "all" ? undefined : filter,
  });

  if (activities === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming":
        return t('activities.upcoming');
      case "ongoing":
        return t('activities.ongoing');
      case "completed":
        return t('activities.completed');
      default:
        return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="relative h-96">
          <img 
            src="https://polished-pony-114.convex.cloud/api/storage/ac98962b-673c-4864-958d-1080a6f7f53f"
            alt={t('activities.title')}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isRTL ? 'text-start' : 'text-left'}`}>
              {t('activities.title')}
            </h1>
            <p className={`text-xl ${isRTL ? 'text-start' : 'text-left'}`}>
              {t('activities.subtitle')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <FilterButton
          label={t('activities.all')}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterButton
          label={t('activities.upcoming')}
          active={filter === "upcoming"}
          onClick={() => setFilter("upcoming")}
        />
        <FilterButton
          label={t('activities.completed')}
          active={filter === "completed"}
          onClick={() => setFilter("completed")}
        />
      </div>

      {/* Activities Grid */}
      {activities.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-24 h-24 mx-auto mb-6 text-gray-300" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('activities.noActivities')}</h3>
          <p className="text-gray-600">{t('activities.noActivitiesDesc')}</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {activities.map((activity, index) => (
            <motion.div
              key={activity._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
            >
              <div className={`h-2 ${
                activity.status === "upcoming" ? "bg-gradient-to-r from-green-500 to-green-600" :
                activity.status === "ongoing" ? "bg-gradient-to-r from-yellow-500 to-yellow-600" :
                "bg-gradient-to-r from-red-500 to-red-600"
              }`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className={`text-xl font-bold text-gray-900 ${isRTL ? 'text-start' : 'text-left'} flex-1`}>
                    {activity.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activity.status === "upcoming" ? "bg-green-100 text-green-700" :
                    activity.status === "ongoing" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {getStatusLabel(activity.status)}
                  </span>
                </div>
                <p className={`text-gray-600 mb-4 ${isRTL ? 'text-start' : 'text-left'} line-clamp-2`}>
                  {activity.description}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span>{new Date(activity.date).toLocaleDateString(isRTL ? "ar-DZ" : "en-US")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>{activity.wilaya} - {activity.baladiya}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>{activity.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg font-medium transition-all ${
        active
          ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
          : "bg-white text-gray-700 hover:bg-gray-100 shadow"
      }`}
    >
      {label}
    </button>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface NotificationsDropdownProps {
  membershipNumber: string;
}

export default function NotificationsDropdown({ membershipNumber }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const notifications = useQuery(api.notifications.getMyNotifications, {
    membershipNumber,
    limit: 20,
  });
  
  const unreadCount = useQuery(api.notifications.getUnreadCount, {
    membershipNumber,
  });
  
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsRead({ membershipNumber, notificationId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ membershipNumber });
      toast.success("تم تحديد جميع الإشعارات كمقروءة");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleDelete = async (notificationId: Id<"notifications">) => {
    try {
      await deleteNotification({ membershipNumber, notificationId });
      toast.success("تم حذف الإشعار");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString("ar-DZ");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "activity_created":
        return "🎉";
      case "activity_updated":
        return "📝";
      case "gallery_image_added":
        return "🖼️";
      default:
        return "🔔";
    }
  };

  return (
    <div className="relative">
      {/* زر الإشعارات */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* عداد الإشعارات غير المقروءة */}
        {unreadCount !== undefined && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* قائمة الإشعارات */}
      {isOpen && (
        <>
          {/* خلفية شفافة للإغلاق */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden">
            {/* رأس القائمة */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-l from-emerald-600 to-emerald-700 text-white">
              <h3 className="font-bold text-lg">الإشعارات</h3>
              {unreadCount !== undefined && unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm hover:underline"
                >
                  تحديد الكل كمقروء
                </button>
              )}
            </div>

            {/* قائمة الإشعارات */}
            <div className="overflow-y-auto max-h-96">
              {notifications === undefined ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-500">جاري التحميل...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-5xl mb-3">🔔</div>
                  <p className="text-gray-500">لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? "bg-emerald-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`font-semibold text-gray-900 truncate ${
                              !notification.isRead ? "text-emerald-700" : ""
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatDate(notification.createdAt)}
                            </span>
                            <div className="flex items-center gap-2">
                              {!notification.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className="text-xs text-emerald-600 hover:text-emerald-700"
                                >
                                  تحديد كمقروء
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(notification._id)}
                                className="text-xs text-red-500 hover:text-red-600"
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* تذييل القائمة */}
            {notifications && notifications.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  إغلاق
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

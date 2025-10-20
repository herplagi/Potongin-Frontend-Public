import React, { useState, useEffect, useRef } from "react";
import {
  FiBell,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiStar,
  FiCheckCircle,
} from "react-icons/fi";
import api from "../services/api";
import { toast } from "react-toastify";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications?limit=10");
      console.log("📥 Notifications fetched:", response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch notifications:", error);
      toast.error("Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      console.log("📊 Unread count:", response.data.count);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("❌ Failed to fetch unread count:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("❌ Failed to mark as read:", error);
      toast.error("Gagal menandai notifikasi");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
      toast.success("Semua notifikasi ditandai telah dibaca");
    } catch (error) {
      console.error("❌ Failed to mark all as read:", error);
      toast.error("Gagal menandai semua notifikasi");
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { size: 20, className: "text-indigo-600 flex-shrink-0" };

    switch (type) {
      case "booking_created":
        return <FiCalendar {...iconProps} />;
      case "payment_success":
        return <FiDollarSign {...iconProps} />;
      case "booking_reminder":
        return <FiClock {...iconProps} />;
      case "review_request":
        return <FiStar {...iconProps} />;
      case "booking_confirmed":
        return <FiCheckCircle {...iconProps} />;
      default:
        return <FiBell {...iconProps} />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} menit yang lalu`;
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} hari yang lalu`;
    }
  };

  const handleToggleDropdown = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) {
      fetchNotifications();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
        aria-label="Notifications"
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ✅ DROPDOWN - KELUAR KE KANAN DARI SIDEBAR */}
      {isOpen && (
        <div 
          className="fixed left-64 top-20 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999] max-h-[600px] overflow-hidden flex flex-col"
          style={{
            marginLeft: '1rem' // Jarak dari sidebar
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center space-x-2">
              <FiBell className="text-indigo-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
              >
                Tandai Semua
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 bg-gray-50">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm">Memuat notifikasi...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <FiBell className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 font-medium">Belum ada notifikasi</p>
                <p className="text-gray-400 text-sm mt-1">Notifikasi akan muncul di sini</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.notification_id}
                  onClick={() =>
                    !notif.is_read && handleMarkAsRead(notif.notification_id)
                  }
                  className={`p-4 border-b border-gray-200 hover:bg-white cursor-pointer transition-all duration-200 ${
                    !notif.is_read ? "bg-blue-50 border-l-4 border-l-blue-500" : "bg-white"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p
                          className={`text-sm text-gray-900 ${
                            !notif.is_read ? "font-bold" : "font-medium"
                          }`}
                        >
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <FiClock size={12} className="mr-1" />
                        {formatTime(notif.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page if needed
                }}
                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 hover:bg-indigo-50 rounded-md transition-colors"
              >
                Lihat Semua Notifikasi →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
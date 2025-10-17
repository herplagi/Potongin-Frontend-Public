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
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
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
      const response = await api.get("/notifications?limit=10");
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
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
      toast.error("Gagal menandai semua notifikasi");
    }
  };

  // ✅ FIX: Gunakan icon dari react-icons
  const getNotificationIcon = (type) => {
    const iconProps = { size: 24, className: "text-indigo-600" };

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-gray-300 hover:text-white transition-colors"
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 rounded-full w-2 h-2"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-full top-0 ml-2 mt-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] max-h-[600px] overflow-hidden flex flex-col origin-top-left">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Tandai Semua Dibaca
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <FiBell className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500">Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.notification_id}
                  onClick={() =>
                    !notif.is_read && handleMarkAsRead(notif.notification_id)
                  }
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notif.is_read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium text-gray-900 ${
                          !notif.is_read ? "font-bold" : ""
                        }`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="flex-shrink-0">
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                      </div>
                    )}
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
                  // Navigate to full notifications page if needed
                }}
                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Lihat Semua Notifikasi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

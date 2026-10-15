import React from 'react';
import { Bell, CheckCheck, X, Clock, ExternalLink } from 'lucide-react';
import { useOrders } from '../context/OrderContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function NotificationsModal({ isOpen, onClose, onTrackOrder }) {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useOrders();
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  // Filter for current user's notifications
  const userNotifications = notifications.filter(
    n => !currentUser || n.userId === currentUser.uid
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl flex flex-col z-10">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-300" />
            <h3 className="font-bold text-sm">In-App Notifications</h3>
            <span className="bg-emerald-800 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {userNotifications.filter(n => !n.read).length} new
            </span>
          </div>
          <div className="flex items-center gap-2">
            {userNotifications.some(n => !n.read) && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] text-emerald-200 hover:text-white flex items-center gap-1 font-semibold"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark Read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {userNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No notifications yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                You will receive alerts here when your food is accepted, preparing, or ready for pickup.
              </p>
            </div>
          ) : (
            userNotifications.map((notif) => {
              const timeAgoMin = Math.max(0, Math.floor((Date.now() - new Date(notif.createdAt).getTime()) / 60000));
              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    notif.read 
                      ? 'bg-slate-50 border-slate-200 text-slate-700' 
                      : 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${notif.read ? 'bg-slate-300' : 'bg-emerald-600 animate-pulse'}`} />
                        <h4 className="text-xs font-bold text-emerald-950">{notif.title}</h4>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold shrink-0"
                        title="Mark read"
                      >
                        Read
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" /> {timeAgoMin === 0 ? 'Just now' : `${timeAgoMin}m ago`}
                    </span>
                    {notif.orderId && onTrackOrder && (
                      <button
                        onClick={() => {
                          onClose();
                          onTrackOrder(notif.orderId);
                        }}
                        className="text-emerald-800 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>View Order</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

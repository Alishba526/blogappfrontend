'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, Heart, MessageSquare, UserPlus, UserCheck, Repeat, Bell, CheckCircle2, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={16} className="text-red-500 fill-red-500" />;
      case 'comment': return <MessageSquare size={16} className="text-blue-500" />;
      case 'follow': return <UserPlus size={16} className="text-purple-500" />;
      case 'connection_request': return <UserPlus size={16} className="text-orange-500" />;
      case 'connection_accept': return <UserCheck size={16} className="text-green-500" />;
      case 'blog_repost': return <Repeat size={16} className="text-green-500" />;
      case 'message': return <MessageSquare size={16} className="text-purple-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="text-purple-600" /> Notifications
          </h1>
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={markAllAsRead}
              className="text-sm font-semibold text-purple-600 hover:underline flex items-center gap-1"
            >
              <CheckCircle2 size={16} /> Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-purple-600" size={40} />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`bg-white p-4 rounded-xl border shadow-sm transition flex items-start justify-between group ${!notif.isRead ? 'border-l-4 border-l-purple-600 bg-purple-50/30' : ''}`}
                onMouseEnter={() => !notif.isRead && markAsRead(notif._id)}
              >
                <div className="flex gap-4">
                  <div className="relative">
                    <Image 
                      src={notif.sender?.avatar || '/placeholder.png'} 
                      alt={notif.sender?.name} 
                      width={48} 
                      height={48} 
                      className="rounded-full w-12 h-12 object-cover border"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border">
                      {getIcon(notif.type)}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-800">
                      <Link href={`/profile/${notif.sender?._id}`} className="font-bold hover:text-purple-600 transition">
                        {notif.sender?.name}
                      </Link>{' '}
                      {notif.message}{' '}
                      {notif.blog && (
                        <Link href={`/blog/${notif.blog._id}`} className="font-semibold text-purple-600 hover:underline">
                          "{notif.blog.title}"
                        </Link>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={12} /> {formatDistanceToNow(new Date(notif.createdAt))} ago
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => deleteNotification(notif._id)}
                  className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border">
              <Bell size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-gray-500">No notifications yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

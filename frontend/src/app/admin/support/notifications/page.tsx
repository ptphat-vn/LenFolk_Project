'use client';

import { useState, useEffect } from 'react';
import { Notification, CreateNotificationInput, NotificationType } from '@/types/notification.types';
import { notificationApi } from '@/lib/api/notification.api';
import { 
  Bell,
  Send,
  User,
  Type,
  MessageSquare,
  List,
  CheckCircle2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateNotificationInput>({
    userId: '',
    title: '',
    body: '',
    type: 'system',
  });

  useEffect(() => {
    fetchMyNotifications();
  }, []);

  async function fetchMyNotifications() {
    try {
      setLoading(true);
      const res = await notificationApi.getAll();
      setNotifications(res.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      toast.error('Lỗi khi tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.title || !formData.body) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setIsSending(true);
      await notificationApi.create(formData);
      toast.success('Đã gửi thông báo thành công');
      setFormData({
        userId: '',
        title: '',
        body: '',
        type: 'system',
      });
      // Refresh list if admin sent to themselves
      fetchMyNotifications();
    } catch (error) {
      console.error('Failed to send notification', error);
      toast.error('Lỗi khi gửi thông báo');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      await notificationApi.delete(id);
      toast.success('Đã xóa thông báo');
      fetchMyNotifications();
    } catch (error) {
      console.error('Failed to delete notification', error);
      toast.error('Lỗi khi xóa thông báo');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.update(id, { isRead: true });
      fetchMyNotifications();
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-[#2d6a4f]" />
          Thông báo hệ thống
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gửi thông báo cho người dùng và xem danh sách thông báo của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Form gửi thông báo */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <Send className="w-5 h-5 text-[#2d6a4f]" />
              <h2 className="text-lg font-semibold text-gray-900">Gửi thông báo mới</h2>
            </div>

            <form onSubmit={handleSend} noValidate className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 text-gray-400" />
                  User ID (Người nhận)
                </label>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  placeholder="Nhập User ID..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                  <Type className="w-4 h-4 text-gray-400" />
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Tiêu đề thông báo..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                  <List className="w-4 h-4 text-gray-400" />
                  Loại thông báo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as NotificationType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] bg-white"
                >
                  <option value="system">Hệ thống (System)</option>
                  <option value="moderation">Kiểm duyệt (Moderation)</option>
                  <option value="badge">Huy hiệu (Badge)</option>
                  <option value="lesson">Bài học (Lesson)</option>
                  <option value="streak">Chuỗi ngày (Streak)</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  Nội dung
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Nội dung chi tiết..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-[#2d6a4f] hover:bg-[#1a3a2a] text-white py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Gửi ngay
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Cột phải: Danh sách thông báo */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-140px)] flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Thông báo của bạn (Admin)</h2>
              <span className="bg-[#2d6a4f]/10 text-[#2d6a4f] px-2.5 py-1 rounded-full text-xs font-bold">
                {notifications.length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                  <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm">Đang tải...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <Bell className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="text-sm">Bạn không có thông báo nào</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`p-4 rounded-xl border transition-all ${
                      notif.isRead 
                        ? 'bg-white border-gray-100 opacity-70' 
                        : 'bg-emerald-50/50 border-emerald-100 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`mt-1 p-2 rounded-full ${notif.isRead ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-600'}`}>
                          {notif.type === 'system' ? <AlertCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm truncate ${notif.isRead ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                            {notif.title}
                          </h3>
                          <p className={`text-sm mt-1 break-all ${notif.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                            {notif.body}
                          </p>
                          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                            <span className="uppercase tracking-wider font-medium">{notif.type}</span>
                            <span>•</span>
                            <span>{notif.createdAt ? new Date(notif.createdAt).toLocaleString('vi-VN') : ''}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 shrink-0">
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                            title="Đánh dấu đã đọc"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif._id)}
                          disabled={isDeleting === notif._id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Xóa thông báo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

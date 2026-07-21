'use client';

import { useState, useEffect, useRef } from 'react';
import { SupportSidebar } from '@/components/admin/support/SupportSidebar';
import { SupportChat } from '@/components/admin/support/SupportChat';

const MOCK_TICKETS = [
  {
    id: 1,
    name: 'Vũ Thị Lan',
    initials: 'VL',
    avatarBg: 'bg-blue-600',
    snippet: '"Bài học không có âm thanh..."',
    time: '10 min ago',
    unread: true,
    plan: 'Technique',
  },
  {
    id: 2,
    name: 'Minh Tuấn',
    initials: 'MT',
    avatarBg: 'bg-green-500',
    snippet: '"Cách nâng cấp lên gói Technique?"',
    time: '25 min ago',
    unread: false,
    plan: 'Foundation',
  },
  {
    id: 3,
    name: 'Thu Hương',
    initials: 'TH',
    avatarBg: 'bg-blue-600',
    snippet: '"Lỗi hiển thị bản nhạc"',
    time: '1 hour ago',
    unread: false,
    plan: 'Repertoire',
  },
  {
    id: 4,
    name: 'Hồng Nhung',
    initials: 'HN',
    avatarBg: 'bg-green-500',
    snippet: '"Tài khoản bị khoá không rõ lý do"',
    time: '2 hours ago',
    unread: true,
    plan: 'Foundation',
  },
];

const MOCK_MESSAGES = [
  {
    id: 1,
    sender: 'user' as const,
    text: 'Xin chào admin, em đang học bài Lý Con Sáo nhưng không nghe được âm thanh mẫu. Khi em nhấn nút phát, không có gì xảy ra.',
    time: '10:30',
  },
  {
    id: 2,
    sender: 'admin' as const,
    text: 'Xin chào Lan! Rất tiếc về sự cố này. Để mình kiểm tra tài khoản nhé.',
    time: '10:32',
  },
  {
    id: 3,
    sender: 'admin' as const,
    text: 'Mình vừa kiểm tra và thấy file âm thanh đã được tải lên đúng. Bạn có thể thử tải lại trang và kiểm tra âm lượng trình duyệt không?',
    time: '10:35',
  },
  {
    id: 4,
    sender: 'user' as const,
    text: 'Ok, để mình thử lại!',
    time: '10:36',
  },
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [activeTicketId, setActiveTicketId] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<number | null>(null);

  // Initial load simulation
  useEffect(() => {
    timerRef.current = window.setTimeout(() => setIsLoading(false), 1200);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleTabChange = (tab: 'all' | 'unread') => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setIsLoading(true);

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };

  const handleSelectTicket = (id: number) => {
    if (id === activeTicketId) return;
    setActiveTicketId(id);
    setIsLoading(true);

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIsLoading(false);
    }, 600); // Shorter loading time when switching chat
  };

  const activeTicket = MOCK_TICKETS.find((t) => t.id === activeTicketId);

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-2">
          Hỗ Trợ Khách Hàng
        </h1>
        <p className="text-gray-500 text-sm">
          Phản hồi yêu cầu và hỗ trợ kỹ thuật
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-175">
        {/* Left Column - List */}
        <div className="h-[50vh] lg:h-full lg:col-span-4 xl:col-span-3">
          <SupportSidebar
            tickets={MOCK_TICKETS}
            activeTicketId={activeTicketId}
            onSelectTicket={handleSelectTicket}
            activeTab={activeTab}
            onChangeTab={handleTabChange}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column - Chat */}
        <div className="min-h-[60vh] lg:h-full lg:col-span-8 xl:col-span-9">
          <SupportChat
            ticket={activeTicket}
            messages={MOCK_MESSAGES}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from '@/components/ui/skeleton';
import { Star, RefreshCw, Check, Paperclip, Send } from 'lucide-react';
import type { Ticket } from './SupportSidebar';

export interface Message {
  id: number;
  sender: 'user' | 'admin';
  text: string;
  time: string;
}

interface SupportChatProps {
  ticket: Ticket | undefined;
  messages: Message[];
  isLoading: boolean;
}

export function SupportChat({ ticket, messages, isLoading }: SupportChatProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3 bg-white">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 bg-gray-200" />
              <Skeleton className="h-4 w-48 bg-gray-200" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="w-28 h-9 rounded-md bg-gray-200" />
            <Skeleton className="w-36 h-9 rounded-md bg-gray-200" />
            <Skeleton className="w-28 h-9 rounded-md bg-gray-200" />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          <div className="max-w-[70%]">
            <Skeleton className="h-16 w-full rounded-2xl bg-gray-200" />
          </div>
          <div className="max-w-[70%] ml-auto">
            <Skeleton className="h-12 w-full rounded-2xl bg-green-100" />
          </div>
          <div className="max-w-[70%] ml-auto">
            <Skeleton className="h-20 w-full rounded-2xl bg-green-100" />
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 bg-white">
          <Skeleton className="h-28 w-full rounded-xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="flex flex-col h-full bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3 bg-white">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm shrink-0 ${ticket.avatarBg}`}
          >
            {ticket.initials}
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-none">
              {ticket.name}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-700">
                {ticket.plan}
              </span>
              <span className="text-xs text-gray-500">
                Đã tạo: {ticket.time}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Quan trọng</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Chuyển kỹ thuật</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15803d] hover:bg-[#166534] border border-transparent rounded-md text-sm font-medium text-white transition-colors">
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Đóng Phiếu</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 bg-white">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 text-[14px] leading-relaxed break-words ${
                  isUser
                    ? 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm'
                    : 'bg-[#15803d] text-white rounded-2xl rounded-tr-sm'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[11px] text-gray-400 mt-1.5 px-1">
                {msg.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Reply Composer */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
          <textarea
            placeholder="Nhập nội dung trả lời..."
            className="w-full min-w-0 h-24 p-4 text-sm resize-none focus:outline-none bg-gray-50/50"
          />
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors shrink-0">
              <Paperclip className="w-4 h-4" />
              <span className="hidden sm:inline">Đính kèm</span>
            </button>
            <button className="flex items-center gap-1.5 px-4 py-1.5 bg-[#15803d] hover:bg-[#166534] rounded-md text-sm font-medium text-white transition-colors shrink-0">
              Gửi
              <Send className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

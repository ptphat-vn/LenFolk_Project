import { Skeleton } from '@/components/ui/skeleton';

export interface Ticket {
  id: number;
  name: string;
  initials: string;
  avatarBg: string;
  snippet: string;
  time: string;
  unread: boolean;
  plan: string;
}

interface SupportSidebarProps {
  tickets: Ticket[];
  activeTicketId: number;
  onSelectTicket: (id: number) => void;
  activeTab: 'all' | 'unread';
  onChangeTab: (tab: 'all' | 'unread') => void;
  isLoading: boolean;
}

export function SupportSidebar({ tickets, activeTicketId, onSelectTicket, activeTab, onChangeTab, isLoading }: SupportSidebarProps) {
  const unreadCount = tickets.filter(t => t.unread).length;

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex bg-gray-100/80 p-1 rounded-lg mb-4">
        <button
          onClick={() => onChangeTab('all')}
          className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Tất cả ({tickets.length})
        </button>
        <button
          onClick={() => onChangeTab('unread')}
          className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all gap-1.5 ${
            activeTab === 'unread' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Chưa đọc
          {unreadCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {isLoading ? (
          // SKELETON
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-4 border border-gray-100 rounded-xl bg-white">
              <Skeleton className="w-10 h-10 rounded-full shrink-0 bg-gray-200" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-200" />
                <Skeleton className="h-3 w-full bg-gray-200" />
                <Skeleton className="h-3 w-16 bg-gray-200" />
              </div>
            </div>
          ))
        ) : (
          tickets.filter(t => activeTab === 'all' || t.unread).map((ticket) => {
            const isActive = ticket.id === activeTicketId;
            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className={`flex gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                  isActive 
                    ? 'border-green-600 bg-green-50 shadow-sm' 
                    : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm shrink-0 ${ticket.avatarBg}`}>
                  {ticket.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold truncate ${isActive ? 'text-green-900' : 'text-gray-900'}`}>
                      {ticket.name}
                    </h4>
                    {ticket.unread && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    )}
                  </div>
                  <p className={`text-xs mt-1 truncate ${isActive ? 'text-green-800' : 'text-gray-600'}`}>
                    {ticket.snippet}
                  </p>
                  <p className={`text-[11px] mt-1.5 ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {ticket.time}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

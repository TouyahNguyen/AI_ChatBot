import React, { useState } from 'react';
import {
  MessageSquarePlus,
  Search,
  FolderOpen,
  MoreHorizontal,
  Trash2,
  MessageSquare,
  Ellipsis,
  X,
} from 'lucide-react';

const Sidebar = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}) => {
  const [hoveredSession, setHoveredSession] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = searchQuery
    ? sessions.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sessions;

  const handleDeleteClick = (e, sessionId) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
    setMenuOpenId(null);
  };

  return (
    <aside className="w-[280px] h-screen bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-gray-800 tracking-tight">Chatbot</span>
      </div>

      {/* Menu items */}
      <nav className="px-3 space-y-0.5">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
        >
          <MessageSquarePlus className="w-[18px] h-[18px] text-gray-400 group-hover:text-indigo-500 transition-colors" />
          <span className="group-hover:text-gray-900 transition-colors">New chat</span>
        </button>

        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
        >
          <Search className="w-[18px] h-[18px] text-gray-400 group-hover:text-indigo-500 transition-colors" />
          <span className="group-hover:text-gray-900 transition-colors">Search chat</span>
        </button>

        {/* Search input (toggle) */}
        {searchOpen && (
          <div className="px-2 pb-1 animate-fade-in-up">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                autoFocus
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded-full"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        )}

        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
          <FolderOpen className="w-[18px] h-[18px] text-gray-400 group-hover:text-indigo-500 transition-colors" />
          <span className="group-hover:text-gray-900 transition-colors">Project</span>
        </button>

        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
          <MoreHorizontal className="w-[18px] h-[18px] text-gray-400 group-hover:text-indigo-500 transition-colors" />
          <span className="group-hover:text-gray-900 transition-colors">More</span>
        </button>
      </nav>

      {/* Divider + Recents label */}
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recents</span>
        <button className="p-1 text-gray-300 hover:text-gray-500 rounded transition-colors">
          <Ellipsis className="w-4 h-4" />
        </button>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {filteredSessions.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-gray-400">
              {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có cuộc trò chuyện nào'}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === currentSessionId;
            const isHovered = session.id === hoveredSession;

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                onMouseEnter={() => setHoveredSession(session.id)}
                onMouseLeave={() => {
                  setHoveredSession(null);
                  if (menuOpenId === session.id) setMenuOpenId(null);
                }}
                className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MessageSquare
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-indigo-500' : 'text-gray-300'
                  }`}
                />
                <span className="flex-1 text-sm truncate">{session.title}</span>

                {/* Context menu button */}
                {(isHovered || menuOpenId === session.id) && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === session.id ? null : session.id);
                      }}
                      className={`p-1 rounded-md transition-colors ${
                        isActive
                          ? 'hover:bg-indigo-100 text-indigo-400'
                          : 'hover:bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Ellipsis className="w-4 h-4" />
                    </button>

                    {/* Dropdown menu */}
                    {menuOpenId === session.id && (
                      <div className="absolute right-0 top-8 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50 animate-fade-in-up">
                        <button
                          onClick={(e) => handleDeleteClick(e, session.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* User avatar ở dưới cùng */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">U</span>
          </div>
          <span className="text-sm font-medium text-gray-700">User</span>
          <MoreHorizontal className="w-4 h-4 text-gray-400 ml-auto" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

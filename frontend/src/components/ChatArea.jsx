import React, { useRef, useEffect } from 'react';
import { ChevronDown, MoreVertical } from 'lucide-react';
import MessageBubble, { TypingIndicator } from './MessageBubble';
import ChatInput from './ChatInput';

const ChatArea = ({ messages, onSend, isLoading, currentSession }) => {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll xuống khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="w-8" /> {/* Spacer */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <h1 className="text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
            Chat Mèo 4.0
          </h1>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Messages area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Xin chào! 👋
            </h2>
            <p className="text-sm text-gray-400 max-w-md">
              Tôi là Chat Mèo 4.0, trợ lý AI thông minh. Hãy hỏi tôi bất cứ điều gì hoặc gửi file để phân tích nhé!
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
              />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="max-w-3xl mx-auto w-full">
        <ChatInput onSend={onSend} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatArea;

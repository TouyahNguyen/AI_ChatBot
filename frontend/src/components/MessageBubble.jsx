import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

const MessageBubble = ({ role, content }) => {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-fade-in-up">
        <div className="max-w-[70%] bg-blue-100 text-gray-800 px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4 animate-fade-in-up">
      <div className="flex items-start gap-3 max-w-[85%]">
        {/* Bot Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        {/* Bot Message Content */}
        <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  );
};

// Typing indicator
export const TypingIndicator = () => (
  <div className="flex justify-start mb-4 animate-fade-in-up">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
        </div>
      </div>
    </div>
  </div>
);

export default MessageBubble;

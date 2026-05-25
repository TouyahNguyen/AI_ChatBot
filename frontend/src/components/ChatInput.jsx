import React, { useState, useRef } from 'react';
import { Plus, Send, Mic, Paperclip, X } from 'lucide-react';

const ChatInput = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!message.trim() && !file) || isLoading) return;
    onSend(message.trim(), file);
    setMessage('');
    setFile(null);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-4 pb-4 px-4">
      {/* File preview */}
      {file && (
        <div className="mb-2 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-xs shadow-sm animate-fade-in-up">
          <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-600 truncate">{file.name}</span>
          <button
            onClick={removeFile}
            className="ml-auto p-0.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 px-2">
          {/* Nút + đính kèm file */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            title="Đính kèm file"
          >
            <Plus className="w-5 h-5" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,audio/*,video/*,.pdf,.txt,.csv,.doc,.docx"
          />

          {/* Text input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            disabled={isLoading}
            className="flex-1 px-2 py-3 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none disabled:opacity-50"
          />

          {/* Nút micro */}
          <button
            type="button"
            className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            title="Voice input"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Nút gửi */}
          <button
            type="submit"
            disabled={(!message.trim() && !file) || isLoading}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              message.trim() || file
                ? 'text-white bg-indigo-500 hover:bg-indigo-600 shadow-md hover:shadow-lg'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Gửi tin nhắn"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

const API_BASE = 'http://localhost:8000';

function App() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ========== Fetch Sessions ==========
  const fetchSessions = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/sessions/`);
      setSessions(res.data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  }, []);

  // ========== Fetch Messages ==========
  const fetchMessages = useCallback(async (sessionId) => {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/sessions/${sessionId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, []);

  // ========== Init: Load sessions ==========
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // ========== Load messages khi chọn session ==========
  useEffect(() => {
    fetchMessages(currentSessionId);
  }, [currentSessionId, fetchMessages]);

  // ========== New Chat ==========
  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  // ========== Select Session ==========
  const handleSelectSession = (sessionId) => {
    setCurrentSessionId(sessionId);
  };

  // ========== Delete Session ==========
  const handleDeleteSession = async (sessionId) => {
    try {
      await axios.delete(`${API_BASE}/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  // ========== Send Message ==========
  const handleSend = async (message, file) => {
    if (!message && !file) return;

    setIsLoading(true);

    // Optimistic UI: thêm user message trước
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message || `[Đã gửi file: ${file?.name}]`,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      // Build FormData
      const formData = new FormData();
      formData.append('message', message || `Phân tích file này: ${file?.name}`);
      formData.append('session_id', currentSessionId || 'null');
      if (file) {
        formData.append('file', file);
      }

      const res = await axios.post(`${API_BASE}/chat/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { user_message, bot_message, session_id } = res.data;

      // Cập nhật session nếu mới tạo
      if (!currentSessionId) {
        setCurrentSessionId(session_id);
        fetchSessions(); // Refresh danh sách sidebar
      }

      // Replace temp message + thêm bot response
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, user_message, bot_message];
      });
    } catch (err) {
      console.error('Error sending message:', err);
      // Thêm error message
      const errorMsg = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />
      <ChatArea
        messages={messages}
        onSend={handleSend}
        isLoading={isLoading}
        currentSession={sessions.find((s) => s.id === currentSessionId)}
      />
    </div>
  );
}

export default App;

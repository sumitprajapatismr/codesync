import React, { useEffect, useRef, useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const ChatPanel = ({ roomId }) => {
  const { socket, emitChatMessage, emitTyping } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Map()); // userId -> name
  
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch chat history from database on load
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await API.get(`/rooms/${roomId}/messages`);
        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };
    fetchChatHistory();
  }, [roomId]);

  // Listen to live socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleUserTyping = ({ userId, name, isTyping }) => {
      if (userId === user._id) return;
      setTypingUsers((prev) => {
        const next = new Map(prev);
        if (isTyping) {
          next.set(userId, name);
        } else {
          next.delete(userId);
        }
        return next;
      });
    };

    socket.on('new-chat-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);

    return () => {
      socket.off('new-chat-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
    };
  }, [socket, user]);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    emitChatMessage(roomId, text.trim(), user);
    setText('');
    
    // Explicitly stop typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTyping(roomId, false, user);
  };

  const handleInputChange = (e) => {
    setText(e.target.value);

    // Emit typing indicator
    emitTyping(roomId, true, user);

    // Debounce typing status to false after 1.5 seconds of no keys pressed
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(roomId, false, user);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg/25 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-brand-500" />
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-dark-muted">
          Group Chat
        </span>
      </div>

      {/* Messages Sandbox */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg) => {
          const isSelf = msg.sender?._id === user._id;
          return (
            <div key={msg._id} className={`flex gap-2.5 max-w-[85%] ${isSelf ? 'ml-auto flex-row-reverse' : ''}`}>
              <img
                src={msg.sender?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender?.name}`}
                alt="avatar"
                className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 dark:border-dark-border shrink-0"
              />
              <div>
                <div className={`flex items-baseline gap-1.5 mb-1 ${isSelf ? 'justify-end' : ''}`}>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                    {msg.sender?.name}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`text-xs p-3 rounded-2xl ${
                  isSelf
                    ? 'bg-brand-500 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-dark-bg text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-dark-border/40'
                }`}>
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 italic pl-1 animate-pulse">
            <span>{Array.from(typingUsers.values()).join(', ')} is typing...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg/25 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          placeholder="Send a message..."
          className="flex-1 bg-white dark:bg-dark-bg text-xs border border-slate-300 dark:border-dark-border rounded-xl px-3 py-2 text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
        />
        <button
          type="submit"
          className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow transition-transform active:scale-95 shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;

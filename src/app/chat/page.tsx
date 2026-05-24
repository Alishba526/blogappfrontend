'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { socket } from '@/lib/socket';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Loader2, Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialChatId = searchParams.get('chatId');

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit('setup', user);
      socket.on('connected', () => console.log('Socket connected'));
      socket.on('userStatus', (users) => setOnlineUsers(users));
      socket.on('typing', () => setIsTyping(true));
      socket.on('stop typing', () => setIsTyping(false));
      socket.on('message received', (msg) => {
        if (selectedChat && selectedChat._id === msg.chat._id) {
          setMessages((prev) => [...prev, msg]);
        } else {
          // Update last message in chat list
          setChats((prev) => prev.map(c => c._id === msg.chat._id ? { ...c, lastMessage: msg } : c));
        }
      });

      fetchChats();

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (initialChatId && chats.length > 0) {
      const chat = chats.find(c => c._id === initialChatId);
      if (chat) setSelectedChat(chat);
    }
  }, [initialChatId, chats]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      socket.emit('join chat', selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      setLoadingChats(true);
      const { data } = await api.get('/chat');
      setChats(data);
    } catch (error) {
      toast.error('Failed to load chats');
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const { data } = await api.get(`/chat/${selectedChat._id}`);
      setMessages(data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    socket.emit('stop typing', selectedChat._id);
    try {
      const { data } = await api.post('/chat/message', {
        content: newMessage,
        chatId: selectedChat._id,
      });
      setNewMessage('');
      setMessages((prev) => [...prev, data]);
      socket.emit('new message', data);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const typingHandler = (e: any) => {
    setNewMessage(e.target.value);

    if (!socket.connected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    let timerLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const getOtherParticipant = (chat: any) => {
    return chat.participants.find((p: any) => p._id !== user?._id);
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 bg-white border-r flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-purple-600" />
            </div>
          ) : chats.length > 0 ? (
            chats.map((chat) => {
              const otherUser = getOtherParticipant(chat);
              const isOnline = onlineUsers.includes(otherUser?._id);
              return (
                <div
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition ${selectedChat?._id === chat._id ? 'bg-purple-50 border-r-4 border-purple-600' : ''}`}
                >
                  <div className="relative">
                    <Image
                      src={otherUser?.avatar || '/placeholder.png'}
                      alt={otherUser?.name}
                      width={48}
                      height={48}
                      className="rounded-full w-12 h-12 object-cover"
                    />
                    {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold truncate">{otherUser?.name}</h3>
                      <span className="text-xs text-gray-500">
                        {chat.lastMessage ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-gray-500">No chats yet</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedChat(null)} className="md:hidden text-gray-600">
                  <ArrowLeft size={24} />
                </button>
                <div className="relative">
                  <Image
                    src={getOtherParticipant(selectedChat)?.avatar || '/placeholder.png'}
                    alt={getOtherParticipant(selectedChat)?.name}
                    width={40}
                    height={40}
                    className="rounded-full w-10 h-10 object-cover"
                  />
                  {onlineUsers.includes(getOtherParticipant(selectedChat)?._id) && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold">{getOtherParticipant(selectedChat)?.name}</h3>
                  <p className="text-xs text-green-500">
                    {onlineUsers.includes(getOtherParticipant(selectedChat)?._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <button className="hover:text-purple-600 transition"><Phone size={20} /></button>
                <button className="hover:text-purple-600 transition"><Video size={20} /></button>
                <button className="hover:text-purple-600 transition"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {loadingMessages ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-purple-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const isOwnMessage = msg.sender._id === user?._id;
                    return (
                      <div key={msg._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${isOwnMessage ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                          <p>{msg.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isOwnMessage ? 'text-purple-100' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isOwnMessage && <CheckCheck size={12} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white p-3 rounded-2xl shadow-sm rounded-tl-none">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t">
              <form onSubmit={sendMessage} className="flex items-center gap-3">
                <button type="button" className="text-gray-400 hover:text-purple-600 transition"><Smile size={24} /></button>
                <button type="button" className="text-gray-400 hover:text-purple-600 transition"><Paperclip size={24} /></button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={typingHandler}
                  className="flex-1 py-2 px-4 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-600 mb-2">Your Messages</h2>
            <p className="max-w-xs">Select a chat from the sidebar or start a new connection to begin messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageSquare(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  }

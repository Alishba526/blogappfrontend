'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, UserPlus, UserCheck, UserX, Users, Search, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ConnectionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my-connections' | 'requests' | 'suggestions'>('my-connections');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let res;
      if (activeTab === 'my-connections') {
        res = await api.get('/connections/list');
      } else if (activeTab === 'requests') {
        res = await api.get('/connections/pending');
      } else {
        res = await api.get('/connections/suggestions');
      }
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, id: string) => {
    try {
      if (action === 'send') {
        await api.post(`/connections/request/${id}`);
        toast.success('Request sent');
      } else if (action === 'accept') {
        await api.put(`/connections/accept/${id}`);
        toast.success('Request accepted');
      } else if (action === 'reject') {
        await api.put(`/connections/reject/${id}`);
        toast.success('Request rejected');
      } else if (action === 'remove') {
        // Need to find connection ID, for now using id as user ID
        // Simplified for this demo
        toast.error('Remove functionality coming soon');
      }
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const startChat = async (userId: string) => {
    try {
      const { data } = await api.post('/api/chat', { userId });
      router.push(`/chat?chatId=${data._id}`);
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="max-w-4xl mx-auto px-2 md:px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center md:text-left">Networking</h1>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm border mb-6 md:mb-8 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('my-connections')}
            className={`flex-1 py-3 px-4 text-sm md:text-base font-semibold flex items-center justify-center gap-2 transition ${activeTab === 'my-connections' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Users size={18} /> My Connections
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 px-4 text-sm md:text-base font-semibold flex items-center justify-center gap-2 transition ${activeTab === 'requests' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <UserPlus size={18} /> Requests
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 py-3 px-4 text-sm md:text-base font-semibold flex items-center justify-center gap-2 transition ${activeTab === 'suggestions' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Search size={18} /> Suggestions
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-10 md:py-20">
              <Loader2 className="animate-spin text-purple-600" size={30} />
            </div>
          ) : data.length > 0 ? (
            data.map((item) => (
              <div key={item._id} className="bg-white p-3 md:p-4 rounded-xl border shadow-sm flex items-center justify-between">
                <Link href={`/profile/${item._id || item.sender?._id}`} className="flex items-center gap-2 md:gap-3">
                  <Image
                    src={(item.sender?.avatar || item.avatar) || '/placeholder.png'}
                    alt={item.sender?.name || item.name}
                    width={40}
                    height={40}
                    className="rounded-full w-10 h-10 md:w-12 md:h-12 object-cover"
                  />
                  <div>
                    <p className="font-bold text-sm md:text-base text-gray-800">{item.sender?.name || item.name}</p>
                    <p className="text-[10px] md:text-xs text-gray-500">{activeTab === 'requests' ? 'Sent you a request' : 'Professional'}</p>
                  </div>
                </Link>

                <div className="flex gap-1 md:gap-2">
                  {activeTab === 'my-connections' && (
                    <button 
                        onClick={() => startChat(item._id)}
                        className="p-1.5 md:p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                    >
                      <MessageSquare size={18} />
                    </button>
                  )}
                  {activeTab === 'requests' && (
                    <>
                      <button 
                        onClick={() => handleAction('accept', item._id)}
                        className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Accept"
                      >
                        <UserCheck size={18} />
                      </button>
                      <button 
                        onClick={() => handleAction('reject', item._id)}
                        className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Reject"
                      >
                        <UserX size={18} />
                      </button>
                    </>
                  )}
                  {activeTab === 'suggestions' && (
                    <button 
                        onClick={() => handleAction('send', item._id)}
                        className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-semibold hover:bg-purple-700 transition"
                    >
                      <UserPlus size={14} /> Connect
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 md:py-20 bg-white rounded-xl border">
              <Users size={32} className="mx-auto mb-3 opacity-10" />
              <p className="text-sm md:text-base text-gray-500">No {activeTab.replace('-', ' ')} found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

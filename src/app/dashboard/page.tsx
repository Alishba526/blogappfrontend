'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api, aiAPI } from '@/lib/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Users, Eye, Heart, Share2, MessageSquare, TrendingUp, BarChart2, Bell, Bookmark, Plus, ArrowUpRight, ArrowDownRight, Loader2, Globe, Zap, Search, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'saved'>('analytics');
  const [savedBlogs, setSavedBlogs] = useState<any[]>([]);
  const [aiIdeas, setAiIdeas] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
        fetchDashboardData();
        fetchAIRecommendations();
    } else {
        setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchAIRecommendations = async () => {
    try {
        const { data } = await aiAPI.generate({ action: 'trending_topics', category: 'Technology' });
        setAiIdeas(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (e) {
        console.error('AI Recs failed');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/dashboard/stats');
      setStats(data);
      
      const savedRes = await api.get('/dashboard/saved');
      setSavedBlogs(savedRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <p className="text-gray-500">Failed to load dashboard statistics.</p>
        <button 
          onClick={fetchDashboardData}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const { analytics, performance, widgets } = stats;

  const statCards = [
    { title: 'Total Followers', value: analytics.totalFollowers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', growth: '+12%' },
    { title: 'Blog Views', value: analytics.totalBlogViews, icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50', growth: '+25%' },
    { title: 'Total Likes', value: analytics.totalLikes, icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50', growth: '+18%' },
    { title: 'Engagement', value: `${analytics.engagementRate}%`, icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', growth: '+5%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12 w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b px-4 py-8 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="text-sm md:text-base text-gray-500">Here's what's happening with your blogs today.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/create" className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg group">
              <Plus size={20} className="group-hover:rotate-90 transition duration-300" /> Start New Blog
            </Link>
            <Link href="/create?mode=ai" className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition shadow-lg group">
              <Sparkles size={20} className="animate-pulse" /> Generate with AI
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 md:px-4">
        {/* Tab Navigation */}
        <div className="flex gap-4 sm:gap-8 mb-8 border-b overflow-x-auto">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 font-bold transition whitespace-nowrap ${activeTab === 'analytics' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Dashboard Analytics
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`pb-4 font-bold transition whitespace-nowrap ${activeTab === 'saved' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Saved Blogs ({savedBlogs.length})
          </button>
        </div>

        {activeTab === 'analytics' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                      <stat.icon size={24} />
                    </div>
                    <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">
                      <ArrowUpRight size={14} /> {stat.growth}
                    </span>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Analytics Section */}
              <div className="lg:col-span-2 space-y-8">
                {/* View Graph */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <BarChart2 className="text-purple-600" /> Blog Performance
                    </h2>
                    <select className="bg-gray-50 border rounded-lg px-3 py-1.5 text-sm outline-none">
                      <option>Last 30 Days</option>
                      <option>Last 7 Days</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performance.viewData}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Area type="monotone" dataKey="views" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Blogs Table */}
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                  <div className="p-4 md:p-6 border-b">
                    <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                      <TrendingUp className="text-purple-600" /> Best Performing Content
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs md:text-sm">
                      <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-3 md:px-6 md:py-4">Title</th>
                          <th className="px-3 py-3 md:px-6 md:py-4">Views</th>
                          <th className="px-3 py-3 md:px-6 md:py-4">Likes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {performance.bestPerformingBlog ? (
                          <tr className="hover:bg-gray-50 transition">
                            <td className="px-3 py-3 md:px-6 md:py-4 font-medium text-gray-900 truncate max-w-[150px] md:max-w-none">{performance.bestPerformingBlog.title}</td>
                            <td className="px-3 py-3 md:px-6 md:py-4">{performance.bestPerformingBlog.views.length}</td>
                            <td className="px-3 py-3 md:px-6 md:py-4">{performance.bestPerformingBlog.likes.length}</td>
                          </tr>
                        ) : (
                          <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">No data</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Sidebar Widgets */}
              <div className="space-y-8">
                {/* Notifications / Pending Connections */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Bell className="text-purple-600" size={20} /> Networking
                    </h2>
                    <Link href="/connections" className="text-sm text-purple-600 hover:underline">View all</Link>
                  </div>
                  <div className="space-y-4">
                    {widgets.pendingConnections.length > 0 ? widgets.pendingConnections.map((conn: any) => (
                      <div key={conn._id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Image src={conn.sender.avatar || '/placeholder.png'} alt={conn.sender.name} width={40} height={40} style={{ width: '40px', height: '40px' }} className="rounded-full object-cover" />
                          <div>
                            <p className="text-sm font-bold">{conn.sender.name}</p>
                            <p className="text-xs text-gray-500">Connection request</p>
                          </div>
                        </div>
                        <Link href="/connections" className="bg-purple-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-purple-700 transition">View</Link>
                      </div>
                    )) : <p className="text-sm text-gray-500 text-center py-4">No pending requests</p>}
                  </div>
                </div>

                {/* AI Suggestions */}
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-2xl shadow-lg text-white">
                  <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Zap size={20} /> AI Topic Suggestions
                  </h2>
                  <div className="space-y-3">
                    {aiIdeas.length > 0 ? aiIdeas.map((topic: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
                        <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center font-bold">#{i+1}</div>
                        <p className="text-sm font-medium">{topic}</p>
                      </div>
                    )) : widgets.trendingTopics.map((topic: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
                          <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center font-bold">#{i+1}</div>
                          <p className="text-sm font-medium">{topic}</p>
                        </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 bg-white text-purple-600 py-2.5 rounded-xl font-bold hover:bg-purple-50 transition">
                    Generate Draft with AI
                  </button>
                </div>

                {/* Recent Comments */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                  <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                    <MessageSquare className="text-purple-600" size={20} /> Recent Comments
                  </h2>
                  <div className="space-y-6">
                    {widgets.recentComments.length > 0 ? widgets.recentComments.map((comment: any) => (
                      <div key={comment._id} className="flex gap-3">
                        <Image src={comment.user.avatar || '/placeholder.png'} alt={comment.user.name} width={32} height={32} className="rounded-full w-8 h-8 object-cover shrink-0" />
                        <div>
                          <p className="text-sm font-bold">{comment.user.name}</p>
                          <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{comment.content}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(comment.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )) : <p className="text-sm text-gray-500 text-center py-4">No recent comments</p>}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedBlogs.length > 0 ? savedBlogs.map((blog) => (
              <div key={blog._id} className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition group">
                {blog.images?.[0] && (
                  <div className="relative h-48">
                    <Image src={blog.images[0].url} alt={blog.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-purple-600 font-bold mb-2">
                    <span className="bg-purple-50 px-2 py-1 rounded-lg uppercase tracking-wider">{blog.category}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 font-normal">{blog.readingTime} read</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">{blog.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Image src={blog.author.avatar || '/placeholder.png'} alt={blog.author.name} width={32} height={32} style={{ width: 'auto', height: 'auto' }} className="rounded-full w-8 h-8 object-cover" />
                      <span className="text-sm font-bold">{blog.author.name}</span>
                    </div>
                    <Link href={`/blog/${blog._id}`} className="text-purple-600 font-bold text-sm hover:underline">Read More</Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border">
                <Bookmark size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-gray-500">You haven't saved any blogs yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

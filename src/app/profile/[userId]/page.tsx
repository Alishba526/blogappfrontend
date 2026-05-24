'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import BlogCard from '@/components/BlogCard';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Loader2, Mail, Globe, Linkedin, Github, Instagram, Edit, Settings, LogOut, Facebook, Twitter, Calendar, Eye, PenTool } from 'lucide-react';
import FollowButton from '@/components/FollowButton';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, logout } = useAuth();
  const userId = params.userId as string;

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'blogs' | 'followers' | 'following'>('blogs');

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/profile/${userId}`);
      setProfileData(data);
    } catch (error: any) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 size={40} className="animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profileData) {
    return <div className="text-center mt-10">Profile not found.</div>;
  }

  const { user, stats, blogs } = profileData;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group">
              <Image
                src={user.avatar || '/placeholder.png'}
                alt={user.name || 'User'}
                width={150}
                height={150}
                className="rounded-full border-4 border-white shadow-lg object-cover w-[150px] h-[150px]"
              />
              {currentUser?._id === userId && (
                <button 
                  onClick={() => router.push('/edit-profile')}
                  className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full shadow-md hover:bg-purple-700 transition"
                >
                  <Edit size={16}/>
                </button>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{user.name || 'Anonymous User'}</h1>
                  <p className="text-gray-500 mb-2">@{user.name?.toLowerCase().replace(/\s+/g, '_') || 'user'}</p>
                  <p className="flex items-center gap-2 text-gray-600"><Mail size={16}/> {user.email || 'N/A'}</p>
                </div>
                {currentUser?._id === userId ? (
                  <div className="flex gap-2">
                    <button onClick={() => router.push('/edit-profile')} className="flex items-center gap-1 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-100 transition"><Settings size={16}/> Settings</button>
                    <button onClick={handleLogout} className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition"><LogOut size={16}/> Logout</button>
                  </div>
                ) : (
                  <FollowButton targetUserId={userId} />
                )}
              </div>
              
              <p className="text-gray-700 mt-4 max-w-2xl text-lg leading-relaxed">{user.bio || 'No bio yet.'}</p>
              
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                {user.dob && <p className="flex items-center gap-2"><Calendar size={16}/> Born: {new Date(user.dob).toLocaleDateString()}</p>}
                <p className="flex items-center gap-2"><Eye size={16}/> {stats.profileViews || 0} views</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                {user.website && <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><Globe size={16}/> Website</a>}
                {user.socialLinks?.linkedin && <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-700 hover:underline"><Linkedin size={16}/> LinkedIn</a>}
                {user.socialLinks?.github && <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-800 hover:underline"><Github size={16}/> GitHub</a>}
                {user.socialLinks?.instagram && <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-pink-600 hover:underline"><Instagram size={16}/> Instagram</a>}
                {user.socialLinks?.facebook && <a href={user.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-800 hover:underline"><Facebook size={16}/> Facebook</a>}
                {user.socialLinks?.x && <a href={user.socialLinks.x} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-900 hover:underline"><Twitter size={16}/> X</a>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('blogs')}
              className={`flex-1 py-4 font-semibold text-center transition ${activeTab === 'blogs' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Blogs ({stats.totalBlogs || 0})
            </button>
            <button 
              onClick={() => setActiveTab('followers')}
              className={`flex-1 py-4 font-semibold text-center transition ${activeTab === 'followers' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Followers ({stats.followersCount || 0})
            </button>
            <button 
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-4 font-semibold text-center transition ${activeTab === 'following' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Following ({stats.followingCount || 0})
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'blogs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogs.length > 0 ? (
                  blogs.map((blog: any) => (
                    <BlogCard key={blog._id} {...blog} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10 text-gray-500">
                    <PenTool size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No blogs published yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'followers' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {user.followers?.length > 0 ? (
                  user.followers.map((follower: any) => (
                    <div 
                      key={follower._id} 
                      className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => router.push(`/profile/${follower._id}`)}
                    >
                      <Image src={follower.avatar || '/placeholder.png'} alt={follower.name} width={40} height={40} className="rounded-full w-10 h-10 object-cover" />
                      <span className="font-medium">{follower.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center py-10 text-gray-500">No followers yet.</p>
                )}
              </div>
            )}

            {activeTab === 'following' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {user.following?.length > 0 ? (
                  user.following.map((followed: any) => (
                    <div 
                      key={followed._id} 
                      className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => router.push(`/profile/${followed._id}`)}
                    >
                      <Image src={followed.avatar || '/placeholder.png'} alt={followed.name} width={40} height={40} className="rounded-full w-10 h-10 object-cover" />
                      <span className="font-medium">{followed.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center py-10 text-gray-500">Not following anyone yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

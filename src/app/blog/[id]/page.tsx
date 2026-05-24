'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { blogAPI, api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowLeft, Share2, Edit2, Trash2, Eye, Calendar, MessageSquare, Repeat, Bookmark, MoreVertical, PlayCircle, UserPlus, UserCheck, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { socket } from '@/lib/socket';

interface Blog {
  _id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  images: Array<{ url: string, publicId: string }>;
  videos: string[];
  author: any;
  likes: string[];
  views: any[];
  reposts: any[];
  links: string[];
  readingTime: string;
  createdAt: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  const blogId = params.id as string;

  useEffect(() => {
    fetchBlog();
    fetchComments();
    
    // Listen for real-time comments
    socket.connect();
    socket.on('new comment', (data: any) => {
        if (data.blogId === blogId) {
            setComments(prev => [data.comment, ...prev]);
        }
    });

    return () => {
        socket.off('new comment');
    };
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getBlogById(blogId);
      const b = response.data;
      setBlog(b);
      setIsLiked(b.likes.includes(user?._id));
      setIsSaved((user as any)?.savedBlogs?.includes(blogId));
    } catch (error: any) {
      toast.error('Failed to fetch blog');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/blogs/${blogId}/comments`);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments');
    }
  };

  const handleLike = async () => {
    if (!user) return toast.error('Please login to like');
    try {
      if (isLiked) {
        await blogAPI.unlikeBlog(blogId);
      } else {
        await blogAPI.likeBlog(blogId);
      }
      setIsLiked(!isLiked);
      setBlog(prev => prev ? { 
        ...prev, 
        likes: isLiked ? prev.likes.filter(id => id !== user._id) : [...prev.likes, user._id] 
      } : null);
    } catch (error: any) {
      toast.error('Error updating like');
    }
  };

  const handleSave = async () => {
    if (!user) return toast.error('Please login to save');
    try {
      const { data } = await api.post(`/dashboard/save/${blogId}`);
      setIsSaved(data.saved);
      if (setUser) {
        const updatedSaved = data.saved 
            ? [...((user as any).savedBlogs || []), blogId]
            : ((user as any).savedBlogs || []).filter((id: string) => id !== blogId);
        const updatedUser = { ...user, savedBlogs: updatedSaved };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser as any);
      }
      toast.success(data.saved ? 'Saved to dashboard' : 'Removed from saved');
    } catch (error) {
      toast.error('Failed to save blog');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
        const { data } = await api.post(`/blogs/${blogId}/comments`, { content: newComment });
        // We don't manually add here because socket will handle it for everyone
        setNewComment('');
        toast.success('Comment added!');
    } catch (error) {
        toast.error('Failed to add comment');
    }
  };

  const handleFollow = async () => {
    if (!user) return toast.error('Please login to follow');
    try {
        await api.post(`/users/follow/${blog?.author._id}`);
        toast.success(`Following ${blog?.author.name}`);
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to follow');
    }
  };

  const handleConnect = async () => {
    if (!user) return toast.error('Please login to connect');
    try {
        await api.post(`/connections/request/${blog?.author._id}`);
        toast.success('Connection request sent');
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleMessage = async () => {
    if (!user) return toast.error('Please login to message');
    try {
        const { data } = await api.post('/chat', { userId: blog?.author._id });
        router.push(`/chat?chatId=${data._id}`);
    } catch (error) {
        toast.error('Failed to start chat');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogAPI.deleteBlog(blogId);
        toast.success('Blog deleted successfully');
        router.push('/');
      } catch (error: any) {
        toast.error('Error deleting blog');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!blog) return <div className="text-center mt-20 text-gray-500 font-bold">Blog not found</div>;

  const isOwnBlog = user?._id === blog.author?._id;

  return (
    <div className="min-h-screen bg-white">
      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 pt-12">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition mb-8 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" /> Back to feed
        </button>

        <div className="flex items-center gap-3 mb-6">
            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                {blog.category}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500 text-sm font-medium">{blog.readingTime}</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-8">
          {blog.title}
        </h1>

        <div className="flex items-center justify-between py-8 border-y border-gray-100 mb-12">
            <div className="flex items-center gap-4">
                <Image 
                    src={blog.author?.avatar || '/placeholder.png'} 
                    alt={blog.author?.name} 
                    width={56} 
                    height={56} 
                    className="rounded-full w-14 h-14 object-cover border-2 border-purple-500" 
                />
                <div>
                    <Link href={`/profile/${blog.author?._id}`} className="font-bold text-lg hover:text-purple-600 transition">{blog.author?.name}</Link>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                        <Calendar size={14} /> {format(new Date(blog.createdAt), 'MMMM dd, yyyy')}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {isOwnBlog ? (
                    <div className="flex gap-2">
                        <Link href={`/edit/${blog._id}`} className="p-2 bg-gray-50 rounded-full hover:bg-purple-50 hover:text-purple-600 transition"><Edit2 size={20}/></Link>
                        <button onClick={handleDelete} className="p-2 bg-gray-50 rounded-full hover:bg-red-50 hover:text-red-600 transition"><Trash2 size={20}/></button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleFollow} className="bg-purple-50 text-purple-600 px-4 py-2 rounded-full font-bold hover:bg-purple-100 transition flex items-center gap-2">
                            <UserPlus size={18}/> Follow
                        </button>
                        <button onClick={handleConnect} className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold hover:bg-purple-700 transition shadow-lg flex items-center gap-2">
                            <UserCheck size={18}/> Connect
                        </button>
                        <button onClick={handleMessage} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-600">
                            <Send size={20}/>
                        </button>
                    </div>
                )}
                <button className="p-2 text-gray-400 hover:text-gray-900 transition"><MoreVertical size={24}/></button>
            </div>
        </div>

        {/* Content */}
        <div className="prose prose-indigo prose-xl max-w-none mb-16">
            <p className="text-xl text-gray-600 leading-relaxed italic mb-8 border-l-4 border-purple-500 pl-6 bg-gray-50 py-4 rounded-r-xl">
                {blog.description}
            </p>
            
            {/* Featured Media */}
            {blog.images.length > 0 && (
                <div className="my-12 rounded-3xl overflow-hidden shadow-2xl">
                    <Image src={blog.images[0].url} alt={blog.title} width={1000} height={600} className="w-full object-cover" />
                </div>
            )}

            <div className="text-gray-800 leading-loose text-lg whitespace-pre-wrap font-serif">
                {blog.content}
            </div>

            {/* Video Support */}
            {blog.videos && blog.videos.length > 0 && (
                <div className="my-12 space-y-8">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-900"><PlayCircle className="text-red-500" /> Watch Videos</h3>
                    {blog.videos.map((vid, i) => (
                        <div key={i} className="aspect-video rounded-3xl overflow-hidden shadow-xl border bg-black">
                            <video src={vid} controls className="w-full h-full" />
                        </div>
                    ))}
                </div>
            )}

            {/* Image Gallery (Pinterest Style) */}
            {blog.images.length > 1 && (
                <div className="my-12">
                    <h3 className="text-2xl font-bold mb-8 text-gray-900">Image Gallery</h3>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                        {blog.images.slice(1).map((img, i) => (
                            <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-zoom-in">
                                <Image src={img.url} alt={`Gallery ${i}`} width={500} height={500} className="w-full h-auto object-cover hover:scale-105 transition duration-500" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Floating Actions */}
        <div className="sticky bottom-10 flex justify-center z-50">
            <div className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-2xl px-8 py-4 rounded-full flex items-center gap-8 text-gray-600">
                <button onClick={handleLike} className={`flex items-center gap-2 font-bold transition ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
                    <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{blog.likes.length}</span>
                </button>
                <div className="flex items-center gap-2 font-bold">
                    <MessageSquare size={24} />
                    <span>{comments.length}</span>
                </div>
                {!isOwnBlog && (
                    <>
                        <button onClick={handleFollow} className="hover:text-purple-600 transition" title="Follow Author"><UserPlus size={24} /></button>
                        <button onClick={handleConnect} className="hover:text-blue-600 transition" title="Connect with Author"><UserCheck size={24} /></button>
                    </>
                )}
                <button className="hover:text-green-500 transition"><Repeat size={24} /></button>
                <button onClick={handleSave} className={`transition ${isSaved ? 'text-purple-600' : 'hover:text-purple-600'}`}>
                    <Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
                <div className="w-px h-8 bg-gray-200"></div>
                <button onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied!');
                }} className="hover:text-purple-600 transition"><Share2 size={24} /></button>
            </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-2xl mx-auto py-20 border-t">
            <h3 className="text-2xl font-bold mb-8">Discussions ({comments.length})</h3>
            
            {user ? (
                <form onSubmit={handleComment} className="mb-12">
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Join the conversation..."
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition h-32 resize-none"
                    />
                    <div className="flex justify-end mt-4">
                        <button className="bg-purple-600 text-white px-8 py-2.5 rounded-full font-bold hover:bg-purple-700 transition shadow-lg">Post Comment</button>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-50 p-8 rounded-3xl text-center mb-12 border border-dashed">
                    <p className="text-gray-500 mb-4">You must be logged in to comment.</p>
                    <Link href="/login" className="text-purple-600 font-bold hover:underline">Log in now</Link>
                </div>
            )}

            <div className="space-y-8">
                {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-4">
                        <Image src={comment.user?.avatar || '/placeholder.png'} alt={comment.user?.name} width={48} height={48} className="rounded-full w-12 h-12 object-cover" />
                        <div className="flex-1 bg-white p-6 rounded-2xl border shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold">{comment.user?.name}</span>
                                <span className="text-xs text-gray-400">{format(new Date(comment.createdAt), 'MMM dd')}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

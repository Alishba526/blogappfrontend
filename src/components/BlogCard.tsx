'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Eye, Trash2, Repeat, Bookmark } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { blogAPI, api } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface BlogCardProps {
  _id: string;
  title: string;
  description: string;
  images: Array<{ url: string }>;
  author: any;
  likes: string[];
  views?: number | Array<{ user: string; viewedAt: Date }>;
  reposts?: number | Array<{ user: string; repostedAt: Date }>;
  createdAt: string;
  onDelete?: () => void;
  isOwnBlog?: boolean;
}

export default function BlogCard({
  _id,
  title,
  description,
  images,
  author,
  likes,
  views = 0,
  reposts = 0,
  createdAt,
  onDelete,
  isOwnBlog = false,
}: BlogCardProps) {
  const { user, setUser } = useAuth();
  const isLiked = user && likes.includes(user._id);
  const isSaved = user && (user as any).savedBlogs?.includes(_id);
  const formattedDate = new Date(createdAt).toLocaleDateString();

  const viewsCount = typeof views === 'number' ? views : views.length;
  const repostsCount = typeof reposts === 'number' ? reposts : reposts.length;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (isLiked) {
        await blogAPI.unlikeBlog(_id);
      } else {
        await blogAPI.likeBlog(_id);
      }
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating like');
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/dashboard/save/${_id}`);
      if (user && setUser) {
        const updatedSavedBlogs = data.saved 
          ? [...((user as any).savedBlogs || []), _id]
          : ((user as any).savedBlogs || []).filter((id: string) => id !== _id);
        
        const updatedUser = { ...user, savedBlogs: updatedSavedBlogs };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser as any);
      }
      toast.success(data.saved ? 'Blog saved!' : 'Blog removed from saved');
    } catch (error: any) {
      toast.error('Error saving blog');
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await blogAPI.repostBlog(_id);
      toast.success('Blog reposted!');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error reposting blog');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogAPI.deleteBlog(_id);
        toast.success('Blog deleted successfully');
        onDelete?.();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Error deleting blog');
      }
    }
  };

  const imageUrl = images[0]?.url || 'https://via.placeholder.com/400x200';

  return (
    <motion.div
        whileHover={{ y: -5, scale: 1.01 }}
        className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full border border-gray-100"
    >
      <Link href={`/blog/${_id}`} className="block flex-1 flex flex-col">
        {/* Image */}
        <div className="relative h-32 md:h-48 w-full bg-gray-200 overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>

        {/* Content */}
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="font-bold text-sm md:text-lg text-gray-800 mb-1 line-clamp-2">
            {title}
          </h3>

          <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2 flex-1">
            {description}
          </p>

          {/* Author Info */}
          <div className="flex items-center gap-1.5 mb-2 pt-2 border-t">
            <Image
              src={author?.avatar || 'https://via.placeholder.com/32'}
              alt={author?.name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <div>
              <p className="text-[10px] md:text-xs font-semibold text-gray-700">
                {author?.name}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">{formattedDate}</p>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Footer Stats and Actions */}
      <div className="px-3 pb-3 flex items-center justify-between text-gray-600 text-[10px] md:text-sm bg-gray-50/50">
        <div className="flex gap-2 md:gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-0.5 transition ${
              isLiked ? 'text-red-500' : 'hover:text-red-500'
            }`}
          >
            <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likes.length}</span>
          </button>

          <button
            onClick={handleRepost}
            className="flex items-center gap-0.5 hover:text-green-500 transition"
          >
            <Repeat size={14} />
            <span>{repostsCount}</span>
          </button>

          <div className="flex items-center gap-0.5">
            <Eye size={14} />
            <span>{viewsCount}</span>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className={`transition ${isSaved ? 'text-purple-600' : 'hover:text-purple-600'}`}
          >
            <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
          
          {isOwnBlog && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 transition"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

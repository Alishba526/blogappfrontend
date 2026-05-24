'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { blogAPI } from '@/lib/api';
import BlogForm from '@/components/BlogForm';
import toast from 'react-hot-toast';

interface Blog {
  _id: string;
  title: string;
  description: string;
  content: string;
  images: Array<{ url: string; publicId: string }>;
  links: string[];
  author: any;
  likes: string[];
  views: number;
  createdAt: string;
}

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const blogId = params.id as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please login to edit a blog');
      router.push('/login');
      return;
    }

    if (!loading && isAuthenticated) {
      fetchBlog();
    }
  }, [isAuthenticated, loading, router]);

  const fetchBlog = async () => {
    try {
      setIsLoading(true);
      const response = await blogAPI.getBlogById(blogId);
      const fetchedBlog = response.data;

      // Check if user is the author
      if (fetchedBlog.author._id !== user?._id) {
        toast.error('You are not authorized to edit this blog');
        router.push('/');
        return;
      }

      setBlog(fetchedBlog);
    } catch (error: any) {
      toast.error('Failed to fetch blog');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await blogAPI.updateBlog(blogId, formData);
      toast.success('Blog updated successfully!');
      router.push(`/blog/${blogId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Edit Blog</h1>
          <p className="text-gray-600 mt-2">Update your blog post</p>
        </div>

        <BlogForm
          initialData={blog}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitButtonText="Update Blog"
        />
      </div>
    </div>
  );
}

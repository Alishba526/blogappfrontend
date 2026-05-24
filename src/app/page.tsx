'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { blogAPI } from '@/lib/api';
import BlogCard from '@/components/BlogCard';
import { Loader2, ArrowRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Blog {
  _id: string;
  title: string;
  description: string;
  images: Array<{ url: string }>;
  author: any;
  likes: string[];
  views: number;
  createdAt: string;
}

const heroSlides = [
    { title: "Share Your Stories", desc: "Start blogging on the most interactive platform.", image: "/hero.png" },
    { title: "AI-Powered Creation", desc: "Generate high-quality blog content in seconds.", image: "/herosec.png" },
];

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchBlogs();
    const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [page]);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await blogAPI.getAllBlogs(page, 12);
      setBlogs(response.data.blogs);
      setTotalPages(response.data.totalPages);
    } catch (error: any) {
      toast.error('Failed to fetch blogs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBlog = () => {
    fetchBlogs();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[500px] w-full overflow-hidden bg-gray-900 text-white flex items-center">
        <AnimatePresence mode="wait">
            <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0 flex items-center"
            >
                <img 
                    src={heroSlides[currentSlide].image} 
                    alt="Hero" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
                    <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-white"
                    >
                        {heroSlides[currentSlide].title}
                    </motion.h1>
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg md:text-xl lg:text-2xl text-gray-100 mb-10 max-w-2xl"
                    >
                        {heroSlides[currentSlide].desc}
                    </motion.p>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Link
                            href="/create"
                            className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-3 md:px-10 md:py-4 rounded-xl font-black text-lg hover:bg-secondary/90 transition"
                        >
                            Get Started
                            <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
      </section>

      {/* Blogs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-black text-gray-900 mb-12 flex items-center gap-3">
            <div className="w-2 h-8 bg-purple-600 rounded-full"></div>
            Latest Stories
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={40} className="animate-spin text-purple-600" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">
              No blogs yet
            </h3>
            <p className="text-gray-500 mb-8">
              Be the first to share your story!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Create First Blog
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-12">
              {blogs.map((blog) => (
                <BlogCard
                  key={blog._id}
                  {...blog}
                  onDelete={handleDeleteBlog}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-6 py-2 bg-white border font-bold text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition shadow-sm"
              >
                Previous
              </button>
              <span className="text-gray-600 font-bold">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-6 py-2 bg-purple-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition shadow-lg"
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>

      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowCreateMenu((prev) => !prev)}
          className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-600 text-white shadow-2xl hover:bg-purple-700 transition"
          aria-label="Open blog creation menu"
        >
          <Plus size={24} />
        </button>

        {showCreateMenu && (
          <div className="mt-3 w-72 rounded-3xl bg-white border border-purple-100 shadow-2xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Quick create options</p>
            <Link
              href={isAuthenticated ? '/create' : '/login'}
              className="block rounded-2xl bg-purple-600 text-white px-4 py-3 mb-3 text-sm font-semibold hover:bg-purple-700 transition"
              onClick={() => setShowCreateMenu(false)}
            >
              Start a new blog
            </Link>
            <Link
              href={isAuthenticated ? '/create' : '/login'}
              className="block rounded-2xl border border-purple-200 text-purple-700 px-4 py-3 mb-3 text-sm font-semibold hover:bg-purple-50 transition"
              onClick={() => setShowCreateMenu(false)}
            >
              Generate with AI
            </Link>
            <Link
              href={isAuthenticated ? '/create' : '/login'}
              className="block rounded-2xl border border-purple-200 text-gray-700 px-4 py-3 text-sm font-semibold hover:bg-purple-50 transition"
              onClick={() => setShowCreateMenu(false)}
            >
              Write draft / schedule
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

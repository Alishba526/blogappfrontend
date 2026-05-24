'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <img src="/logo.jpeg" alt="ARQBlog Logo" className="w-14 h-14 rounded-full" />
            <span>ARQ Blogs</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="hover:text-purple-200 transition">
              Home
            </Link>

            {isAuthenticated && user ? (
              <>
                <Link href="/dashboard" className="hover:text-purple-200 transition">
                  Dashboard
                </Link>
                <Link href="/create" className="hover:text-purple-200 transition">
                  Create Blog
                </Link>
                <Link href="/connections" className="hover:text-purple-200 transition">
                  Networking
                </Link>
                <Link href="/ai-tools" className="hover:text-purple-200 transition">
                  AI Tools
                </Link>
                <Link href="/chat" className="hover:text-purple-200 transition">
                  Messages
                </Link>
                <Link href="/notifications" className="hover:text-purple-200 transition">
                  Notifications
                </Link>
                <Link href={`/profile/${user._id}`} className="hover:text-purple-200 transition">
                  Profile
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-4">
                <Link
                  href="/login"
                  className="hover:text-purple-200 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-4">
            <Link href="/" onClick={() => setIsOpen(false)} className="block hover:text-purple-200 transition">
              Home
            </Link>

            {isAuthenticated && user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block hover:text-purple-200 transition">
                  Dashboard
                </Link>
                <Link href="/create" onClick={() => setIsOpen(false)} className="block hover:text-purple-200 transition">
                  Create Blog
                </Link>
                <Link href="/connections" onClick={() => setIsOpen(false)} className="block hover:text-purple-200 transition">
                  Networking
                </Link>
                <Link href="/chat" onClick={() => setIsOpen(false)} className="block hover:text-purple-200 transition">
                  Messages
                </Link>
                <Link href="/notifications" onClick={() => setIsOpen(false)} className="block hover:text-purple-200 transition">
                  Notifications
                </Link>
                <Link href={`/profile/${user._id}`} onClick={() => setIsOpen(false)} className="block hover:text-purple-200 transition">
                  Profile
                </Link>
                <div className="pt-4 border-t border-purple-400">
                  <p className="mb-3 text-sm">{user.name}</p>
                  <button
                    onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                    }}
                    className="w-full bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 border-t border-purple-400 space-y-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block hover:text-purple-200 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 transition text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

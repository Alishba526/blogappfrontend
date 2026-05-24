'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { profileAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Loader2, Save, ArrowLeft, User, Mail, Info, Globe, Linkedin, Github, Instagram, Facebook, Twitter, Calendar, Camera } from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    website: '',
    dob: '',
    socialLinks: {
      linkedin: '',
      github: '',
      instagram: '',
      facebook: '',
      x: '',
    },
  });

  useEffect(() => {
    if (user) {
      fetchCurrentProfile();
      setAvatarPreview(user.avatar || null);
    } else if (!loading) {
        router.push('/login');
    }
  }, [user]);

  const fetchCurrentProfile = async () => {
    if (!user) return;
    try {
      setFetching(true);
      const { data } = await profileAPI.getProfile(user._id);
      const u = data.user;
      setFormData({
        name: u.name || '',
        bio: u.bio || '',
        website: u.website || '',
        dob: u.dob ? new Date(u.dob).toISOString().split('T')[0] : '',
        socialLinks: {
          linkedin: u.socialLinks?.linkedin || '',
          github: u.socialLinks?.github || '',
          instagram: u.socialLinks?.instagram || '',
          facebook: u.socialLinks?.facebook || '',
          x: u.socialLinks?.x || '',
        },
      });
      if (u.avatar) setAvatarPreview(u.avatar);
    } catch (error) {
      toast.error('Failed to fetch profile details');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      data.append('website', formData.website);
      data.append('dob', formData.dob);
      data.append('socialLinks', JSON.stringify(formData.socialLinks));
      
      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const response = await profileAPI.updateProfile(data);
      const updatedUser = response.data;
      
      // Update local storage and context
      const fullUpdatedUser = { ...user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(fullUpdatedUser));
      if (setUser) setUser(fullUpdatedUser);
      
      toast.success('Profile updated successfully!');
      router.push(`/profile/${user._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 size={40} className="animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-100 shadow-md">
                  <Image
                    src={avatarPreview || '/placeholder.png'}
                    alt="Profile Preview"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
                <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition shadow-lg">
                  <Camera size={20} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">Click the camera icon to change your profile picture</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <User size={20} className="text-purple-600" /> Basic Information
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-purple-500">
                    <span className="pl-3 text-gray-500"><Globe size={18}/></span>
                    <input
                      type="url"
                      name="website"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-3 py-2 outline-none rounded-r-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Info size={20} className="text-purple-600" /> About You
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <hr className="my-8" />

            {/* Social Links */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Social Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-purple-500">
                  <span className="pl-3 text-blue-700"><Linkedin size={18}/></span>
                  <input
                    type="url"
                    name="socialLinks.linkedin"
                    placeholder="LinkedIn URL"
                    value={formData.socialLinks.linkedin}
                    onChange={handleChange}
                    className="w-full px-3 py-2 outline-none rounded-r-lg"
                  />
                </div>
                <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-purple-500">
                  <span className="pl-3 text-gray-800"><Github size={18}/></span>
                  <input
                    type="url"
                    name="socialLinks.github"
                    placeholder="GitHub URL"
                    value={formData.socialLinks.github}
                    onChange={handleChange}
                    className="w-full px-3 py-2 outline-none rounded-r-lg"
                  />
                </div>
                <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-purple-500">
                  <span className="pl-3 text-pink-600"><Instagram size={18}/></span>
                  <input
                    type="url"
                    name="socialLinks.instagram"
                    placeholder="Instagram URL"
                    value={formData.socialLinks.instagram}
                    onChange={handleChange}
                    className="w-full px-3 py-2 outline-none rounded-r-lg"
                  />
                </div>
                <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-purple-500">
                  <span className="pl-3 text-blue-800"><Facebook size={18}/></span>
                  <input
                    type="url"
                    name="socialLinks.facebook"
                    placeholder="Facebook URL"
                    value={formData.socialLinks.facebook}
                    onChange={handleChange}
                    className="w-full px-3 py-2 outline-none rounded-r-lg"
                  />
                </div>
                <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-purple-500">
                  <span className="pl-3 text-gray-900"><Twitter size={18}/></span>
                  <input
                    type="url"
                    name="socialLinks.x"
                    placeholder="X (Twitter) URL"
                    value={formData.socialLinks.x}
                    onChange={handleChange}
                    className="w-full px-3 py-2 outline-none rounded-r-lg"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Image as ImageIcon, Link as LinkIcon, X, Upload, Video, Sparkles, Loader2, Plus, Info } from 'lucide-react';
import Image from 'next/image';
import { aiAPI } from '@/lib/api';

interface BlogFormProps {
  initialData?: any;
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading?: boolean;
  submitButtonText?: string;
}

export default function BlogForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitButtonText = 'Create Blog',
}: BlogFormProps) {
  const normalizeArrayField = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch (e) {
        return value
          .split(/\r?\n|,/) 
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');
  const [intro, setIntro] = useState(initialData?.intro || '');
  const [conclusion, setConclusion] = useState(initialData?.conclusion || '');
  const [headings, setHeadings] = useState<string[]>(normalizeArrayField(initialData?.headings));
  const [subheadings, setSubheadings] = useState<string[]>(normalizeArrayField(initialData?.subheadings));
  const [faqs, setFaqs] = useState<string[]>(normalizeArrayField(initialData?.faqs));
  const [tags, setTags] = useState<string[]>(normalizeArrayField(initialData?.tags));
  const [keywords, setKeywords] = useState<string[]>(normalizeArrayField(initialData?.keywords));
  const [socialCaptions, setSocialCaptions] = useState(initialData?.socialCaptions || '');
  const [pinterestText, setPinterestText] = useState(initialData?.pinterestText || '');
  const [altTags, setAltTags] = useState<string[]>(normalizeArrayField(initialData?.altTags));
  const [category, setCategory] = useState(initialData?.category || 'General');
  const [links, setLinks] = useState<string[]>(normalizeArrayField(initialData?.links));
  const [newLink, setNewLink] = useState('');
  
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreview] = useState<{url: string, type: 'image' | 'video'}[]>(
    [
        ...(initialData?.images?.map((img: any) => ({ url: img.url, type: 'image' })) || []),
        ...(initialData?.videos?.map((vid: string) => ({ url: vid, type: 'video' })) || [])
    ]
  );
  const [isDragging, setIsDragging] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!initialData) return;
    setTitle(initialData.title || title);
    setDescription(initialData.description || description);
    setContent(initialData.content || content);
    setSeoTitle(initialData.seoTitle || seoTitle);
    setMetaDescription(initialData.metaDescription || metaDescription);
    setIntro(initialData.intro || intro);
    setConclusion(initialData.conclusion || conclusion);
    setHeadings(normalizeArrayField(initialData.headings));
    setSubheadings(normalizeArrayField(initialData.subheadings));
    setFaqs(normalizeArrayField(initialData.faqs));
    setTags(normalizeArrayField(initialData.tags));
    setKeywords(normalizeArrayField(initialData.keywords));
    setSocialCaptions(initialData.socialCaptions || socialCaptions);
    setPinterestText(initialData.pinterestText || pinterestText);
    setAltTags(normalizeArrayField(initialData.altTags));
    setCategory(initialData.category || category);
    setLinks(normalizeArrayField(initialData.links));
    setMediaPreview([
        ...(initialData.images?.map((img: any) => ({ url: img.url, type: 'image' })) || []),
        ...(initialData.videos?.map((vid: string) => ({ url: vid, type: 'video' })) || [])
    ]);
  }, [initialData]);

  const handleMediaFiles = (files: File[]) => {
    files.forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const limit = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      
      if (file.size > limit) {
        toast.error(`${file.name} is too large. Max ${isVideo ? '50MB' : '5MB'}`);
        return;
      }
      
      setMediaFiles((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onload = (event) => {
        setMediaPreview((prev) => [...prev, { 
            url: event.target?.result as string, 
            type: isVideo ? 'video' : 'image' 
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleMediaFiles(files);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleMediaFiles(files);
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
        return prev.filter((_, i) => i !== index);
    });
    setMediaPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const generateWithAI = async (type: 'altTags' | 'socialCaptions' | 'seo') => {
    if (!title || !description) {
        toast.error('Title and Description are required for AI suggestions');
        return;
    }
    try {
        setAiLoading(true);
        const { data } = await aiAPI.generate({
            action: type,
            title,
            category,
            description,
            currentContent: content,
        });

        if (type === 'altTags' && data.altTags) setAltTags(data.altTags);
        if (type === 'socialCaptions') {
            setSocialCaptions(
              Array.isArray(data.socialCaptions)
                ? data.socialCaptions.join('\n')
                : data.socialCaptions || data.caption || ''
            );
        }
        if (type === 'seo') {
            if (data.seoTitle) setSeoTitle(data.seoTitle);
            if (data.metaDescription) setMetaDescription(data.metaDescription);
        }
        toast.success(`${type} generated!`);
    } catch (error) {
        toast.error('AI generation failed');
    } finally {
        setAiLoading(false);
    }
  };

  const addLink = () => {
    if (newLink.trim()) {
      if (!newLink.startsWith('http')) {
        toast.error('Link must start with http:// or https://');
        return;
      }
      setLinks((prev) => [...prev, newLink]);
      setNewLink('');
    }
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published' = 'published') => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('content', content);
    formData.append('seoTitle', seoTitle);
    formData.append('metaDescription', metaDescription);
    formData.append('intro', intro);
    formData.append('conclusion', conclusion);
    formData.append('headings', JSON.stringify(headings));
    formData.append('subheadings', JSON.stringify(subheadings));
    formData.append('faqs', JSON.stringify(faqs));
    formData.append('tags', JSON.stringify(tags));
    formData.append('keywords', JSON.stringify(keywords));
    formData.append('socialCaptions', socialCaptions);
    formData.append('pinterestText', pinterestText);
    formData.append('altTags', JSON.stringify(altTags));
    formData.append('category', category);
    formData.append('status', status);
    formData.append('links', JSON.stringify(links));

    mediaFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      await onSubmit(formData);
    } catch (error: any) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="text-purple-600" /> Blog Content
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Blog Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 10 Reasons to Start Learning AI in 2024"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Short Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a brief overview to attract readers..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Content *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your story..."
                  rows={15}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-serif text-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ImageIcon className="text-purple-600" /> Media Gallery
            </h2>
            
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition ${isDragging ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-gray-50 hover:border-purple-400'}`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-purple-600">
                    <Upload size={32} />
                </div>
                <div>
                    <p className="text-lg font-bold">Drag and drop media here</p>
                    <p className="text-sm text-gray-500">Support for Images (JPG, PNG, WebP) and Videos (MP4)</p>
                </div>
                <label className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold cursor-pointer hover:bg-purple-700 transition shadow-lg">
                    Browse Files
                    <input type="file" multiple onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            {mediaPreviews.length > 0 && (
                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaPreviews.map((media, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden aspect-video border shadow-sm">
                            {media.type === 'video' ? (
                                <video src={media.url} className="w-full h-full object-cover" />
                            ) : (
                                <img src={media.url} alt="Preview" className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                <button type="button" onClick={() => removeMedia(index)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition">
                                    <X size={18} />
                                </button>
                                {media.type === 'video' && <Video className="text-white" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <Info size={18} className="text-purple-600" /> Post Settings
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="General">General</option>
                        <option value="Technology">Technology</option>
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="Travel">Travel</option>
                        <option value="Food">Food</option>
                        <option value="Business">Business</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tags</label>
                    <textarea
                        value={tags.join(', ')}
                        onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()))}
                        placeholder="tag1, tag2..."
                        className="w-full px-3 py-2 bg-gray-50 border rounded-lg outline-none"
                        rows={2}
                    />
                </div>
            </div>
          </div>

          {/* AI Optimizer */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <Sparkles size={18} /> AI Content Optimizer
            </h3>
            <div className="space-y-3">
                <button 
                    type="button" 
                    disabled={aiLoading}
                    onClick={() => generateWithAI('seo')}
                    className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-xl border border-white/20 text-left transition flex justify-between items-center group"
                >
                    <span className="text-sm font-medium">Optimize SEO Meta</span>
                    <Sparkles size={14} className="opacity-0 group-hover:opacity-100 transition" />
                </button>
                <button 
                    type="button" 
                    disabled={aiLoading}
                    onClick={() => generateWithAI('altTags')}
                    className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-xl border border-white/20 text-left transition flex justify-between items-center group"
                >
                    <span className="text-sm font-medium">Generate Image Alt-Tags</span>
                    <Sparkles size={14} className="opacity-0 group-hover:opacity-100 transition" />
                </button>
                <button 
                    type="button" 
                    disabled={aiLoading}
                    onClick={() => generateWithAI('socialCaptions')}
                    className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-xl border border-white/20 text-left transition flex justify-between items-center group"
                >
                    <span className="text-sm font-medium">Auto-Social Captions</span>
                    <Sparkles size={14} className="opacity-0 group-hover:opacity-100 transition" />
                </button>
            </div>
            {aiLoading && <div className="mt-4 flex items-center justify-center gap-2 text-xs"><Loader2 className="animate-spin" size={14} /> AI is thinking...</div>}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {submitButtonText}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={isLoading}
              className="w-full py-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition"
            >
              Save to Drafts
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import BlogForm from '@/components/BlogForm';
import { blogAPI, aiAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { Plus, Sparkles, Wand2, PenTool, Layout, Settings2, Loader2 } from 'lucide-react';

import { Suspense } from 'react';

function CreateBlogContent() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'ai' ? 'ai' : 'manual';

  const [mode, setMode] = useState<'manual' | 'ai'>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAIResponse] = useState<any>(null);
  const [aiInputs, setAIInputs] = useState({
    title: '',
    category: 'General',
    keywords: '',
    description: '',
    language: 'English',
    tone: 'Professional',
    length: 'Medium',
    targetAudience: 'General Readers',
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please login to create a blog');
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const updateAIInput = (field: string, value: string) => {
    setAIInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      const response = await blogAPI.createBlog(formData);
      const message = response.data?.message || 'Blog published successfully!';
      toast.success(message);
      router.push('/');
    } catch (error: any) {
      console.error('Blog creation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create blog';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateAI = async (action: string) => {
    if (!aiInputs.title && action === 'generate') {
      toast.error('Please provide a blog title to generate content.');
      return;
    }

    try {
      setIsGenerating(true);
      toast.loading('AI is generating content...');

      const response = await aiAPI.generate({
        action,
        ...aiInputs,
        currentContent: aiResponse?.content || aiInputs.description || '',
      });

      const normalizeArrayValues = (value: any) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return [value];
        if (typeof value === 'object') {
          return Object.values(value).map((item) => String(item));
        }
        return [String(value)];
      };

      const extractFaqStrings = (faqs: any) => {
        if (!faqs) return [];
        if (Array.isArray(faqs)) {
          return faqs
            .map((faq) => {
              if (typeof faq === 'string') return faq;
              if (faq && typeof faq === 'object') {
                const question = faq.question ? String(faq.question).trim() : '';
                const answer = faq.answer ? String(faq.answer).trim() : '';
                return question && answer ? `Q: ${question}\nA: ${answer}` : question || answer || '';
              }
              return '';
            })
            .filter(Boolean);
        }
        try {
          const parsed = JSON.parse(faqs);
          return extractFaqStrings(parsed);
        } catch (error) {
          return [String(faqs)];
        }
      };

      const transformedData = {
        title: response.data.blogTitle || aiInputs.title,
        description: response.data.metaDescription || aiInputs.description || '',
        content: `${response.data.intro || ''}\n\n${response.data.content || ''}\n\n${response.data.conclusion || ''}`,
        seoTitle: response.data.seoTitle || '',
        metaDescription: response.data.metaDescription || '',
        intro: response.data.intro || '',
        conclusion: response.data.conclusion || '',
        headings: normalizeArrayValues(response.data.headings),
        subheadings: normalizeArrayValues(response.data.subheadings),
        faqs: extractFaqStrings(response.data.faqs),
        tags: normalizeArrayValues(response.data.tags),
        keywords: normalizeArrayValues(response.data.keywords),
        socialCaptions: Array.isArray(response.data.socialCaptions)
          ? response.data.socialCaptions.join('\n')
          : response.data.socialCaptions || '',
        pinterestText: response.data.pinterestText || '',
        altTags: normalizeArrayValues(response.data.altTags),
        category: aiInputs.category,
      };

      toast.dismiss();
      setAIResponse(transformedData);
      toast.success('AI content generated!');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'AI generation failed');
      console.error('AI generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-purple-600" size={40} /></div>;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mode Selector */}
        <div className="flex justify-center mb-12">
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border flex gap-2">
                <button 
                    onClick={() => setMode('manual')}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition ${mode === 'manual' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <PenTool size={20} /> Manual Creation
                </button>
                <button 
                    onClick={() => setMode('ai')}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition ${mode === 'ai' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <Sparkles size={20} /> AI Powered
                </button>
            </div>
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-8 text-center">
            {mode === 'ai' ? 'Craft with AI Intelligence' : 'Share Your Unique Story'}
        </h1>

        {mode === 'ai' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Wand2 size={24}/></div>
                    <h2 className="text-2xl font-bold text-gray-800">AI Blog Architect</h2>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2">Primary Topic / Title</label>
                            <input
                                value={aiInputs.title}
                                onChange={(e) => updateAIInput('title', e.target.value)}
                                placeholder="e.g. The Future of Sustainable Energy"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2">Target Audience</label>
                            <input
                                value={aiInputs.targetAudience}
                                onChange={(e) => updateAIInput('targetAudience', e.target.value)}
                                placeholder="e.g. Tech Enthusiasts, Beginners"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2">Category</label>
                            <select
                                value={aiInputs.category}
                                onChange={(e) => updateAIInput('category', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none transition"
                            >
                                <option value="General">General</option>
                                <option value="Technology">Technology</option>
                                <option value="Lifestyle">Lifestyle</option>
                                <option value="Business">Business</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">Tone</label>
                                <input
                                    value={aiInputs.tone}
                                    onChange={(e) => updateAIInput('tone', e.target.value)}
                                    placeholder="Professional"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">Length</label>
                                <select
                                    value={aiInputs.length}
                                    onChange={(e) => updateAIInput('length', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none transition"
                                >
                                    <option>Short</option>
                                    <option>Medium</option>
                                    <option>Long</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => handleGenerateAI('generate')}
                        disabled={isGenerating}
                        className="flex-1 min-w-[200px] rounded-2xl bg-purple-600 py-4 font-bold text-white hover:bg-purple-700 transition shadow-lg flex items-center justify-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="animate-spin"/> : <Sparkles size={20}/>}
                        Build Complete Draft
                    </button>
                    <button
                        type="button"
                        onClick={() => handleGenerateAI('seo')}
                        disabled={isGenerating}
                        className="rounded-2xl bg-white border border-gray-200 px-6 py-4 font-bold text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        <Settings2 size={18} /> SEO Boost
                    </button>
                </div>
            </div>
        )}

        <div className={mode === 'ai' && !aiResponse ? 'opacity-50 pointer-events-none' : ''}>
            <BlogForm
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
                submitButtonText={mode === 'ai' ? 'Review & Publish AI Draft' : 'Publish My Story'}
                initialData={aiResponse}
            />
        </div>
      </div>
    </div>
  );
}

export default function CreateBlogPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-purple-600" size={40} /></div>}>
      <CreateBlogContent />
    </Suspense>
  );
}

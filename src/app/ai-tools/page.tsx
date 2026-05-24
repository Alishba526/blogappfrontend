'use client';

import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Video, Mic, Podcast, Scan, Scissors, Shirt, Loader2, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIToolsPage() {
  const tools = [
    { title: 'AI Image Generator', desc: 'Create stunning visuals from text prompts.', icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-50', status: 'Coming Soon' },
    { title: 'AI Video Generator', desc: 'Transform scripts into cinematic videos.', icon: Video, color: 'text-purple-500', bg: 'bg-purple-50', status: 'Coming Soon' },
    { title: 'AI Voice Blog', desc: 'Convert your blogs into natural human speech.', icon: Mic, color: 'text-pink-500', bg: 'bg-pink-50', status: 'Alpha' },
    { title: 'AI Podcast Generator', desc: 'Automatically generate podcast scripts and audio.', icon: Podcast, color: 'text-orange-500', bg: 'bg-orange-50', status: 'Coming Soon' },
    { title: 'AI Face Scan', desc: 'Analyze facial features for personalized content.', icon: Scan, color: 'text-teal-500', bg: 'bg-teal-50', status: 'Research' },
    { title: 'AI Hairstyle Gen', desc: 'Try on different hairstyles virtually.', icon: Scissors, color: 'text-indigo-500', bg: 'bg-indigo-50', status: 'Research' },
    { title: 'AI Virtual Try-On', desc: 'See how clothes look on you using AI.', icon: Shirt, color: 'text-emerald-500', bg: 'bg-emerald-50', status: 'Research' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-full font-bold text-sm mb-6">
            <Sparkles size={16} /> Advanced AI Suite
        </div>
        <h1 className="text-5xl font-black text-gray-900 mb-6">Explore the Future of Creativity</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-16">
            Our next-generation AI tools are designed to help you create, visualize, and connect like never before.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {tools.map((tool, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition group cursor-pointer">
              <div className={`${tool.bg} ${tool.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300`}>
                <tool.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{tool.title}</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">{tool.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{tool.status}</span>
                <button className="text-purple-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                    Learn More <Wand2 size={16}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// app/contact/page.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { Mail,Heart, Send, CheckCircle, User, AtSign, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this to an API
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#090911]' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-10">
          <Link 
            href="/" 
            className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            ← Back to Home
          </Link>
          <h1 className={`text-3xl sm:text-4xl font-bold mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Contact Us
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Have questions or feedback? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Info */}
          <div className={`md:col-span-1 rounded-2xl p-6 border ${
            isDark ? 'bg-[#1a1a2e] border-[#2d2d4a]' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Get in Touch
            </h2>
            <div className="space-y-4">
              {[
                { icon: <Mail className="w-4 h-4" />, label: 'Email', value: 'solvezi.com@gmail.com' },
                // { icon: <Heart className="w-4 h-4" />, label: 'Twitter', value: '@whycolors' },
                // { icon: <Heart className="w-4 h-4" />, label: 'GitHub', value: 'github.com/whycolors' },
              ].map((item) => (
                <div key={item.label}>
                  <p className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {item.icon} {item.label}
                  </p>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className={`md:col-span-2 rounded-2xl p-6 border ${
            isDark ? 'bg-[#1a1a2e] border-[#2d2d4a]' : 'bg-white border-gray-200'
          }`}>
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Message Sent!
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  We'll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`flex items-center gap-2 text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <User className="w-4 h-4" />
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 transition ${
                      isDark 
                        ? 'bg-[#0d0d1a] border-[#2d2d4a] text-white focus:border-purple-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500'
                    }`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className={`flex items-center gap-2 text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <AtSign className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 transition ${
                      isDark 
                        ? 'bg-[#0d0d1a] border-[#2d2d4a] text-white focus:border-purple-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500'
                    }`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className={`flex items-center gap-2 text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 transition ${
                      isDark 
                        ? 'bg-[#0d0d1a] border-[#2d2d4a] text-white focus:border-purple-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500'
                    }`}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
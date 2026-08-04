'use client';

import { useState } from 'react';
import GradientGenerator from '@/components/color/GradientGenerator';
import { useTheme } from '@/contexts/ThemeContext';

export default function GradientPage() {
  const { isDark } = useTheme();
  const [color, setColor] = useState('#8b5cf6');
  
  return (
    <div className={`max-w-6xl mx-auto p-6 min-h-screen ${
      isDark ? 'bg-[#090911]' : 'bg-gray-50'
    }`}>
      <h1 className={`text-3xl font-bold mb-2 ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>
        Gradient Generator
      </h1>
      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
        Create beautiful CSS gradients
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3">
          <GradientGenerator hex={color.replace('#', '')} />
        </div>
        <div className="space-y-4">
          <div className={`rounded-xl p-4 border ${
            isDark 
              ? 'bg-[#1a1a2e] border-[#2d2d4a]' 
              : 'bg-white border-gray-200'
          }`}>
            <label className={`block text-sm mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Base Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={`w-full h-12 rounded-lg cursor-pointer border ${
                isDark ? 'border-[#2d2d4a] bg-transparent' : 'border-gray-200 bg-white'
              }`}
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={`w-full mt-2 px-3 py-2 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                isDark
                  ? 'bg-[#0f0f1a] border border-[#2d2d4a] text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-800'
              }`}
            />
          </div>
          
          <div className={`rounded-xl p-4 border ${
            isDark 
              ? 'bg-[#1a1a2e] border-[#2d2d4a]' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-sm font-medium mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Presets
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-full h-8 rounded border transition ${
                    isDark
                      ? 'border-[#2d2d4a] hover:border-[#8b5cf6]'
                      : 'border-gray-200 hover:border-[#7c3aed]'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
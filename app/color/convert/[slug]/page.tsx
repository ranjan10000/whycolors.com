'use client';

import { useState } from 'react';
import { convertColor, COLOR_FORMATS } from '@/lib/color-utils';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';

export default function ConverterPage() {
  const { isDark } = useTheme();
  const [fromFormat, setFromFormat] = useState('hex');
  const [toFormat, setToFormat] = useState('rgb');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleConvert = () => {
    if (!inputValue.trim()) {
      setResult('');
      setError('');
      return;
    }

    const converted = convertColor(inputValue, fromFormat, toFormat);
    if (converted) {
      setResult(converted);
      setError('');
    } else {
      setError(`Invalid ${fromFormat.toUpperCase()} value`);
      setResult('');
    }
  };

  // Get URL slug for the current conversion
  const currentSlug = `${fromFormat}-to-${toFormat}`;

  return (
    <div className={`max-w-4xl mx-auto p-6 min-h-screen ${
      isDark ? 'bg-[#090911]' : 'bg-gray-50'
    }`}>
      <h1 className={`text-3xl font-bold mb-2 ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>
        Color Converter
      </h1>
      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
        Convert between different color formats
      </p>

      {/* Dynamic URL Route Display */}
      <div className={`mt-2 mb-4 p-3 rounded-lg border ${
        isDark 
          ? 'bg-[#1a1a2e]/50 border-[#2d2d4a] text-gray-400' 
          : 'bg-gray-100/50 border-gray-200 text-gray-600'
      }`}>
        <p className="text-sm flex items-center gap-2">
          <span className="font-medium">Current Route:</span>
          <code className={`px-2 py-1 rounded text-xs font-mono ${
            isDark 
              ? 'bg-[#0f0f1a] text-[#8b5cf6]' 
              : 'bg-gray-200 text-[#7c3aed]'
          }`}>
            /color/converter/{currentSlug}
          </code>
        </p>
      </div>

      <div className={`mt-6 rounded-xl p-6 border ${
        isDark 
          ? 'bg-[#1a1a2e] border-[#2d2d4a]' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              From
            </label>
            <select
              value={fromFormat}
              onChange={(e) => setFromFormat(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                isDark
                  ? 'bg-[#0f0f1a] border border-[#2d2d4a] text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-800'
              }`}
            >
              {COLOR_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label} ({format.symbol})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              To
            </label>
            <select
              value={toFormat}
              onChange={(e) => setToFormat(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                isDark
                  ? 'bg-[#0f0f1a] border border-[#2d2d4a] text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-800'
              }`}
            >
              {COLOR_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label} ({format.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {fromFormat.toUpperCase()} Value
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Enter ${fromFormat.toUpperCase()} value...`}
              className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                isDark
                  ? 'bg-[#0f0f1a] border border-[#2d2d4a] text-white placeholder-gray-500'
                  : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400'
              }`}
            />
            {error && (
              <p className="mt-2 text-red-500 text-sm">{error}</p>
            )}
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {toFormat.toUpperCase()} Result
            </label>
            <div className={`w-full px-4 py-3 rounded-lg min-h-[50px] flex items-center border ${
              isDark
                ? 'bg-[#0f0f1a] border-[#2d2d4a] text-white'
                : 'bg-gray-50 border-gray-200 text-gray-800'
            }`}>
              {result || 'Enter a value to convert'}
            </div>
          </div>
        </div>

        <button
          onClick={handleConvert}
          className={`mt-6 w-full md:w-auto px-6 py-2 rounded-lg text-white font-medium transition ${
            isDark
              ? 'bg-[#8b5cf6] hover:bg-[#7c3aed]'
              : 'bg-[#7c3aed] hover:bg-[#6d28d9]'
          }`}
        >
          Convert
        </button>

        {/* Quick Links */}
        <div className={`mt-6 pt-4 border-t ${
          isDark ? 'border-[#2d2d4a]' : 'border-gray-200'
        }`}>
          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Quick Conversions:
          </p>
          <div className="flex flex-wrap gap-2">
            {COLOR_FORMATS.map((f) => (
              COLOR_FORMATS.filter(t => t.value !== f.value).map((t) => {
                const slug = `${f.value}-to-${t.value}`;
                return (
                  <Link
                    key={slug}
                    href={`/color/converter/${slug}`}
                    className={`px-3 py-1 text-xs rounded-full transition ${
                      fromFormat === f.value && toFormat === t.value
                        ? isDark
                          ? 'bg-[#8b5cf6] text-white'
                          : 'bg-[#7c3aed] text-white'
                        : isDark
                          ? 'bg-[#2d2d4a] hover:bg-[#3d3d5a] text-gray-400'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                    }`}
                  >
                    {f.label} → {t.label}
                  </Link>
                );
              })
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
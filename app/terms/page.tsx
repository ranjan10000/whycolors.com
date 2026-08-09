// app/terms/page.tsx
'use client';

import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';

export default function TermsOfServicePage() {
  const { isDark } = useTheme();

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
            Terms of Service
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className={`rounded-2xl p-6 sm:p-8 border ${
          isDark ? 'bg-[#1a1a2e] border-[#2d2d4a]' : 'bg-white border-gray-200'
        }`}>
          <div className="space-y-6">
            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Acceptance of Terms
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                By using Color Palettes, you agree to these Terms of Service. If you don't 
                agree, please don't use our service.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Use of Service
              </h2>
              <ul className={`list-disc list-inside space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>You may use Color Palettes for personal and commercial projects</li>
                <li>All generated colors are free to use in your designs</li>
                <li>You don't need to credit us, though it's appreciated</li>
                <li>Don't misuse or abuse our service</li>
                <li>Don't attempt to bypass any rate limits</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Intellectual Property
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                The Color Palettes platform itself (code, design, UI) is our intellectual 
                property. However, the color palettes generated are yours to use freely.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Disclaimer
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Our service is provided "as is" without warranties. While we strive for 
                accuracy, color perception can vary between screens and devices. We're not 
                responsible for any color inaccuracies or design decisions made using our 
                service.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Changes to Terms
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                We may update these terms from time to time. Continued use of the service 
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Contact
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Questions about these terms? Contact us at:
                <br />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  legal@colorpalettes.com
                </span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
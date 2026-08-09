// app/privacy/page.tsx
'use client';

import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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
                Information We Collect
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                whycolors.com does not collect any personally identifiable information or user-specific data. 
                We do not log IP addresses, browser details, or usage statistics directly.
              </p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed mt-2`}>
                We collect minimal non-personal information to improve your experience:
              </p>
              <ul className={`list-disc list-inside mt-2 space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>Color preferences and palette selections</li>
                <li>Browser type and device information (for analytics)</li>
                <li>Usage patterns to improve our service</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                How We Use Your Information
              </h2>
              <ul className={`list-disc list-inside space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>To generate and display color palettes</li>
                <li>To improve our color generation algorithms</li>
                <li>To analyze usage trends and improve user experience</li>
                <li>We never sell or share your personal data</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Cookies
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                whycolors.com uses cookies in connection with third-party services such as Google AdSense. 
                These cookies help serve relevant ads to users and track general ad performance.
              </p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed mt-2`}>
                We also use minimal cookies to remember your theme preference (dark/light mode) 
                and your recent color selections. You can clear these at any time from your 
                browser settings or opt out of personalized ads via Google Ads Settings.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Third-Party Services
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                We use Google AdSense to display ads on whycolors.com. Google and its partners may use 
                cookies to personalize and measure the effectiveness of ads based on your visits to 
                this and other websites.
              </p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed mt-2`}>
                While some tools may fetch results from external APIs, we do not store or share any 
                data from those interactions. Processing happens client-side.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Data Sharing
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                whycolors.com does not sell, rent, or share any personal data. We have no personal 
                data to share because we don't collect any.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Data Security
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Although we do not store user data, our website is hosted on secure infrastructure 
                and follows industry best practices. Since we don't store personal information, 
                your privacy is naturally protected.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Children's Privacy
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                We do not knowingly collect information from users under the age of 13, as we do 
                not collect personal data from anyone.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Changes to This Policy
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                We may update this privacy policy from time to time. You are advised to review 
                this privacy policy periodically.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                In Summary
              </h2>
              <ul className={`list-disc list-inside space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>Minimal personal data collection</li>
                <li>Limited cookie use (theme preferences + AdSense only)</li>
                <li>No data selling or misuse</li>
                <li>Client-side processing only</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Contact Us
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                If you have questions about this Privacy Policy, please contact us at:
                <br />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  solvezi.com@gmail.com
                </span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
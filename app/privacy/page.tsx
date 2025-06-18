import type { Metadata } from 'next'
import CookieSettings from '@/components/ui/CookieSettings'

export const metadata: Metadata = {
  title: 'Privacy Policy - EsportsTracker',
  description: 'Privacy policy and cookie information for EsportsTracker',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container-responsive py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Cookie Usage</h2>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <p className="mb-4">
                  EsportsTracker uses cookies to enhance your browsing experience and provide analytics to help us improve our service.
                </p>
                <h3 className="text-lg font-medium mb-3 text-gray-200">Types of Cookies We Use:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li><strong>Analytics Cookies:</strong> Google Analytics to understand how users interact with our site</li>
                  <li><strong>Preference Cookies:</strong> To remember your cookie consent choice</li>
                  <li><strong>Functional Cookies:</strong> To ensure the website functions properly</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">What We Track</h2>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <p className="mb-4">
                  When you consent to analytics cookies, we collect anonymous data about:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Page views and user navigation patterns</li>
                  <li>Popular tournaments, teams, and matches</li>
                  <li>Device and browser information (anonymous)</li>
                  <li>Geographic location (country/region level only)</li>
                  <li>Site performance and loading times</li>
                </ul>
                <p className="mt-4 text-sm text-gray-400">
                  <strong>Note:</strong> We do not collect any personally identifiable information.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Your Choices</h2>
              <CookieSettings />
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-gray-200">Browser Settings</h3>
                    <p className="text-gray-300">
                      You can also disable cookies entirely through your browser settings, though this may affect site functionality.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Data Protection</h2>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <p className="mb-4">
                  We are committed to protecting your privacy:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>All data is anonymized and aggregated</li>
                  <li>No personal information is collected or stored</li>
                  <li>Data is processed in accordance with GDPR requirements</li>
                  <li>We use industry-standard security measures</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Third-Party Services</h2>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-gray-200">Google Analytics</h3>
                                         <p className="text-gray-300">
                       We use Google Analytics to understand site usage. Google&apos;s privacy policy applies to this data.
                       <a 
                         href="https://policies.google.com/privacy" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-blue-400 hover:text-blue-300 ml-1 underline"
                       >
                         View Google&apos;s Privacy Policy
                       </a>
                     </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-gray-200">PandaScore API</h3>
                                         <p className="text-gray-300">
                       We use PandaScore&apos;s API to fetch esports data. No personal data is shared with PandaScore.
                     </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Contact</h2>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-300">
                  If you have any questions about this privacy policy or our use of cookies, please contact us through our website.
                </p>
                <p className="text-sm text-gray-400 mt-4">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 

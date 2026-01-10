import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Cookie Policy | Sappio',
    description: 'Information about how Sappio uses cookies and similar technologies.',
}

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFB] py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12">
                    <div className="mb-8">
                        <Link href="/" className="text-[#5A5FF0] hover:underline text-sm font-medium">
                            ← Back to Home
                        </Link>
                    </div>

                    <h1 className="text-4xl font-bold text-[#1A1D2E] mb-2">Cookie Policy</h1>
                    <p className="text-gray-500 mb-10 text-sm">Last updated: January 10, 2026</p>

                    <div className="space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">1. What Are Cookies?</h2>
                            <p>
                                Cookies are small text files that are placed on your computer or mobile device when you
                                visit a website. They are widely used to make websites work more efficiently and to
                                provide information to website owners. Cookies help us remember your preferences and
                                understand how you use our Services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">2. Types of Cookies We Use</h2>

                            <div className="bg-gray-50 rounded-xl p-6 mb-4">
                                <h3 className="text-lg font-semibold text-[#1A1D2E] mb-3">Essential Cookies</h3>
                                <p className="text-gray-600 mb-2">
                                    These cookies are necessary for the website to function properly. They enable basic
                                    features like page navigation, secure areas access, and session management.
                                </p>
                                <p className="text-sm text-gray-500">
                                    <strong>Cannot be disabled.</strong> The website cannot function without these cookies.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 mb-4">
                                <h3 className="text-lg font-semibold text-[#1A1D2E] mb-3">Analytics Cookies</h3>
                                <p className="text-gray-600 mb-2">
                                    We use analytics cookies to understand how visitors interact with our website. This
                                    helps us improve user experience and website performance. We use PostHog for analytics.
                                </p>
                                <p className="text-sm text-gray-500">
                                    <strong>Can be disabled</strong> via our cookie consent banner.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-[#1A1D2E] mb-3">Functional Cookies</h3>
                                <p className="text-gray-600 mb-2">
                                    These cookies allow the website to remember choices you make (such as language preferences
                                    or theme settings) and provide enhanced, personalized features.
                                </p>
                                <p className="text-sm text-gray-500">
                                    <strong>Recommended.</strong> Disabling may affect your experience.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">3. Specific Cookies We Use</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-[#1A1D2E]">Cookie Name</th>
                                            <th className="text-left py-3 px-4 font-semibold text-[#1A1D2E]">Purpose</th>
                                            <th className="text-left py-3 px-4 font-semibold text-[#1A1D2E]">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600">
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4 font-mono text-xs">sb-*-auth-token</td>
                                            <td className="py-3 px-4">Authentication session</td>
                                            <td className="py-3 px-4">Session</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4 font-mono text-xs">cookie_consent</td>
                                            <td className="py-3 px-4">Stores your cookie preferences</td>
                                            <td className="py-3 px-4">1 year</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4 font-mono text-xs">ph_*</td>
                                            <td className="py-3 px-4">PostHog analytics</td>
                                            <td className="py-3 px-4">1 year</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">4. Managing Your Cookie Preferences</h2>
                            <p className="mb-4">
                                When you first visit our website, you will see a cookie consent banner that allows you
                                to accept or decline non-essential cookies. You can change your preferences at any time.
                            </p>
                            <p className="mb-4">
                                You can also control cookies through your browser settings. Most browsers allow you to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>View what cookies are stored and delete them individually</li>
                                <li>Block third-party cookies</li>
                                <li>Block cookies from specific sites</li>
                                <li>Block all cookies</li>
                                <li>Delete all cookies when you close the browser</li>
                            </ul>
                            <p className="mt-4 text-gray-500 text-sm">
                                Note: Blocking all cookies may affect the functionality of our Services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">5. Third-Party Cookies</h2>
                            <p>
                                Some cookies on our site are set by third-party services that appear on our pages.
                                We do not control these cookies and recommend reviewing the privacy policies of these
                                third parties for more information about their cookie practices.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">6. Updates to This Policy</h2>
                            <p>
                                We may update this Cookie Policy periodically. Check this page for the latest information
                                about our cookie practices. Significant changes will be communicated through our website.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">7. Contact Us</h2>
                            <p>
                                If you have questions about our use of cookies, please contact us at{' '}
                                <a href="mailto:privacy@sappio.ai" className="text-[#5A5FF0] hover:underline">
                                    privacy@sappio.ai
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

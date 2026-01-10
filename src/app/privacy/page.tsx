import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Privacy Policy | Sappio',
    description: 'How Sappio collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFB] py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12">
                    <div className="mb-8">
                        <Link href="/" className="text-[#5A5FF0] hover:underline text-sm font-medium">
                            ← Back to Home
                        </Link>
                    </div>

                    <h1 className="text-4xl font-bold text-[#1A1D2E] mb-2">Privacy Policy</h1>
                    <p className="text-gray-500 mb-10 text-sm">Last updated: January 10, 2026</p>

                    <div className="space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">1. Introduction</h2>
                            <p>
                                At Sappio, we take your privacy seriously. This Privacy Policy explains how we collect,
                                use, disclose, and safeguard your information when you use our website and services.
                                Please read this policy carefully to understand our practices regarding your personal data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">2. Information We Collect</h2>

                            <h3 className="text-lg font-semibold text-[#1A1D2E] mt-6 mb-3">2.1 Information You Provide</h3>
                            <ul className="list-disc pl-6 space-y-2 mb-4">
                                <li><strong>Account Information:</strong> Email address, name (if provided), and password</li>
                                <li><strong>Study Materials:</strong> Documents, PDFs, and other files you upload for processing</li>
                                <li><strong>Payment Information:</strong> Billing details processed securely through Stripe</li>
                                <li><strong>Communications:</strong> Messages you send to our support team</li>
                                <li><strong>Feedback:</strong> Suggestions and bug reports you submit</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-[#1A1D2E] mt-6 mb-3">2.2 Automatically Collected Information</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Usage Data:</strong> Pages visited, features used, and interaction patterns</li>
                                <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
                                <li><strong>Log Data:</strong> IP address, access times, and referring URLs</li>
                                <li><strong>Cookies:</strong> See our Cookie Policy for details</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">3. How We Use Your Information</h2>
                            <p className="mb-4">We use collected information to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide, maintain, and improve our Services</li>
                                <li>Process your study materials using AI to generate flashcards and quizzes</li>
                                <li>Process transactions and manage your subscription</li>
                                <li>Send service-related communications and updates</li>
                                <li>Respond to your inquiries and support requests</li>
                                <li>Analyze usage patterns to enhance user experience</li>
                                <li>Detect and prevent fraud or security issues</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">4. AI Data Processing</h2>
                            <p className="mb-4">
                                Your uploaded study materials are processed by AI models to generate study aids.
                                Important points about our AI processing:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Your private uploads are NOT used to train public AI models</li>
                                <li>Data is processed solely to fulfill your generation requests</li>
                                <li>We use industry-leading AI providers with strict data handling policies</li>
                                <li>Processed content is stored securely and associated with your account</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">5. Sharing of Information</h2>
                            <p className="mb-4">
                                We do not sell your personal data. We may share information with:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Service Providers:</strong> Third-party vendors who help operate our Services
                                    (cloud hosting, AI providers, payment processors). These providers are bound by
                                    confidentiality agreements.</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights
                                    and the safety of others.</li>
                                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or
                                    sale of assets.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">6. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational measures to protect your personal
                                data, including encryption in transit and at rest, regular security assessments, and
                                access controls. However, no method of transmission over the Internet is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">7. Data Retention</h2>
                            <p>
                                We retain your personal data only as long as necessary for the purposes outlined in this
                                policy. You can delete your uploaded materials or your entire account at any time through
                                your account settings. Upon account deletion, we will remove your personal data within 30 days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">8. Your Rights</h2>
                            <p className="mb-4">Depending on your location, you may have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Access the personal data we hold about you</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Object to or restrict certain processing</li>
                                <li>Data portability</li>
                                <li>Withdraw consent where processing is based on consent</li>
                            </ul>
                            <p className="mt-4">
                                To exercise these rights, contact us at{' '}
                                <a href="mailto:privacy@sappio.ai" className="text-[#5A5FF0] hover:underline">
                                    privacy@sappio.ai
                                </a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">9. International Transfers</h2>
                            <p>
                                Your information may be transferred to and processed in countries other than your own.
                                We ensure appropriate safeguards are in place to protect your data in accordance with
                                this Privacy Policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">10. Children&apos;s Privacy</h2>
                            <p>
                                Our Services are not directed to children under 13. We do not knowingly collect personal
                                information from children under 13. If you believe we have collected such information,
                                please contact us immediately.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">11. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any material
                                changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
                                Your continued use of the Services after changes constitutes acceptance of the updated policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">12. Contact Us</h2>
                            <p>
                                If you have questions about this Privacy Policy, please contact us at{' '}
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

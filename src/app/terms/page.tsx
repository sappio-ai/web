import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Terms of Service | Sappio',
    description: 'Terms and conditions for using Sappio AI study companion.',
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFB] py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12">
                    <div className="mb-8">
                        <Link href="/" className="text-[#5A5FF0] hover:underline text-sm font-medium">
                            ← Back to Home
                        </Link>
                    </div>

                    <h1 className="text-4xl font-bold text-[#1A1D2E] mb-2">Terms of Service</h1>
                    <p className="text-gray-500 mb-10 text-sm">Last updated: January 10, 2026</p>

                    <div className="space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">1. Acceptance of Terms</h2>
                            <p className="mb-4">
                                Welcome to Sappio. By accessing or using our website, mobile application, and services
                                (collectively, the &quot;Services&quot;), you agree to be bound by these Terms of Service.
                                If you do not agree to these Terms, please do not use our Services.
                            </p>
                            <p>
                                We reserve the right to modify these Terms at any time. Continued use of the Services
                                after any modifications constitutes your acceptance of the revised Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">2. Description of Service</h2>
                            <p className="mb-4">
                                Sappio is an AI-powered study companion that helps students learn more effectively.
                                Our Services include:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Uploading study materials (PDFs, slide decks, documents)</li>
                                <li>AI-generated flashcards, quizzes, and mind maps</li>
                                <li>Spaced repetition learning systems</li>
                                <li>Study session tracking and analytics</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">3. User Accounts</h2>
                            <p className="mb-4">
                                To access certain features, you must create an account. You agree to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide accurate and complete registration information</li>
                                <li>Maintain the security of your account credentials</li>
                                <li>Accept responsibility for all activities under your account</li>
                                <li>Notify us immediately of any unauthorized use</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">4. User Content</h2>
                            <p className="mb-4">
                                You retain ownership of all content you upload to Sappio (&quot;User Content&quot;).
                                By uploading content, you grant us a worldwide, non-exclusive, royalty-free license
                                to use, process, and display your content solely to provide and improve our Services.
                            </p>
                            <p>
                                You represent that you have all necessary rights to upload the content and that it
                                does not infringe any third-party rights, including intellectual property rights.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">5. AI-Generated Content</h2>
                            <p className="mb-4">
                                Our Services utilize artificial intelligence to generate study materials. You acknowledge that:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>AI-generated content may contain errors or inaccuracies</li>
                                <li>Generated content should be verified against authoritative sources</li>
                                <li>Sappio is a study aid and not a replacement for professional instruction</li>
                                <li>We are not liable for any errors in AI-generated content</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">6. Subscription and Payments</h2>
                            <p className="mb-4">
                                Certain features require a paid subscription. Payment terms include:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Billing:</strong> Subscriptions are billed in advance on a recurring basis</li>
                                <li><strong>Cancellation:</strong> You may cancel at any time; access continues until the end of the billing period</li>
                                <li><strong>Refunds:</strong> Handled on a case-by-case basis; contact support for requests</li>
                                <li><strong>Price Changes:</strong> We will notify you of any price changes in advance</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">7. Acceptable Use</h2>
                            <p className="mb-4">You agree not to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Upload content that is illegal, harmful, or infringes on others&apos; rights</li>
                                <li>Use the Services for any unlawful purpose</li>
                                <li>Attempt to reverse engineer or disrupt our Services</li>
                                <li>Share account credentials with others</li>
                                <li>Use automated systems to access the Services without permission</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">8. Termination</h2>
                            <p>
                                We may suspend or terminate your account at our discretion for violations of these Terms
                                or for any other reason. Upon termination, your right to use the Services ceases immediately.
                                You may also delete your account at any time through your account settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">9. Disclaimer of Warranties</h2>
                            <p className="uppercase text-sm">
                                The Services are provided &quot;as is&quot; and &quot;as available&quot; without warranties
                                of any kind, either express or implied, including but not limited to merchantability,
                                fitness for a particular purpose, and non-infringement.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">10. Limitation of Liability</h2>
                            <p className="uppercase text-sm">
                                In no event shall Sappio be liable for any indirect, incidental, special, consequential,
                                or punitive damages arising out of or relating to your use of the Services, regardless
                                of the cause of action.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">11. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of the
                                jurisdiction in which Sappio operates, without regard to conflict of law principles.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#1A1D2E] mb-4">12. Contact Information</h2>
                            <p>
                                For questions about these Terms, please contact us at{' '}
                                <a href="mailto:legal@sappio.ai" className="text-[#5A5FF0] hover:underline">
                                    legal@sappio.ai
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

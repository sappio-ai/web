import * as React from 'react'

interface WaitlistConfirmationEmailProps {
    email: string
    referralCode: string
}

export const WaitlistConfirmationEmail = ({ email, referralCode }: WaitlistConfirmationEmailProps) => (
    <html>
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style={{
            margin: 0,
            padding: 0,
            backgroundColor: '#f9fafb',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f9fafb', padding: '40px 20px' }}>
                <tr>
                    <td align="center">
                        <table width="600" cellPadding="0" cellSpacing="0" style={{ maxWidth: '600px' }}>
                            {/* Header */}
                            <tr>
                                <td style={{ padding: '0 0 32px 0' }}>
                                    <h1 style={{
                                        margin: 0,
                                        fontSize: '22px',
                                        fontWeight: 600,
                                        color: '#111827',
                                        letterSpacing: '-0.01em'
                                    }}>
                                        Sappio
                                    </h1>
                                </td>
                            </tr>

                            {/* Main Content Card */}
                            <tr>
                                <td>
                                    <table width="100%" cellPadding="0" cellSpacing="0" style={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        <tr>
                                            <td style={{ padding: '40px 32px' }}>
                                                <p style={{
                                                    margin: '0 0 8px 0',
                                                    fontSize: '16px',
                                                    lineHeight: '1.5',
                                                    color: '#111827'
                                                }}>
                                                    You're on the list!
                                                </p>
                                                <p style={{
                                                    margin: '0 0 24px 0',
                                                    fontSize: '16px',
                                                    lineHeight: '1.6',
                                                    color: '#374151'
                                                }}>
                                                    We've reserved your spot. We're rolling out access gradually to ensure the best experience for everyone.
                                                </p>

                                                <p style={{
                                                    margin: '0 0 24px 0',
                                                    fontSize: '16px',
                                                    lineHeight: '1.6',
                                                    color: '#374151'
                                                }}>
                                                    Want to skip the line? Share your unique referral link to bump your spot up.
                                                </p>

                                                {/* Referral Code Box */}
                                                <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '24px' }}>
                                                    <tr>
                                                        <td style={{
                                                            padding: '24px',
                                                            backgroundColor: '#f9fafb',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '6px',
                                                            textAlign: 'center'
                                                        }}>
                                                            <p style={{
                                                                margin: '0 0 12px 0',
                                                                fontSize: '13px',
                                                                fontWeight: 500,
                                                                color: '#6b7280',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px'
                                                            }}>
                                                                Your Referral Link
                                                            </p>
                                                            <code style={{
                                                                display: 'block',
                                                                fontSize: '16px',
                                                                fontWeight: 500,
                                                                color: '#111827',
                                                                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                                                                padding: '8px 16px',
                                                                backgroundColor: '#ffffff',
                                                                border: '1px solid #e5e7eb',
                                                                borderRadius: '4px',
                                                                wordBreak: 'break-all'
                                                            }}>
                                                                {`${process.env.NEXT_PUBLIC_APP_URL}/waitlist?ref=${referralCode}`}
                                                            </code>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '14px',
                                                    lineHeight: '1.5',
                                                    color: '#6b7280',
                                                    textAlign: 'center'
                                                }}>
                                                    We'll email you at {email} when your account is ready.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            {/* Footer */}
                            <tr>
                                <td style={{ padding: '32px 0 0 0' }}>
                                    <p style={{
                                        margin: '0 0 4px 0',
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        lineHeight: '1.5'
                                    }}>
                                        Sappio Team
                                    </p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        color: '#9ca3af'
                                    }}>
                                        Questions? Reply to this email
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>
)

export default WaitlistConfirmationEmail

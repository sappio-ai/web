import * as React from 'react'

interface InviteEmailProps {
  email: string
  inviteCode: string
}

export const InviteEmail = ({ email, inviteCode }: InviteEmailProps) => (
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
                          Hi,
                        </p>
                        <p style={{
                          margin: '0 0 24px 0',
                          fontSize: '16px',
                          lineHeight: '1.6',
                          color: '#374151'
                        }}>
                          Your access to Sappio is ready. Use the code below to create your account and get started.
                        </p>

                        {/* Invite Code Box */}
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
                                Access Code
                              </p>
                              <code style={{
                                display: 'inline-block',
                                fontSize: '24px',
                                fontWeight: 600,
                                color: '#111827',
                                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                                letterSpacing: '2px',
                                padding: '8px 16px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '4px'
                              }}>
                                {inviteCode}
                              </code>
                            </td>
                          </tr>
                        </table>

                        {/* CTA Link */}
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '20px' }}>
                          <tr>
                            <td align="center">
                              <a href={`${process.env.NEXT_PUBLIC_APP_URL}/signup?invite=${inviteCode}`} style={{
                                display: 'inline-block',
                                padding: '12px 24px',
                                backgroundColor: '#111827',
                                color: '#ffffff',
                                fontSize: '15px',
                                fontWeight: 500,
                                textDecoration: 'none',
                                borderRadius: '6px'
                              }}>
                                Create Account
                              </a>
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
                          This code is for {email}
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

export default InviteEmail

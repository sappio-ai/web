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
      backgroundColor: '#F6F7FB',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#F6F7FB', padding: '40px 20px' }}>
        <tr>
          <td align="center">
            <table width="600" cellPadding="0" cellSpacing="0" style={{ maxWidth: '600px' }}>
              {/* Header */}
              <tr>
                <td style={{ padding: '0 0 32px 0' }}>
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                      <td>
                        <h1 style={{
                          margin: 0,
                          fontSize: '24px',
                          fontWeight: 700,
                          color: '#0B1220',
                          letterSpacing: '-0.01em'
                        }}>
                          Sappio
                        </h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              {/* Main Content Card */}
              <tr>
                <td>
                  <table width="100%" cellPadding="0" cellSpacing="0" style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(11, 18, 32, 0.08)'
                  }}>
                    <tr>
                      <td style={{ padding: '48px 40px' }}>
                        {/* Welcome Badge */}
                        <div style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          backgroundColor: '#5B6CFF',
                          borderRadius: '6px',
                          marginBottom: '24px'
                        }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#FFFFFF',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Early Access
                          </span>
                        </div>

                        {/* Heading */}
                        <h2 style={{
                          margin: '0 0 16px 0',
                          fontSize: '32px',
                          fontWeight: 700,
                          color: '#0B1220',
                          lineHeight: '1.2',
                          letterSpacing: '-0.01em'
                        }}>
                          You&apos;re invited! 🎉
                        </h2>

                        {/* Intro Text */}
                        <p style={{
                          margin: '0 0 32px 0',
                          fontSize: '16px',
                          lineHeight: '1.6',
                          color: '#334155'
                        }}>
                          Thanks for joining our waitlist! We&apos;re excited to give you early access to Sappio, your AI-powered study companion.
                        </p>

                        {/* Benefits Section */}
                        <div style={{
                          backgroundColor: '#F6F7FB',
                          borderRadius: '8px',
                          padding: '24px',
                          marginBottom: '32px'
                        }}>
                          <h3 style={{
                            margin: '0 0 16px 0',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#0B1220'
                          }}>
                            Your exclusive benefits:
                          </h3>

                          {/* Benefit 1 */}
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{
                              display: 'inline-block',
                              width: '24px',
                              height: '24px',
                              backgroundColor: '#22C55E',
                              borderRadius: '50%',
                              marginRight: '12px',
                              verticalAlign: 'middle'
                            }}>
                              <span style={{
                                display: 'block',
                                color: '#FFFFFF',
                                fontSize: '16px',
                                fontWeight: 700,
                                textAlign: 'center',
                                lineHeight: '24px'
                              }}>✓</span>
                            </div>
                            <span style={{
                              fontSize: '15px',
                              color: '#334155',
                              verticalAlign: 'middle'
                            }}>
                              <strong style={{ color: '#0B1220' }}>Founding Price Lock:</strong> Lock in today&apos;s prices for 12 months
                            </span>
                          </div>

                          {/* Benefit 2 */}
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{
                              display: 'inline-block',
                              width: '24px',
                              height: '24px',
                              backgroundColor: '#22C55E',
                              borderRadius: '50%',
                              marginRight: '12px',
                              verticalAlign: 'middle'
                            }}>
                              <span style={{
                                display: 'block',
                                color: '#FFFFFF',
                                fontSize: '16px',
                                fontWeight: 700,
                                textAlign: 'center',
                                lineHeight: '24px'
                              }}>✓</span>
                            </div>
                            <span style={{
                              fontSize: '15px',
                              color: '#334155',
                              verticalAlign: 'middle'
                            }}>
                              <strong style={{ color: '#0B1220' }}>7-Day Pro Trial:</strong> Full access to Student Pro features
                            </span>
                          </div>

                          {/* Benefit 3 */}
                          <div>
                            <div style={{
                              display: 'inline-block',
                              width: '24px',
                              height: '24px',
                              backgroundColor: '#22C55E',
                              borderRadius: '50%',
                              marginRight: '12px',
                              verticalAlign: 'middle'
                            }}>
                              <span style={{
                                display: 'block',
                                color: '#FFFFFF',
                                fontSize: '16px',
                                fontWeight: 700,
                                textAlign: 'center',
                                lineHeight: '24px'
                              }}>✓</span>
                            </div>
                            <span style={{
                              fontSize: '15px',
                              color: '#334155',
                              verticalAlign: 'middle'
                            }}>
                              <strong style={{ color: '#0B1220' }}>Priority Support:</strong> Get help from our team when you need it
                            </span>
                          </div>
                        </div>

                        {/* Invite Code Display */}
                        <div style={{
                          backgroundColor: '#F0F4FF',
                          border: '2px dashed #5B6CFF',
                          borderRadius: '8px',
                          padding: '20px',
                          marginBottom: '24px',
                          textAlign: 'center'
                        }}>
                          <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Your Invite Code
                          </p>
                          <div style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0'
                          }}>
                            <code style={{
                              fontSize: '24px',
                              fontWeight: 700,
                              color: '#5B6CFF',
                              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                              letterSpacing: '2px'
                            }}>
                              {inviteCode}
                            </code>
                          </div>
                          <p style={{
                            margin: '12px 0 0 0',
                            fontSize: '13px',
                            color: '#64748B'
                          }}>
                            Click the button below or enter this code at signup
                          </p>
                        </div>

                        {/* CTA Button */}
                        <table width="100%" cellPadding="0" cellSpacing="0">
                          <tr>
                            <td align="center" style={{ paddingBottom: '24px' }}>
                              <a href={`${process.env.NEXT_PUBLIC_APP_URL}/signup?invite=${inviteCode}`} style={{
                                display: 'inline-block',
                                padding: '16px 32px',
                                backgroundColor: '#5B6CFF',
                                color: '#FFFFFF',
                                fontSize: '16px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(91, 108, 255, 0.3)'
                              }}>
                                Create Your Account →
                              </a>
                            </td>
                          </tr>
                        </table>

                        {/* Footer Note */}
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          lineHeight: '1.6',
                          color: '#64748B',
                          textAlign: 'center'
                        }}>
                          Your benefits will be automatically applied when you sign up with <strong>{email}</strong>
                        </p>
                        
                        {/* Security Note */}
                        <div style={{
                          marginTop: '24px',
                          padding: '16px',
                          backgroundColor: '#FEF3C7',
                          borderRadius: '6px',
                          border: '1px solid #FDE68A'
                        }}>
                          <p style={{
                            margin: 0,
                            fontSize: '13px',
                            color: '#92400E',
                            lineHeight: '1.5'
                          }}>
                            <strong>⚠️ Important:</strong> This invite code is single-use and can only be used once. Don&apos;t share it with others.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              {/* Footer */}
              <tr>
                <td style={{ padding: '32px 0 0 0' }}>
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                      <td align="center">
                        <p style={{
                          margin: '0 0 8px 0',
                          fontSize: '14px',
                          color: '#64748B'
                        }}>
                          Sappio - AI-Powered Study Companion
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '12px',
                          color: '#94A3B8'
                        }}>
                          You received this email because you joined our waitlist.
                        </p>
                      </td>
                    </tr>
                  </table>
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

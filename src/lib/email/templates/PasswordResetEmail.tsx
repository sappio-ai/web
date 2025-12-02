import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface PasswordResetEmailProps {
  resetLink: string
  appUrl: string
}

export default function PasswordResetEmail({ resetLink, appUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Sappio password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={orbSection}>
            <Img
              src={`${appUrl}/orb/neutral.png`}
              width="120"
              height="120"
              alt="Sappio Orb"
              style={orbImage}
            />
          </Section>
          
          <Heading style={h1}>Reset Your Password</Heading>
          
          <Text style={text}>
            We received a request to reset your password. Click the button below to create a new password.
          </Text>
          
          <Section style={buttonSection}>
            <Link href={resetLink} style={button}>
              Reset Password
            </Link>
          </Section>
          
          <Text style={text}>
            This link will expire in <strong>1 hour</strong> for security reasons.
          </Text>
          
          <Section style={warningBox}>
            <Text style={warningText}>
              <strong>Security Notice:</strong> If you didn&apos;t request this password reset, you can safely ignore this email. Your password will remain unchanged.
            </Text>
          </Section>
          
          <Text style={footer}>
            If the button doesn&apos;t work, copy and paste this link into your browser:
          </Text>
          <Text style={linkText}>
            {resetLink}
          </Text>
          
          <Text style={footer}>
            — The Sappio Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#1a1a1a',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
}

const orbSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const orbImage = {
  margin: '0 auto',
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const text = {
  color: '#e5e5e5',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#6366f1',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const warningBox = {
  backgroundColor: '#2a2a2a',
  borderLeft: '4px solid #f59e0b',
  padding: '16px',
  margin: '24px 0',
  borderRadius: '4px',
}

const warningText = {
  color: '#fbbf24',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}

const footer = {
  color: '#a3a3a3',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0 0',
}

const linkText = {
  color: '#6366f1',
  fontSize: '12px',
  wordBreak: 'break-all' as const,
  margin: '8px 0 16px',
}

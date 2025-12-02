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

interface WelcomeEmailProps {
  name?: string
  dashboardUrl: string
}

export default function WelcomeEmail({ name, dashboardUrl }: WelcomeEmailProps) {
  const greeting = name ? `Hi ${name}` : 'Hi there'

  return (
    <Html>
      <Head />
      <Preview>Welcome to Sappio - Your AI study companion</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={orbSection}>
            <Img
              src={`${dashboardUrl}/orb/welcome-wave.png`}
              width="120"
              height="120"
              alt="Sappio Orb welcoming you"
              style={orbImage}
            />
          </Section>
          
          <Heading style={h1}>Welcome to Sappio!</Heading>
          
          <Text style={text}>
            {greeting},
          </Text>
          
          <Text style={text}>
            We&apos;re excited to have you on board! Sappio is your AI-powered study companion that transforms your materials into smart notes, flashcards, quizzes, and mind maps.
          </Text>
          
          <Text style={text}>
            Ready to get started? Upload your first study material and watch the magic happen.
          </Text>
          
          <Section style={buttonSection}>
            <Link href={dashboardUrl} style={button}>
              Go to Dashboard
            </Link>
          </Section>
          
          <Text style={footer}>
            If you have any questions, just reply to this email. We&apos;re here to help!
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

const footer = {
  color: '#a3a3a3',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0 0',
}

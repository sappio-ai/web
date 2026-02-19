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

interface PackReadyEmailProps {
  name?: string
  packTitle: string
  packUrl: string
  dashboardUrl: string
}

export default function PackReadyEmail({ name, packTitle, packUrl, dashboardUrl }: PackReadyEmailProps) {
  const greeting = name ? `Hi ${name}` : 'Hi there'

  return (
    <Html>
      <Head />
      <Preview>Your study pack &quot;{packTitle}&quot; is ready!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={orbSection}>
            <Img
              src={`${dashboardUrl}/orb/flashcard-holding.png`}
              width="100"
              height="100"
              alt="Sappio Orb"
              style={orbImage}
            />
          </Section>

          <Heading style={h1}>Your Pack is Ready!</Heading>

          <Text style={text}>
            {greeting},
          </Text>

          <Text style={text}>
            Your study pack <strong>&quot;{packTitle}&quot;</strong> has been generated and is ready to use.
            It includes flashcards, quizzes, mind maps, and more.
          </Text>

          <Text style={text}>
            Jump in and start studying — your first flashcard review only takes a few minutes.
          </Text>

          <Section style={buttonSection}>
            <Link href={packUrl} style={button}>
              Open Study Pack
            </Link>
          </Section>

          <Text style={footer}>
            You can manage your email preferences in your account settings.
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
  backgroundColor: '#F8FAFB',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '12px',
  maxWidth: '600px',
  border: '1px solid #E2E8F0',
}

const orbSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const orbImage = {
  margin: '0 auto',
}

const h1 = {
  color: '#1A1D2E',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#5A5FF0',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const footer = {
  color: '#94A3B8',
  fontSize: '13px',
  lineHeight: '22px',
  margin: '16px 0 0',
}

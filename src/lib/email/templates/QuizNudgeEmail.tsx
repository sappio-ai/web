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

interface QuizNudgeEmailProps {
  name?: string
  dashboardUrl: string
  unsubscribeUrl?: string
}

export default function QuizNudgeEmail({ name, dashboardUrl, unsubscribeUrl }: QuizNudgeEmailProps) {
  const greeting = name ? `Hi ${name}` : 'Hi there'

  return (
    <Html>
      <Head />
      <Preview>Have you tried the quiz feature?</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={orbSection}>
            <Img
              src={`${dashboardUrl}/orb/neutral.png`}
              width="100"
              height="100"
              alt="Sappio Orb"
              style={orbImage}
            />
          </Section>

          <Heading style={h1}>Test Your Knowledge</Heading>

          <Text style={text}>
            {greeting},
          </Text>

          <Text style={text}>
            Quizzes are one of the best ways to find your weak spots. Sappio generates quizzes from your study packs with shuffled questions, so you can&apos;t rely on memorizing the order.
          </Text>

          <Text style={text}>
            After each quiz, you&apos;ll get a topic-by-topic breakdown showing exactly where you&apos;re strong and where you need more practice. It&apos;s the fastest way to know what to focus on next.
          </Text>

          <Section style={buttonSection}>
            <Link href={dashboardUrl} style={button}>
              Take a Quiz
            </Link>
          </Section>

          <Text style={footer}>
            — The Sappio Team
          </Text>

          {unsubscribeUrl && (
            <Text style={unsubscribeFooter}>
              <Link href={unsubscribeUrl} style={unsubscribeLink}>Unsubscribe</Link> from onboarding emails
            </Text>
          )}
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

const unsubscribeFooter = {
  color: '#CBD5E1',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}

const unsubscribeLink = {
  color: '#CBD5E1',
  textDecoration: 'underline',
}

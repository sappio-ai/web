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

interface SRSEducationEmailProps {
  name?: string
  dashboardUrl: string
  unsubscribeUrl?: string
}

export default function SRSEducationEmail({ name, dashboardUrl, unsubscribeUrl }: SRSEducationEmailProps) {
  const greeting = name ? `Hi ${name}` : 'Hi there'

  return (
    <Html>
      <Head />
      <Preview>The science behind your study packs</Preview>
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

          <Heading style={h1}>How Sappio Makes You Remember</Heading>

          <Text style={text}>
            {greeting},
          </Text>

          <Text style={text}>
            Sappio uses a technique called <strong>spaced repetition</strong> — a scientifically proven method that schedules your reviews at the optimal time. Instead of cramming everything at once, you review cards just before you&apos;re about to forget them. This turns short-term memory into long-term knowledge.
          </Text>

          <Text style={text}>
            Each time you review a card, you&apos;ll see four grade buttons. Choosing the right grade tells Sappio how well you know that card, so it can schedule your next review perfectly. Cards you find easy will appear less often, while tricky ones come back sooner.
          </Text>

          <Text style={text}>
            The key is consistency. Even a few minutes of daily review is far more effective than hours of last-minute studying. Let the algorithm do the heavy lifting — just show up and review.
          </Text>

          <Section style={buttonSection}>
            <Link href={dashboardUrl} style={button}>
              Start Reviewing
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

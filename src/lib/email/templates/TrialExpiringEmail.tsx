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

interface TrialExpiringEmailProps {
  name?: string
  daysLeft: number
  dashboardUrl: string
  unsubscribeUrl?: string
}

export default function TrialExpiringEmail({ name, daysLeft, dashboardUrl, unsubscribeUrl }: TrialExpiringEmailProps) {
  const greeting = name ? `Hi ${name}` : 'Hi there'

  return (
    <Html>
      <Head />
      <Preview>Your Student Pro trial ends soon</Preview>
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

          <Heading style={h1}>Your Trial Ends in {daysLeft} Day{daysLeft !== 1 ? 's' : ''}</Heading>

          <Text style={text}>
            {greeting},
          </Text>

          <Text style={text}>
            Your Student Pro trial is ending soon. When it expires, you&apos;ll lose access to:
          </Text>

          <Text style={text}>
            - <strong>120 cards per pack</strong> (free plan: 35)<br />
            - <strong>PDF and CSV exports</strong><br />
            - <strong>Timed quizzes</strong><br />
            - <strong>Priority processing</strong> for pack generation
          </Text>

          <Text style={text}>
            Upgrade now to keep all your Pro features without interruption.
          </Text>

          <Section style={buttonSection}>
            <Link href={`${dashboardUrl}/settings`} style={button}>
              Upgrade Now
            </Link>
          </Section>

          <Text style={footer}>
            — The Sappio Team
          </Text>

          {unsubscribeUrl && (
            <Text style={unsubscribeFooter}>
              <Link href={unsubscribeUrl} style={unsubscribeLink}>Unsubscribe</Link> from trial notifications
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

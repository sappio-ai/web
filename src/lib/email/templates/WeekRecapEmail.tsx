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

interface WeekRecapEmailProps {
  name?: string
  cardsReviewed: number
  packsCreated: number
  streakDays: number
  dashboardUrl: string
  unsubscribeUrl?: string
}

export default function WeekRecapEmail({ name, cardsReviewed, packsCreated, streakDays, dashboardUrl, unsubscribeUrl }: WeekRecapEmailProps) {
  const greeting = name ? `Hi ${name}` : 'Hi there'

  return (
    <Html>
      <Head />
      <Preview>Your first week on Sappio</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={orbSection}>
            <Img
              src={`${dashboardUrl}/orb/streak-orb.png`}
              width="100"
              height="100"
              alt="Sappio Orb"
              style={orbImage}
            />
          </Section>

          <Heading style={h1}>Your First Week Recap</Heading>

          <Text style={text}>
            {greeting},
          </Text>

          <Text style={text}>
            Congratulations on your first week with Sappio! Here&apos;s how you did:
          </Text>

          <Text style={text}>
            <strong>{cardsReviewed}</strong> card{cardsReviewed !== 1 ? 's' : ''} reviewed<br />
            <strong>{packsCreated}</strong> study pack{packsCreated !== 1 ? 's' : ''} created<br />
            <strong>{streakDays}</strong>-day streak
          </Text>

          <Text style={text}>
            You&apos;re building great study habits. Keep the momentum going — the more consistently you review, the more you&apos;ll retain long-term.
          </Text>

          <Section style={buttonSection}>
            <Link href={dashboardUrl} style={button}>
              Keep Learning
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

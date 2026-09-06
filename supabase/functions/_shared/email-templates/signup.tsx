/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Conferma la tua email per FlashMatch</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Conferma la tua email</Heading>
        <Text style={text}>
          Grazie per esserti registrato a{' '}
          <Link href={siteUrl} style={link}>
            <strong>FlashMatch</strong>
          </Link>
          !
        </Text>
        <Text style={text}>
          Conferma il tuo indirizzo email (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) cliccando il pulsante qui sotto:
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Conferma email
        </Button>
        <Text style={footer}>
          Se non hai creato un account, puoi ignorare questa email in tutta
          sicurezza.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Karla, Arial, sans-serif',
}
const container = { padding: '20px 25px' }
const h1 = {
  fontFamily: 'Georgia, serif',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#1a1a1a',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const link = { color: 'inherit', textDecoration: 'underline' }
const button = {
  backgroundColor: '#e85d3a',
  color: '#ffffff',
  fontSize: '14px',
  border: '1px solid #e85d3a',
  borderRadius: '2px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { background-color: #e85d3a !important; color: #ffffff !important; }
  }
  [data-ogsc] .dm-btn { background-color: #e85d3a !important; color: #ffffff !important; }
  [data-ogsb] .dm-btn { background-color: #e85d3a !important; color: #ffffff !important; }
`

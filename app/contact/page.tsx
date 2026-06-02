import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: "SukaMCD | Contact",
  description: "Reach out to SukaMCD for project inquiries, collaborations, and support.",
  openGraph: {
    title: "SukaMCD | Contact",
    description: "Reach out to SukaMCD for project inquiries, collaborations, and support.",
    type: "website",
    url: "https://sukamcd.dev/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: "SukaMCD | Contact",
    description: "Reach out to SukaMCD for project inquiries, collaborations, and support.",
  },
}

export default function ContactPage() {
  return <ContactClient />
}

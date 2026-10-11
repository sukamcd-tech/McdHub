import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "SukaMCD | Pricing",
  description: "Explore SukaMCD pricing packages for websites, apps, and enterprise systems.",
  openGraph: {
    title: "SukaMCD | Pricing",
    description: "Explore SukaMCD pricing packages for websites, apps, and enterprise systems.",
    type: "website",
    url: "https://sukamcd.dev/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "SukaMCD | Pricing",
    description: "Explore SukaMCD pricing packages for websites, apps, and enterprise systems.",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}

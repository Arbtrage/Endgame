"use client";

import { HeroSection } from "@/features/marketing/components/landing/hero-section";
import { FeaturesSection } from "@/features/marketing/components/landing/features-section";
import { HowItWorksSection } from "@/features/marketing/components/landing/how-it-works-section";
import { SocialProofSection } from "@/features/marketing/components/landing/social-proof-section";
import { LandingFooter } from "@/features/marketing/components/landing/landing-footer";
import { MarketingShell } from "@/shared/components/marketing-shell";

export function LandingPageContent() {
  return (
    <MarketingShell overlay>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <LandingFooter />
    </MarketingShell>
  );
}

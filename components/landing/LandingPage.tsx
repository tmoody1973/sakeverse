"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Mic, Sparkles, BookOpen, MapPin, Wine, ChefHat } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="container-retro py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-ink mb-6">
            Discover Sake with Your
            <span className="text-plum-dark"> AI Sommelier</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Meet Kiki (利き酒) — your personal sake guide. Get recommendations based on your wine preferences, food pairings, and taste profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link href="/sign-up">
                Get Started Free
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/kiki">
                <Mic className="w-5 h-5 mr-2" />
                Try Voice Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-sakura-light py-16">
        <div className="container-retro">
          <h2 className="text-3xl font-display font-bold text-center text-ink mb-12">
            Why Sakéverse?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Mic className="w-8 h-8" />}
              title="Voice-First Experience"
              description="Talk to Kiki naturally. Ask questions, get recommendations, and learn about sake through conversation."
            />
            <FeatureCard
              icon={<Wine className="w-8 h-8" />}
              title="Wine-to-Sake Bridge"
              description="Love Pinot Noir? We'll find sake that matches your wine preferences. No Japanese knowledge required."
            />
            <FeatureCard
              icon={<ChefHat className="w-8 h-8" />}
              title="Perfect Pairings"
              description="From sushi to BBQ, discover which sake complements your favorite foods."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container-retro">
          <h2 className="text-3xl font-display font-bold text-center text-ink mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              number="1"
              title="Tell Us Your Taste"
              description="Quick onboarding to understand your preferences — wine background, flavor profile, experience level."
            />
            <StepCard
              number="2"
              title="Chat with Kiki"
              description="Ask anything about sake. Get personalized recommendations based on your unique profile."
            />
            <StepCard
              number="3"
              title="Explore & Learn"
              description="Save favorites, track your journey, and become a sake expert at your own pace."
            />
          </div>
        </div>
      </section>

      {/* More Features */}
      <section className="bg-gradient-to-br from-sakura-pink to-petal-light py-16">
        <div className="container-retro">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-ink mb-6">
                Everything You Need to Explore Sake
              </h2>
              <ul className="space-y-4">
                <FeatureListItem icon={<Sparkles className="w-5 h-5" />} text="100+ curated sake from top breweries" />
                <FeatureListItem icon={<MapPin className="w-5 h-5" />} text="Explore Japan's sake regions" />
                <FeatureListItem icon={<BookOpen className="w-5 h-5" />} text="Learn with interactive courses" />
              </ul>
            </div>
            <div className="bg-white border-3 border-ink rounded-2xl shadow-retro-lg p-8 text-center">
              <div className="text-6xl mb-4">🍶</div>
              <p className="text-lg font-medium text-ink">Join 1,000+ sake enthusiasts</p>
              <p className="text-gray-600 mb-6">discovering their perfect pour</p>
              <Button variant="accent" size="lg" asChild>
                <Link href="/sign-up">Start Your Journey</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container-retro text-center">
          <h2 className="text-3xl font-display font-bold text-ink mb-4">
            Ready to Find Your Perfect Sake?
          </h2>
          <p className="text-gray-600 mb-8">Free to start. No credit card required.</p>
          <Button variant="primary" size="lg" asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white border-2 border-ink rounded-xl p-6 shadow-[4px_4px_0px_#2D2D2D]">
      <div className="w-14 h-14 bg-sakura-pink rounded-lg flex items-center justify-center text-ink mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-ink mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-plum-dark text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-bold text-ink mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function FeatureListItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white border-2 border-ink rounded-lg flex items-center justify-center text-plum-dark">
        {icon}
      </div>
      <span className="text-ink font-medium">{text}</span>
    </li>
  )
}

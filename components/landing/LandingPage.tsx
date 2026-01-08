"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Mic, Sparkles, BookOpen, MapPin, Wine, ChefHat, Headphones, Brain, Trophy, Map } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="container-retro py-16 md:py-24">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left: Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink mb-6">
              Discover Sake with Your
              <span className="text-plum-dark"> AI Sommelier</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
              Meet Kiki (利き酒) — your personal sake guide. Get recommendations based on your wine preferences, food pairings, and taste profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
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
            {/* Product Hunt Badge */}
            <div className="flex justify-center lg:justify-start">
              <a 
                href="https://www.producthunt.com/products/sakecosm?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-sakecosm" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <img 
                  alt="Sakécosm - Your personal sake guide, powered by AI | Product Hunt" 
                  width="250" 
                  height="54" 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1059717&theme=light&t=1767875665538"
                />
              </a>
            </div>
          </div>
          
          {/* Right: Kiki Mascot */}
          <div className="flex-shrink-0">
            <img 
              src="/kiki-mascot.png" 
              alt="Kiki the sake cat brewing sake" 
              className="w-64 md:w-80 lg:w-96 h-auto drop-shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="bg-sakura-light py-16">
        <div className="container-retro">
          <h2 className="text-3xl font-display font-bold text-center text-ink mb-12">
            Why Sakécosm?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Mic className="w-8 h-8" />}
              title="Voice-First Experience"
              description="Talk to Kiki naturally. Ask questions, get recommendations, and learn about sake through real-time conversation."
            />
            <FeatureCard
              icon={<Wine className="w-8 h-8" />}
              title="Wine-to-Sake Bridge"
              description="Love Pinot Noir? We'll find sake that matches your wine preferences. No Japanese knowledge required."
            />
            <FeatureCard
              icon={<ChefHat className="w-8 h-8" />}
              title="Perfect Pairings"
              description="From sushi to BBQ, discover which sake complements your favorite foods with AI-powered recommendations."
            />
          </div>
        </div>
      </section>

      {/* Podcast Network - NEW */}
      <section className="py-16 bg-gradient-to-br from-plum-dark to-ink text-white">
        <div className="container-retro">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
              <Headphones className="w-5 h-5" />
              <span className="text-sm font-medium">AI-Generated Podcasts</span>
            </div>
            <h2 className="text-3xl font-display font-bold mb-4">
              The Sakécosm Podcast Network
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Four AI-generated shows with "This American Life" inspired storytelling. 
              Learn sake through engaging conversations between TOJI (the master brewer) and KOJI (the curious explorer).
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PodcastCard
              emoji="📖"
              title="Sake Stories"
              schedule="Mondays"
              description="Brewery histories and regional tales that bring sake to life"
            />
            <PodcastCard
              emoji="🍽️"
              title="Pairing Lab"
              schedule="Wednesdays"
              description="Deep dives into food and sake combinations"
            />
            <PodcastCard
              emoji="🍷"
              title="The Bridge"
              schedule="Fridays"
              description="Wine-to-sake translations for wine lovers"
            />
            <PodcastCard
              emoji="🔬"
              title="Brewing Secrets"
              schedule="1st & 15th"
              description="Technical brewing science made accessible"
            />
          </div>
          
          <div className="text-center mt-8">
            <Button variant="secondary" size="lg" asChild className="bg-white text-ink hover:bg-sakura-light">
              <Link href="/podcasts">
                <Headphones className="w-5 h-5 mr-2" />
                Listen Now
              </Link>
            </Button>
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

      {/* Learning & Gamification */}
      <section className="bg-sakura-light py-16">
        <div className="container-retro">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-matcha/20 px-4 py-2 rounded-full mb-4">
                <Trophy className="w-5 h-5 text-matcha" />
                <span className="text-sm font-medium text-ink">Gamified Learning</span>
              </div>
              <h2 className="text-3xl font-display font-bold text-ink mb-6">
                Level Up Your Sake Knowledge
              </h2>
              <p className="text-gray-600 mb-6">
                Take AI-generated courses, pass quizzes, and earn XP to unlock badges. 
                Progress from "Sake Curious" to "Sake Grandmaster" across 10 levels.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🌱</span>
                  <span className="text-ink">Sake Fundamentals, Brewing, Tasting courses</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <span className="text-ink">Chapter quizzes with instant feedback</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">⭐</span>
                  <span className="text-ink">Earn 25-100 XP per activity</span>
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {['sake-curious', 'sake-novice', 'sake-student', 'sake-enthusist', 'sake-connosieur'].map((badge) => (
                <div key={badge} className="bg-white border-2 border-ink rounded-xl p-2 shadow-retro">
                  <img src={`/badges/${badge}.png`} alt={badge} className="w-full h-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="py-16">
        <div className="container-retro">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-gradient-to-br from-sake-mist to-sakura-light border-3 border-ink rounded-2xl shadow-retro-lg p-8 text-center">
                <Map className="w-16 h-16 mx-auto mb-4 text-plum-dark" />
                <p className="text-4xl font-bold text-ink mb-2">47</p>
                <p className="text-gray-600">Prefectures to Explore</p>
                <p className="text-4xl font-bold text-ink mb-2 mt-4">50+</p>
                <p className="text-gray-600">Breweries with AI Descriptions</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-sake-mist px-4 py-2 rounded-full mb-4">
                <MapPin className="w-5 h-5 text-plum-dark" />
                <span className="text-sm font-medium text-ink">Interactive Map</span>
              </div>
              <h2 className="text-3xl font-display font-bold text-ink mb-6">
                Explore Japan's Sake Regions
              </h2>
              <p className="text-gray-600 mb-6">
                Click any prefecture to discover local breweries, regional styles, and AI-generated descriptions. 
                From Niigata's crisp tanrei karakuchi to Hiroshima's soft, gentle brews.
              </p>
              <Button variant="secondary" asChild>
                <Link href="/map">
                  <MapPin className="w-5 h-5 mr-2" />
                  Open Map
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* More Features */}
      <section className="bg-gradient-to-br from-sakura-pink to-petal-light py-16">
        <div className="container-retro">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-ink mb-6">
                Powered by Multi-Layer AI
              </h2>
              <ul className="space-y-4">
                <FeatureListItem icon={<Brain className="w-5 h-5" />} text="5-layer RAG system for deep knowledge" />
                <FeatureListItem icon={<Sparkles className="w-5 h-5" />} text="104 curated sake from Tippsy" />
                <FeatureListItem icon={<BookOpen className="w-5 h-5" />} text="5 PDF sake books + 68 brewery histories" />
                <FeatureListItem icon={<Wine className="w-5 h-5" />} text="Wine-to-sake translation engine" />
              </ul>
            </div>
            <div className="bg-white border-3 border-ink rounded-2xl shadow-retro-lg p-8 text-center">
              <div className="text-6xl mb-4">🍶</div>
              <p className="text-lg font-medium text-ink">Join sake enthusiasts</p>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/podcasts">
                <Headphones className="w-5 h-5 mr-2" />
                Listen to Podcasts
              </Link>
            </Button>
          </div>
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

function PodcastCard({ emoji, title, schedule, description }: { emoji: string; title: string; schedule: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-5 hover:bg-white/20 transition-colors">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-white/60 text-sm mb-2">{schedule}</p>
      <p className="text-white/80 text-sm">{description}</p>
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

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Trophy,
  Gamepad2,
  MessagesSquare,
  Flame,
  Zap,
  Users,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: Gamepad2,
    title: "Mini games, big wins",
    body: "Memory, sudoku, chess, carrom — bite-sized fun that turns any spare minute into a win.",
  },
  {
    icon: Trophy,
    title: "Live leaderboards",
    body: "Friendly rivalry without the cringe. Watch yourself climb the global ranks in real time as points roll in.",
  },
  {
    icon: MessagesSquare,
    title: "Public rooms",
    body: "Realtime chat by game, topic, or vibe. Drop in, hype other players, share wins, and keep the energy high.",
  },
  {
    icon: Flame,
    title: "Challenges that travel",
    body: "Weekly photo, video, and activity challenges. Submit, vote, and reward the moments that matter.",
  },
  {
    icon: Zap,
    title: "Built for realtime",
    body: "Powered by sockets — every point, vote, and message lands instantly. No refresh, no waiting.",
  },
  {
    icon: Heart,
    title: "Made to be fun",
    body: "Streaks, badges, and gentle nudges keep things playful, not pushy. Play on your own terms.",
  },
];

const testimonials = [
  {
    quote:
      "I hop on for a quick game between tasks and end up chasing the leaderboard all evening.",
    name: "Priya R.",
    role: "Daily player",
  },
  {
    quote:
      "The weekly challenges are my favorite part — voting on everyone's entries is half the fun.",
    name: "Marco D.",
    role: "Challenge regular",
  },
  {
    quote:
      "It's the only ‘fun’ app that doesn't feel forced. I actually look forward to opening it.",
    name: "Hannah K.",
    role: "Chess fan",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    tagline: "For curious players",
    features: ["All mini games", "Global leaderboard", "1 active challenge", "Community support"],
    cta: "Start free",
    href: "/register",
  },
  {
    name: "Pro",
    price: "$4",
    tagline: "Per month",
    features: [
      "Everything in Free",
      "All games + challenges",
      "Create public rooms",
      "Detailed stats",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    href: "/register",
    featured: true,
  },
  {
    name: "Lifetime",
    price: "$49",
    tagline: "One-time, yours forever",
    features: [
      "Everything in Pro",
      "Lifetime access",
      "Early access to new games",
      "Supporter badge",
      "No subscription",
    ],
    cta: "Get lifetime",
    href: "/register",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

export function Landing() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora" />
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/60 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--grad-from)),hsl(var(--grad-via)),hsl(var(--grad-to)))] shadow-lg shadow-primary/30">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <span>Sparkle</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground">Loved by</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild variant="gradient" size="sm">
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
              <Badge variant="gradient" className="mb-5">
                Fun workplace engagement
              </Badge>
            </motion.div>
            <motion.h1
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={1}
              className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
            >
              Your daily dose of{" "}
              <span className="gradient-text">play.</span>
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={2}
              className="mt-5 max-w-xl text-lg text-muted-foreground"
            >
              Sparkle brings mini games, weekly challenges, live leaderboards
              and public chat rooms together in one playful app — built for
              anyone who loves a quick win.
            </motion.p>
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={3}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button asChild variant="gradient" size="lg">
                <Link href="/register">Start free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#features">See features</Link>
              </Button>
            </motion.div>
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={4}
              className="mt-8 flex items-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" /> 50k+ players having fun
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" /> 3.2M points awarded
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="glass animate-float rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This week</p>
                  <p className="text-2xl font-semibold">Global leaderboard</p>
                </div>
                <Badge variant="gradient">Live</Badge>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { name: "Priya R.", points: 2840, you: false },
                  { name: "You", points: 2615, you: true },
                  { name: "Marco D.", points: 2410, you: false },
                  { name: "Hannah K.", points: 2190, you: false },
                ].map((row, i) => (
                  <div
                    key={row.name}
                    className={`flex items-center justify-between rounded-2xl border bg-card/60 px-4 py-3 ${
                      row.you ? "ring-1 ring-primary/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-sm font-semibold">
                        {i + 1}
                      </span>
                      <span className="font-medium">{row.name}</span>
                    </div>
                    <span className="font-mono text-sm tabular-nums">
                      {row.points.toLocaleString()} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:block">
              <div className="glass rounded-2xl p-4 shadow-xl">
                <p className="text-xs text-muted-foreground">🔥 Streak</p>
                <p className="text-2xl font-semibold">12 days</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Everything you need to <span className="gradient-text">actually have fun.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              custom={i}
            >
              <Card glass className="h-full">
                <CardContent className="p-6">
                  <div className="mb-4 inline-grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="testimonials" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Loved by players</Badge>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Fun that doesn&apos;t feel like homework.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
            >
              <Card glass className="h-full">
                <CardContent className="p-6">
                  <p className="text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-5">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Simple plans. <span className="gradient-text">Big smiles.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.name}
              glass
              className={`relative ${p.featured ? "ring-2 ring-primary/60" : ""}`}
            >
              {p.featured && (
                <Badge variant="gradient" className="absolute -top-3 left-6">
                  Most loved
                </Badge>
              )}
              <CardContent className="p-7">
                <p className="text-sm text-muted-foreground">{p.name}</p>
                <p className="mt-2 text-4xl font-semibold">{p.price}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={p.featured ? "gradient" : "outline"}
                  className="mt-7 w-full"
                >
                  <Link href={p.href}>{p.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24">
        <Card glass className="overflow-hidden">
          <div className="relative p-10 md:p-14">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora opacity-70" />
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Ready to play?
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Create your account in under a minute. Free forever to get started.
                </p>
              </div>
              <Button asChild variant="gradient" size="lg">
                <Link href="/register">Start free</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Sparkle. Made with energy.</p>
          <div className="flex gap-5">
            <Link href="/login">Log in</Link>
            <Link href="/register">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

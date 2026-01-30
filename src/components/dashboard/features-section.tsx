"use client";

import { motion } from "framer-motion";
import { Brain, Music, Timer, BarChart3, Zap, Shield, Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Brain,
    title: "Mood Detection",
    description: "AI-powered mood analysis that adapts your environment for optimal focus.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Music,
    title: "Music Integration",
    description: "Curated playlists from lofi to ambient that match your current vibe.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Timer,
    title: "Focus Sessions",
    description: "Pomodoro-style timers with intelligent break recommendations.",
    gradient: "from-cyan-500 to-teal-600",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Visualize your productivity trends and identify peak performance times.",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    icon: Zap,
    title: "AI Integration",
    description: "Connect with your favorite coding assistants for seamless workflow.",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data stays yours. Local processing with optional cloud sync.",
    gradient: "from-blue-500 to-indigo-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function FeaturesSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dots opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Features</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Everything you need to{" "}
            <span className="gradient-text">stay productive</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you achieve deep focus and maintain flow state throughout your workday.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
                variants={itemVariants}
                whileHover={{ y: -4 }}
              >
                {/* Hover gradient background */}
                <motion.div
                  className={cn(
                    "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 bg-gradient-to-br transition-opacity duration-300",
                    feature.gradient
                  )}
                />

                {/* Icon */}
                <motion.div
                  className={cn(
                    "relative w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br",
                    feature.gradient
                  )}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>

                {/* Arrow indicator */}
                <motion.div
                  className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: -10 }}
                  whileHover={{ x: 0 }}
                >
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Globe className="w-5 h-5" />
            <span>Available on all platforms</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

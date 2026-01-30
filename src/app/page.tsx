"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Header,
  HeroSection,
  FeaturesSection,
  MoodSelector,
  FocusTimer,
  MusicRecommendations,
  AnalyticsPreview,
  Footer,
} from "@/components/dashboard";
import { Particles, RisingParticles } from "@/components/ui/particles";
import { useAnalytics } from "@/hooks";

export type MoodId = "focus" | "calm" | "energetic" | "creative";

export default function Home() {
  const [currentMood, setCurrentMood] = useState<MoodId>("focus");
  const { recordSession } = useAnalytics();

  return (
    <main className="min-h-screen bg-background">
      {/* Floating particles background */}
      <Particles quantity={60} className="z-0" />
      <RisingParticles quantity={20} className="z-0" />

      {/* Fixed header */}
      <Header />

      {/* Hero section */}
      <HeroSection />

      {/* Features section */}
      <FeaturesSection />

      {/* Dashboard section */}
      <section className="py-24 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Your Personal{" "}
              <span className="gradient-text">Dashboard</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to stay focused and productive, all in one place.
            </p>
          </motion.div>

          {/* Dashboard grid */}
          <div className="space-y-8">
            {/* Mood selector - full width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <MoodSelector onMoodSelect={(mood) => setCurrentMood(mood.id as MoodId)} />
            </motion.div>

            {/* Two column layout */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Focus Timer */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <FocusTimer mood={currentMood} onSessionComplete={recordSession} />
              </motion.div>

              {/* Music Recommendations */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <MusicRecommendations mood={currentMood} />
              </motion.div>
            </div>

            {/* Analytics - full width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <AnalyticsPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        
        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to boost your{" "}
            <span className="gradient-text">productivity</span>?
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Join thousands of developers who have transformed their workflow with SW Personal.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] text-white shadow-lg shadow-primary/25 hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ 
                backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" },
              }}
            >
              Get Started Free
            </motion.button>
            <motion.button
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl border-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Schedule Demo
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}

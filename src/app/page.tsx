"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Particles, RisingParticles, DemoModal, PricingModal, DemoWalkthroughModal } from "@/components/ui";
import { useAnalytics } from "@/hooks";
import { useFlowStateSync } from "@/hooks/use-flowstate-sync";

export type MoodId = "focus" | "calm" | "energetic" | "creative";

// Get initial mood from URL params (runs before React hydration)
function getInitialMood(): MoodId {
  if (typeof window === "undefined") return "focus";
  const params = new URLSearchParams(window.location.search);
  const moodParam = params.get("mood");
  if (moodParam && ["focus", "calm", "energetic", "creative"].includes(moodParam)) {
    return moodParam as MoodId;
  }
  return "focus";
}

export default function Home() {
  const [currentMood, setCurrentMood] = useState<MoodId>(getInitialMood);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showDemoWalkthrough, setShowDemoWalkthrough] = useState(false);
  const [ideControlled, setIdeControlled] = useState(false);
  const urlParamsProcessed = useRef(false);
  const { recordSession } = useAnalytics();

  // Scroll to section helper
  const scrollToSection = useCallback((target: string) => {
    const sectionIds: Record<string, string> = {
      mood: "mood-selector",
      music: "music",
      timer: "focus",
      analytics: "analytics",
    };
    const elementId = sectionIds[target] || target;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Add a highlight effect
      element.classList.add("ring-2", "ring-primary", "ring-offset-4", "ring-offset-background");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-primary", "ring-offset-4", "ring-offset-background");
      }, 2000);
    }
  }, []);

  // Sync with MCP/IDE
  const { syncState, isConnected, updateState } = useFlowStateSync({
    onMoodChange: (mood) => {
      setCurrentMood(mood);
      setIdeControlled(true);
      // Brief indicator that IDE changed the mood
      setTimeout(() => setIdeControlled(false), 3000);
    },
    onScrollRequest: scrollToSection,
  });

  // Sync mood changes from web UI back to MCP
  const handleMoodSelect = useCallback((mood: { id: string }) => {
    const moodId = mood.id as MoodId;
    setCurrentMood(moodId);
    updateState({ currentMood: moodId });
  }, [updateState]);

  // Handle URL parameters from IDE launch - runs once on mount
  useEffect(() => {
    if (typeof window === "undefined" || urlParamsProcessed.current) return;
    
    const params = new URLSearchParams(window.location.search);
    const fromIDE = params.get("fromIDE");
    const autoConnect = params.get("autoConnect");
    const moodParam = params.get("mood");
    const scrollToParam = params.get("scrollTo");

    if (fromIDE === "true") {
      urlParamsProcessed.current = true;
      setIdeControlled(true);
      
      // Set mood from URL (already set by getInitialMood, but ensure it's synced)
      if (moodParam && ["focus", "calm", "energetic", "creative"].includes(moodParam)) {
        setCurrentMood(moodParam as MoodId);
        // Also update the sync state to match
        fetch("/api/flowstate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentMood: moodParam }),
        }).catch(console.error);
      }

      // Scroll to section
      if (scrollToParam) {
        setTimeout(() => {
          const sectionIds: Record<string, string> = {
            mood: "mood-selector",
            music: "music",
            timer: "focus",
            analytics: "analytics",
          };
          const elementId = sectionIds[scrollToParam] || scrollToParam;
          const element = document.getElementById(elementId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("ring-2", "ring-primary", "ring-offset-4", "ring-offset-background");
            setTimeout(() => {
              element.classList.remove("ring-2", "ring-primary", "ring-offset-4", "ring-offset-background");
            }, 2000);
          }
        }, 500);
      }

      // Auto-connect to YouTube - dispatch custom event for MusicRecommendations
      if (autoConnect === "youtube") {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("flowstate:autoconnect", { 
            detail: { service: "youtube" } 
          }));
        }, 1000);
      }

      // Clean URL after processing
      setTimeout(() => {
        window.history.replaceState({}, "", window.location.pathname);
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update mood from sync state - but NOT if URL params just set it
  useEffect(() => {
    // Skip if we just processed URL params (they take priority)
    if (urlParamsProcessed.current) {
      // Reset the flag after a short delay so future sync updates work
      setTimeout(() => { urlParamsProcessed.current = false; }, 2000);
      return;
    }
    if (syncState?.currentMood && syncState.currentMood !== currentMood) {
      setCurrentMood(syncState.currentMood);
    }
  }, [syncState?.currentMood]);

  return (
    <main className="min-h-screen bg-background">
      {/* Floating particles background */}
      <Particles quantity={60} className="z-0" />
      <RisingParticles quantity={20} className="z-0" />

      {/* Fixed header */}
      <Header />

      {/* Hero section */}
      <HeroSection onWatchDemo={() => setShowDemoWalkthrough(true)} />

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
            {/* IDE Connection indicator */}
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                IDE Connected {ideControlled && <span className="text-primary font-medium">• Controlled by IDE</span>}
              </motion.div>
            )}

            {/* Mood selector - full width */}
            <motion.div
              id="mood-selector"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="transition-all duration-300"
            >
              <MoodSelector onMoodSelect={handleMoodSelect} currentMood={currentMood} />
            </motion.div>

            {/* Music Recommendations - full width */}
            <motion.div
              id="music"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="transition-all duration-300"
            >
              <MusicRecommendations mood={currentMood} />
            </motion.div>

            {/* Focus Timer - below music, centered */}
            <motion.div
              className="max-w-xl mx-auto w-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <FocusTimer mood={currentMood} onSessionComplete={recordSession} />
            </motion.div>

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
            Join thousands of developers who have transformed their workflow with FlowState.
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
              onClick={() => setShowPricingModal(true)}
            >
              Get Started
            </motion.button>
            <motion.button
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl border-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDemoModal(true)}
            >
              Schedule Demo
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Modals */}
      <DemoModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />
      <DemoWalkthroughModal isOpen={showDemoWalkthrough} onClose={() => setShowDemoWalkthrough(false)} />

      {/* Footer */}
      <Footer />
    </main>
  );
}

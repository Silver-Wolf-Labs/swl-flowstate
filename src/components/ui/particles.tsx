"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Seeded random for deterministic particle generation
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: "primary" | "accent" | "white";
  xOffset: number;
}

interface ParticlesProps {
  className?: string;
  quantity?: number;
}

function generateParticles(quantity: number): Particle[] {
  return Array.from({ length: quantity }, (_, i) => ({
    id: i,
    x: seededRandom(i * 1 + 1) * 100,
    y: seededRandom(i * 2 + 2) * 100,
    size: seededRandom(i * 3 + 3) * 4 + 1,
    duration: seededRandom(i * 4 + 4) * 20 + 15,
    delay: seededRandom(i * 5 + 5) * 5,
    opacity: seededRandom(i * 6 + 6) * 0.5 + 0.1,
    color: (["primary", "accent", "white"] as const)[Math.floor(seededRandom(i * 7 + 7) * 3)],
    xOffset: seededRandom(i * 8 + 8) * 20 - 10,
  }));
}

export function Particles({ 
  className,
  quantity = 50,
}: ParticlesProps) {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Only render particles on the client after mount to avoid hydration mismatch
  useEffect(() => {
    setParticles(generateParticles(quantity));
    setMounted(true);
  }, [quantity]);

  const colorClasses = {
    primary: "bg-primary",
    accent: "bg-accent",
    white: "bg-white",
  };

  // Return empty container during SSR and initial render
  if (!mounted) {
    return <div className={cn("fixed inset-0 overflow-hidden pointer-events-none", className)} aria-hidden="true" />;
  }

  return (
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none", className)} aria-hidden="true">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={cn(
              "absolute rounded-full",
              colorClasses[particle.color]
            )}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
              y: [0, -30, 0],
              x: [0, particle.xOffset, 0],
              scale: [1, 1.2, 1],
            }}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Variant with connected lines (constellation effect)
interface ConstellationParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  xAnim: number;
  yAnim: number;
  duration: number;
}

function generateConstellationParticles(quantity: number): ConstellationParticle[] {
  return Array.from({ length: quantity }, (_, i) => ({
    id: i,
    x: seededRandom(i * 10 + 1) * 100,
    y: seededRandom(i * 10 + 2) * 100,
    size: seededRandom(i * 10 + 3) * 3 + 1,
    xAnim: seededRandom(i * 10 + 4) * 40 - 20,
    yAnim: seededRandom(i * 10 + 5) * 40 - 20,
    duration: seededRandom(i * 10 + 6) * 10 + 10,
  }));
}

export function ConstellationParticles({ 
  className,
  quantity = 30,
}: ParticlesProps) {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<ConstellationParticle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setParticles(generateConstellationParticles(quantity));
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [quantity]);

  // Return empty container during SSR and initial render
  if (!mounted) {
    return <div className={cn("fixed inset-0 overflow-hidden pointer-events-none", className)} aria-hidden="true" />;
  }

  return (
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none", className)} aria-hidden="true">
      <svg className="w-full h-full">
        {/* Draw lines between nearby particles */}
        {particles.map((p1, i) =>
          particles.slice(i + 1).map((p2) => {
            const distance = Math.sqrt(
              Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
            );
            if (distance < 15) {
              return (
                <motion.line
                  key={`${p1.id}-${p2.id}`}
                  x1={`${p1.x}%`}
                  y1={`${p1.y}%`}
                  x2={`${p2.x}%`}
                  y2={`${p2.y}%`}
                  stroke="url(#gradient)"
                  strokeWidth="0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  transition={{ duration: 1 }}
                />
              );
            }
            return null;
          })
        )}
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            x: [0, particle.xAnim, 0],
            y: [0, particle.yAnim, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Mouse follower glow */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-primary/10 blur-3xl"
        animate={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          x: "-50%",
          y: "-50%",
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />
    </div>
  );
}

// Sparkle particles (small twinkling stars)
interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

function generateSparkleParticles(quantity: number): SparkleParticle[] {
  return Array.from({ length: quantity }, (_, i) => ({
    id: i,
    x: seededRandom(i * 20 + 1) * 100,
    y: seededRandom(i * 20 + 2) * 100,
    size: seededRandom(i * 20 + 3) * 3 + 1,
    delay: seededRandom(i * 20 + 4) * 3,
  }));
}

export function SparkleParticles({ 
  className,
  quantity = 40,
}: ParticlesProps) {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<SparkleParticle[]>([]);

  // Only render particles on the client after mount to avoid hydration mismatch
  useEffect(() => {
    setParticles(generateSparkleParticles(quantity));
    setMounted(true);
  }, [quantity]);

  // Return empty container during SSR and initial render
  if (!mounted) {
    return <div className={cn("fixed inset-0 overflow-hidden pointer-events-none", className)} aria-hidden="true" />;
  }

  return (
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none", className)} aria-hidden="true">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        >
          {/* Star shape */}
          <svg
            width={particle.size * 4}
            height={particle.size * 4}
            viewBox="0 0 24 24"
            fill="none"
          >
            <motion.path
              d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
              fill="url(#sparkle-gradient)"
              animate={{
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <defs>
              <linearGradient id="sparkle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// Rising particles (like bubbles or embers)
interface RisingParticle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: "primary" | "accent" | "white";
  sineOffset: number;
}

function generateRisingParticles(quantity: number): RisingParticle[] {
  return Array.from({ length: quantity }, (_, i) => ({
    id: i,
    x: seededRandom(i * 30 + 1) * 100,
    size: seededRandom(i * 30 + 2) * 4 + 1,
    duration: seededRandom(i * 30 + 3) * 20 + 15,
    delay: seededRandom(i * 30 + 4) * 10,
    opacity: seededRandom(i * 30 + 5) * 0.5 + 0.1,
    color: (["primary", "accent", "white"] as const)[Math.floor(seededRandom(i * 30 + 6) * 3)],
    sineOffset: Math.sin(i) * 50,
  }));
}

export function RisingParticles({ 
  className,
  quantity = 25,
}: ParticlesProps) {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<RisingParticle[]>([]);

  // Only render particles on the client after mount to avoid hydration mismatch
  useEffect(() => {
    setParticles(generateRisingParticles(quantity));
    setMounted(true);
  }, [quantity]);

  const colorClasses = {
    primary: "bg-primary",
    accent: "bg-accent", 
    white: "bg-white",
  };

  // Return empty container during SSR and initial render
  if (!mounted) {
    return <div className={cn("fixed inset-0 overflow-hidden pointer-events-none", className)} aria-hidden="true" />;
  }

  return (
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none", className)} aria-hidden="true">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={cn(
            "absolute rounded-full blur-[1px]",
            colorClasses[particle.color]
          )}
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
          }}
          initial={{
            y: "100vh",
            opacity: 0,
          }}
          animate={{
            y: "-10vh",
            opacity: [0, particle.opacity, particle.opacity, 0],
            x: [0, particle.sineOffset, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

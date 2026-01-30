"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "gradient" | "glow";
  hover?: boolean;
  id?: string;
}

export function Card({ 
  className, 
  variant = "default", 
  hover = true, 
  children,
  id,
}: CardProps) {
  const baseStyles = "rounded-2xl p-6 transition-all duration-300";
  
  const variants = {
    default: "bg-card border border-border",
    glass: "glass",
    gradient: "bg-gradient-to-br from-card via-card to-secondary border border-border/50",
    glow: "bg-card border border-primary/20 glow-primary",
  };

  return (
    <motion.div
      id={id}
      className={cn(baseStyles, variants[variant], className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={hover ? { 
        y: -4, 
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        borderColor: "rgba(139, 92, 246, 0.3)"
      } : undefined}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={cn("text-xl font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}

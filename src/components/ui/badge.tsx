"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
  pulse?: boolean;
}

export function Badge({ 
  className, 
  variant = "default", 
  pulse = false, 
  children,
}: BadgeProps) {
  const variants = {
    default: "bg-primary/20 text-primary border-primary/30",
    secondary: "bg-secondary text-secondary-foreground border-border",
    outline: "bg-transparent border-border text-muted-foreground",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    destructive: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border transition-colors",
        variants[variant],
        className
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {pulse && (
        <motion.span
          className={cn(
            "w-2 h-2 rounded-full",
            variant === "success" && "bg-emerald-400",
            variant === "warning" && "bg-amber-400",
            variant === "destructive" && "bg-red-400",
            variant === "default" && "bg-primary"
          )}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {children}
    </motion.span>
  );
}

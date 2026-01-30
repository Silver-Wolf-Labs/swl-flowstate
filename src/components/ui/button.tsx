"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export function Button({ 
  className, 
  variant = "default", 
  size = "md", 
  children, 
  isLoading, 
  disabled,
  onClick,
  type = "button",
}: ButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
    outline: "border-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:border-primary",
    ghost: "bg-transparent hover:bg-secondary text-foreground",
    gradient: "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
  };
  
  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg",
    icon: "h-11 w-11",
  };

  return (
    <motion.button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
        initial={false}
        whileHover={{ translateX: "100%" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      
      {/* Gradient animation for gradient variant */}
      {variant === "gradient" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ zIndex: -1 }}
        />
      )}
      
      {isLoading ? (
        <motion.div
          className="h-5 w-5 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      )}
    </motion.button>
  );
}

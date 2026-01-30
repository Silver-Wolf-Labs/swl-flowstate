"use client";

import { motion } from "framer-motion";
import { Waves, Github, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "#dashboard" },
  { label: "Focus", href: "#focus" },
  { label: "Music", href: "#music" },
  { label: "Analytics", href: "#analytics" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 glass"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent overflow-hidden"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(139, 92, 246, 0.3)",
                  "0 0 30px rgba(139, 92, 246, 0.5)",
                  "0 0 20px rgba(139, 92, 246, 0.3)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Waves className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">FlowState</span>
              <span className="text-[10px] text-muted-foreground leading-tight">by Silver Wolf Labs</span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-5 h-5" />
            </motion.a>
            <Button variant="gradient" size="sm" className="hidden sm:inline-flex">
              Get Started
            </Button>

            {/* Mobile menu button */}
            <motion.button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-secondary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        className={cn(
          "md:hidden absolute top-full left-0 right-0 glass border-t border-border",
          !mobileMenuOpen && "hidden"
        )}
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: mobileMenuOpen ? 1 : 0, 
          height: mobileMenuOpen ? "auto" : 0 
        }}
        transition={{ duration: 0.2 }}
      >
        <nav className="flex flex-col p-4 gap-2">
          {navItems.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </motion.a>
          ))}
          <Button variant="gradient" size="sm" className="mt-2">
            Get Started
          </Button>
        </nav>
      </motion.div>
    </motion.header>
  );
}

"use client";

import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Heart, Waves } from "lucide-react";

const socialLinks = [
  { icon: Github, href: "https://github.com/Silver-Wolf-Labs/swl-flowstate", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/fabriziomendez/", label: "LinkedIn" },
];

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerLinks: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Dashboard", href: "#dashboard" },
      { label: "Analytics", href: "#analytics" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Community", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "mailto:fabriziomendezalberti@gmail.com" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-card/50">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2">
            <motion.div 
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">FlowState</span>
                <span className="text-[10px] text-muted-foreground leading-tight">by Silver Wolf Labs</span>
              </div>
            </motion.div>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              A mood-adaptive productivity dashboard that helps you stay in flow while coding.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((column, index) => (
            <motion.div
              key={column.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-sm mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <motion.a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FlowState. All rights reserved.
          </p>
          <motion.p 
            className="flex items-center gap-1 text-sm text-muted-foreground"
            whileHover={{ scale: 1.05 }}
          >
            Built with{" "}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            </motion.span>
            {" "}for productivity lovers
          </motion.p>
        </div>
      </div>
    </footer>
  );
}

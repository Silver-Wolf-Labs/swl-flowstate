"use client";

import { motion } from "framer-motion";
import { Music, ExternalLink, ChevronRight, ChevronLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnvVarsConfig } from "../types";
import { useState } from "react";

interface EnvVarsStepProps {
  envVars: EnvVarsConfig;
  onUpdate: (envVars: EnvVarsConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

const musicServices = [
  {
    id: "spotify",
    name: "Spotify",
    icon: "🎵",
    fields: [
      { key: "spotifyClientId", label: "Client ID", placeholder: "Your Spotify Client ID" },
      { key: "spotifyClientSecret", label: "Client Secret", placeholder: "Your Spotify Client Secret", secret: true },
    ],
    docsUrl: "https://developer.spotify.com/dashboard",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "📺",
    fields: [
      { key: "youtubeApiKey", label: "API Key", placeholder: "Your YouTube API Key (optional)", secret: true },
    ],
    docsUrl: "https://console.cloud.google.com/apis/credentials",
    note: "YouTube works with curated streams even without an API key",
  },
  {
    id: "appleMusic",
    name: "Apple Music",
    icon: "🍎",
    fields: [
      { key: "appleMusicDeveloperToken", label: "Developer Token", placeholder: "Your Apple Music Token", secret: true },
    ],
    docsUrl: "https://developer.apple.com/musickit/",
  },
  {
    id: "soundcloud",
    name: "SoundCloud",
    icon: "☁️",
    fields: [
      { key: "soundcloudClientId", label: "Client ID", placeholder: "Your SoundCloud Client ID" },
    ],
    docsUrl: "https://soundcloud.com/you/apps",
  },
];

export function EnvVarsStep({ envVars, onUpdate, onNext, onBack }: EnvVarsStepProps) {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const handleChange = (key: string, value: string) => {
    onUpdate({ ...envVars, [key]: value });
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
          <Music className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold mb-1">Music Services (Optional)</h2>
        <p className="text-sm text-muted-foreground">
          Connect your favorite music platforms for mood-based playlists
        </p>
      </motion.div>

      {/* Info banner */}
      <motion.div
        className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          These are optional. You can skip this step and configure them later. 
          FlowState works great with just YouTube&apos;s curated streams!
        </p>
      </motion.div>

      {/* Music services */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {musicServices.map((service, index) => (
          <motion.div
            key={service.id}
            className="p-4 rounded-xl bg-secondary/30 border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{service.icon}</span>
                <span className="font-medium">{service.name}</span>
              </div>
              <a
                href={service.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get API Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {service.note && (
              <p className="text-xs text-muted-foreground mb-2 italic">{service.note}</p>
            )}
            <div className="space-y-2">
              {service.fields.map((field) => (
                <div key={field.key} className="relative">
                  <input
                    type={field.secret && !showSecrets[field.key] ? "password" : "text"}
                    placeholder={field.placeholder}
                    value={(envVars as Record<string, string>)[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {field.secret && (
                    <button
                      type="button"
                      onClick={() => toggleSecret(field.key)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showSecrets[field.key] ? "Hide" : "Show"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button variant="gradient" onClick={onNext} className="flex-1">
          Continue <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}


"use client";

import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IDEType, IDE_INFO } from "../types";

interface CompleteStepProps {
  selectedIDEs: IDEType[];
  onClose: () => void;
}

export function CompleteStep({ selectedIDEs, onClose }: CompleteStepProps) {
  return (
    <div className="space-y-6">
      {/* Success animation */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2, damping: 10 }}
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>
        
        <motion.h2
          className="text-2xl font-bold mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          You&apos;re All Set! 🎉
        </motion.h2>
        
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          FlowState is ready to boost your productivity
        </motion.p>
      </motion.div>

      {/* Summary */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* Configured IDEs */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <h3 className="text-sm font-medium mb-2">Configured IDEs:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedIDEs.map((ide) => (
              <span
                key={ide}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-1.5"
              >
                {IDE_INFO[ide].icon} {IDE_INFO[ide].name}
              </span>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Next Steps
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <span>Restart your IDE to load the MCP configuration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <span>Try saying &quot;start a focus session&quot; to your AI assistant</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <span>Keep this browser tab open to see real-time updates</span>
            </li>
          </ul>
        </div>

        {/* Quick commands */}
        <div className="p-4 rounded-xl bg-secondary/30 border border-border">
          <h3 className="text-sm font-medium mb-2">Try these commands in your IDE:</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <code className="px-2 py-1.5 rounded bg-background border border-border">
              &quot;start timer&quot;
            </code>
            <code className="px-2 py-1.5 rounded bg-background border border-border">
              &quot;set mood to focus&quot;
            </code>
            <code className="px-2 py-1.5 rounded bg-background border border-border">
              &quot;take a break&quot;
            </code>
            <code className="px-2 py-1.5 rounded bg-background border border-border">
              &quot;show my stats&quot;
            </code>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button variant="gradient" className="w-full" onClick={onClose}>
          Start Using FlowState
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}


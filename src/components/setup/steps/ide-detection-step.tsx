"use client";

import { motion } from "framer-motion";
import { Monitor, Check, ChevronRight, ChevronLeft, RefreshCw, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetectedIDE, IDEType, IDE_INFO } from "../types";
import { useState, useEffect } from "react";

interface IDEDetectionStepProps {
  detectedIDEs: DetectedIDE[];
  selectedIDEs: IDEType[];
  onDetect: () => Promise<void>;
  onSelect: (ideId: IDEType) => void;
  onNext: () => void;
  onBack: () => void;
}

export function IDEDetectionStep({
  detectedIDEs,
  selectedIDEs,
  onDetect,
  onSelect,
  onNext,
  onBack,
}: IDEDetectionStepProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [hasDetected, setHasDetected] = useState(false);

  // Create a list of all IDEs (use detected ones or fallback to all IDEs)
  const allIDEs: DetectedIDE[] = detectedIDEs.length > 0
    ? detectedIDEs
    : (Object.keys(IDE_INFO) as IDEType[]).map(id => ({
        id,
        name: IDE_INFO[id].name,
        detected: false,
        configPath: '',
        icon: IDE_INFO[id].icon,
      }));

  useEffect(() => {
    // Auto-detect on mount if not already detected
    if (!hasDetected && detectedIDEs.length === 0) {
      handleDetect();
    }
  }, []);

  const handleDetect = async () => {
    setIsDetecting(true);
    try {
      await onDetect();
      setHasDetected(true);
    } finally {
      setIsDetecting(false);
    }
  };

  const detectedCount = allIDEs.filter(ide => ide.detected).length;
  const hasSelection = selectedIDEs.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Monitor className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold mb-1">IDE Detection</h2>
        <p className="text-sm text-muted-foreground">
          Select which IDEs you want to configure for FlowState
        </p>
      </motion.div>

      {/* Info notice about web-based detection */}
      <motion.div
        className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Select the IDEs you have installed. Auto-detection may not work in web browsers - simply select your IDEs manually.
        </p>
      </motion.div>

      {/* Detection status */}
      {isDetecting ? (
        <motion.div
          className="flex flex-col items-center justify-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Detecting installed IDEs...</p>
        </motion.div>
      ) : (
        <>
          {/* IDE list */}
          <div className="space-y-3">
            {allIDEs.map((ide, index) => (
              <motion.button
                key={ide.id}
                onClick={() => onSelect(ide.id)}
                className={`w-full p-4 rounded-xl border transition-all text-left ${
                  selectedIDEs.includes(ide.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-secondary/50 border-border hover:border-primary/50"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{IDE_INFO[ide.id].icon}</span>
                    <div>
                      <div className="font-medium">{IDE_INFO[ide.id].name}</div>
                      <div className="text-xs text-muted-foreground">
                        {ide.detected ? "Auto-detected" : "Click to select"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ide.detected && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                        Found
                      </span>
                    )}
                    {selectedIDEs.includes(ide.id) && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Re-detect button */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleDetect}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Re-detect IDEs
            </button>
          </motion.div>

          {/* Selection summary */}
          {hasSelection && (
            <motion.div
              className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-sm">
                <span className="font-medium text-primary">{selectedIDEs.length}</span> IDE{selectedIDEs.length > 1 ? "s" : ""} selected for configuration
              </p>
            </motion.div>
          )}
        </>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          variant="gradient"
          onClick={onNext}
          className="flex-1"
          disabled={!hasSelection || isDetecting}
        >
          Continue <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}


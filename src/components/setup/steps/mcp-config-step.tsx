"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Settings, Copy, Check, ChevronRight, ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IDEType, IDE_INFO, MCPConfig } from "../types";
import { useState } from "react";

interface MCPConfigStepProps {
  selectedIDEs: IDEType[];
  mcpConfigs: Record<IDEType, MCPConfig>;
  configPaths: Record<IDEType, string>;
  onNext: () => void;
  onBack: () => void;
}

export function MCPConfigStep({
  selectedIDEs,
  mcpConfigs,
  configPaths,
  onNext,
  onBack,
}: MCPConfigStepProps) {
  const [currentIDEIndex, setCurrentIDEIndex] = useState(0);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const currentIDE = selectedIDEs[currentIDEIndex] || "cursor";
  const currentConfig = mcpConfigs[currentIDE];
  const currentPath = configPaths[currentIDE];
  const configJson = currentConfig ? JSON.stringify(currentConfig, null, 2) : "{}";

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleNextIDE = () => {
    if (currentIDEIndex < selectedIDEs.length - 1) {
      setCurrentIDEIndex(prev => prev + 1);
    } else {
      onNext();
    }
  };

  const handlePrevIDE = () => {
    if (currentIDEIndex > 0) {
      setCurrentIDEIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const isLastIDE = currentIDEIndex === selectedIDEs.length - 1;

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold mb-1">Configure {IDE_INFO[currentIDE].name}</h2>
        <p className="text-sm text-muted-foreground">
          {selectedIDEs.length > 1 && `(${currentIDEIndex + 1} of ${selectedIDEs.length}) `}
          Copy the configuration below to your IDE
        </p>
      </motion.div>

      {/* IDE tabs if multiple */}
      {selectedIDEs.length > 1 && (
        <div className="flex gap-2 justify-center">
          {selectedIDEs.map((ide, index) => (
            <button
              key={ide}
              onClick={() => setCurrentIDEIndex(index)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                index === currentIDEIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {IDE_INFO[ide].icon} {IDE_INFO[ide].name}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIDE}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          {/* Config path */}
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Config file location:</span>
              <button
                onClick={() => handleCopy(currentPath, `path-${currentIDE}`)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                {copiedStates[`path-${currentIDE}`] ? (
                  <><Check className="w-3 h-3" /> Copied!</>
                ) : (
                  <><Copy className="w-3 h-3" /> Copy path</>
                )}
              </button>
            </div>
            <code className="text-xs text-foreground break-all">{currentPath}</code>
          </div>

          {/* Config JSON */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">MCP Configuration:</span>
              <button
                onClick={() => handleCopy(configJson, `config-${currentIDE}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
              >
                {copiedStates[`config-${currentIDE}`] ? (
                  <><Check className="w-4 h-4" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy Config</>
                )}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#1e1e1e] border border-border overflow-x-auto text-xs">
              <code className="text-green-400">{configJson}</code>
            </pre>
          </div>

          {/* Instructions */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h4 className="text-sm font-medium mb-2">Setup Instructions:</h4>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open {IDE_INFO[currentIDE].name} settings</li>
              <li>Navigate to MCP configuration</li>
              <li>Paste the configuration above</li>
              <li>Restart {IDE_INFO[currentIDE].name}</li>
            </ol>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handlePrevIDE} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-1" /> {currentIDEIndex > 0 ? "Previous IDE" : "Back"}
        </Button>
        <Button variant="gradient" onClick={handleNextIDE} className="flex-1">
          {isLastIDE ? "Complete Setup" : "Next IDE"} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}


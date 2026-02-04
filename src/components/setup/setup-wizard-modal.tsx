"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { SetupStep, SetupState, DetectedIDE, IDEType, MCPConfig, EnvVarsConfig, SETUP_STEPS, IDE_INFO } from "./types";
import { WelcomeStep } from "./steps/welcome-step";
import { EnvVarsStep } from "./steps/env-vars-step";
import { IDEDetectionStep } from "./steps/ide-detection-step";
import { MCPConfigStep } from "./steps/mcp-config-step";
import { CompleteStep } from "./steps/complete-step";

interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const STEP_ORDER: SetupStep[] = ['welcome', 'env-vars', 'ide-detection', 'mcp-config', 'complete'];

export function SetupWizardModal({ isOpen, onClose, onComplete }: SetupWizardModalProps) {
  const [state, setState] = useState<SetupState>({
    currentStep: 'welcome',
    envVars: {},
    detectedIDEs: [],
    selectedIDEs: [],
    mcpConfigured: false,
    isComplete: false,
  });

  const [mcpConfigs, setMcpConfigs] = useState<Record<IDEType, MCPConfig>>({} as Record<IDEType, MCPConfig>);
  const [configPaths, setConfigPaths] = useState<Record<IDEType, string>>({} as Record<IDEType, string>);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const currentStepIndex = STEP_ORDER.indexOf(state.currentStep);
  const progress = ((currentStepIndex + 1) / STEP_ORDER.length) * 100;

  const goToStep = (step: SetupStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      goToStep(STEP_ORDER[nextIndex]);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      goToStep(STEP_ORDER[prevIndex]);
    }
  };

  const detectIDEs = useCallback(async () => {
    try {
      const response = await fetch('/api/setup/detect-ides');
      const data = await response.json();
      setState(prev => ({ ...prev, detectedIDEs: data.ides }));
    } catch (error) {
      console.error('Failed to detect IDEs:', error);
      // Fallback: show all IDEs as not detected
      const fallbackIDEs: DetectedIDE[] = Object.keys(IDE_INFO).map(id => ({
        id: id as IDEType,
        name: IDE_INFO[id as IDEType].name,
        detected: false,
        configPath: '',
        icon: IDE_INFO[id as IDEType].icon,
      }));
      setState(prev => ({ ...prev, detectedIDEs: fallbackIDEs }));
    }
  }, []);

  const toggleIDESelection = (ideId: IDEType) => {
    setState(prev => ({
      ...prev,
      selectedIDEs: prev.selectedIDEs.includes(ideId)
        ? prev.selectedIDEs.filter(id => id !== ideId)
        : [...prev.selectedIDEs, ideId],
    }));
  };

  const updateEnvVars = (envVars: EnvVarsConfig) => {
    setState(prev => ({ ...prev, envVars }));
  };

  // Generate MCP configs when moving to mcp-config step
  useEffect(() => {
    if (state.currentStep === 'mcp-config' && state.selectedIDEs.length > 0) {
      generateMCPConfigs();
    }
  }, [state.currentStep, state.selectedIDEs]);

  const generateMCPConfigs = async () => {
    try {
      const response = await fetch('/api/setup/mcp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedIDEs: state.selectedIDEs }),
      });
      const data = await response.json();
      setMcpConfigs(data.configs);
      setConfigPaths(data.paths);
    } catch (error) {
      console.error('Failed to generate MCP configs:', error);
    }
  };

  const handleComplete = async () => {
    // Save setup completion status
    try {
      await fetch('/api/setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          envVars: state.envVars,
          selectedIDEs: state.selectedIDEs,
        }),
      });
    } catch (error) {
      console.error('Failed to save setup status:', error);
    }
    
    setState(prev => ({ ...prev, isComplete: true }));
    onComplete();
    onClose();
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 'welcome':
        return <WelcomeStep onNext={nextStep} />;
      case 'env-vars':
        return (
          <EnvVarsStep
            envVars={state.envVars}
            onUpdate={updateEnvVars}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'ide-detection':
        return (
          <IDEDetectionStep
            detectedIDEs={state.detectedIDEs}
            selectedIDEs={state.selectedIDEs}
            onDetect={detectIDEs}
            onSelect={toggleIDESelection}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'mcp-config':
        return (
          <MCPConfigStep
            selectedIDEs={state.selectedIDEs}
            mcpConfigs={mcpConfigs}
            configPaths={configPaths}
            onNext={() => goToStep('complete')}
            onBack={prevStep}
          />
        );
      case 'complete':
        return (
          <CompleteStep
            selectedIDEs={state.selectedIDEs}
            onClose={handleComplete}
          />
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg mx-4"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-background border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header with progress */}
              <div className="relative p-4 border-b border-border shrink-0">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-xl hover:bg-secondary transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Progress bar */}
                <div className="pr-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {SETUP_STEPS.find(s => s.id === state.currentStep)?.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Step {currentStepIndex + 1} of {STEP_ORDER.length}
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={state.currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


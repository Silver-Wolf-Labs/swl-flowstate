"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, CreditCard, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { SetupWizardModal } from "@/components/setup";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SetupStatus {
  isComplete: boolean;
  completedAt: string | null;
  selectedIDEs: string[];
}

const getFreePlan = (isSetupComplete: boolean) => ({
  name: "Free",
  price: "$0",
  period: "forever",
  description: "Perfect for getting started",
  features: [
    "Focus timer with sessions",
    "4 mood presets",
    "YouTube lofi integration",
    "Basic analytics",
  ],
  cta: isSetupComplete ? "Current Plan" : "Set me up",
  disabled: isSetupComplete,
  isSetupTrigger: !isSetupComplete,
  popular: false,
});
const paidPlans = [
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For serious productivity",
    features: [
      "Everything in Free",
      "Spotify & SoundCloud integration",
      "Advanced analytics & insights",
      "Custom mood presets",
      "Priority support",
      "No ads",
    ],
    cta: "Upgrade to Pro",
    popular: true,
    disabled: false,
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team dashboard",
      "Shared playlists",
      "Admin controls",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    disabled: false,
  },
];

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [setupStatus, setSetupStatus] = useState<SetupStatus>({
    isComplete: false,
    completedAt: null,
    selectedIDEs: [],
  });

  // Check setup status on mount
  useEffect(() => {
    if (isOpen) {
      checkSetupStatus();
    }
  }, [isOpen]);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch("/api/setup/complete");
      const data = await response.json();
      setSetupStatus(data);
    } catch (error) {
      console.error("Failed to check setup status:", error);
    }
  };

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

  const freePlan = getFreePlan(setupStatus.isComplete);
  const plans = [freePlan, ...paidPlans];

  const handlePlanClick = async (plan: typeof plans[0]) => {
    // Handle Free plan setup trigger
    if (plan.name === "Free" && !setupStatus.isComplete) {
      setShowSetupWizard(true);
      return;
    }

    // Handle paid plans
    if (plan.name === "Pro" || plan.name === "Team") {
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Pricing Inquiry",
            email: "user@flowstate.app",
            message: `User is interested in the ${plan.name} plan. Please follow up.`,
            type: "pricing",
          }),
        });

        if (response.ok) {
          const subject = encodeURIComponent(`FlowState ${plan.name} Plan Interest`);
          const body = encodeURIComponent(`Hi,\n\nI'm interested in the ${plan.name} plan for FlowState.\n\nPlease send me more information about pricing and features.\n\nThanks!`);
          window.open(`mailto:fabriziomendezalberti@gmail.com?subject=${subject}&body=${body}`, "_blank");
        }
      } catch {
        const subject = encodeURIComponent(`FlowState ${plan.name} Plan Interest`);
        const body = encodeURIComponent(`Hi,\n\nI'm interested in the ${plan.name} plan for FlowState.\n\nPlease send me more information about pricing and features.\n\nThanks!`);
        window.open(`mailto:fabriziomendezalberti@gmail.com?subject=${subject}&body=${body}`, "_blank");
      }
    }
  };

  const handleSetupComplete = () => {
    setSetupStatus(prev => ({ ...prev, isComplete: true }));
    setShowSetupWizard(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[101] sm:w-full sm:max-w-4xl flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full">
              {/* Header - fixed */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border shrink-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Choose Your Plan</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Unlock your full productivity potential
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {plans.map((plan, index) => (
                    <motion.div
                      key={plan.name}
                      className={`relative p-4 sm:p-6 rounded-xl border ${
                        plan.popular
                          ? "border-primary bg-primary/5"
                          : "border-border bg-secondary/30"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                          Most Popular
                        </div>
                      )}

                      <div className="text-center mb-4 sm:mb-6">
                        <h3 className="text-lg font-semibold mb-1 sm:mb-2">{plan.name}</h3>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                          <span className="text-muted-foreground text-sm">{plan.period}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                          {plan.description}
                        </p>
                      </div>

                      <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-xs sm:text-sm">
                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={plan.popular ? "gradient" : plan.name === "Free" && !setupStatus.isComplete ? "default" : "outline"}
                        className="w-full"
                        disabled={plan.disabled}
                        onClick={() => handlePlanClick(plan)}
                      >
                        {plan.name === "Free" && !setupStatus.isComplete && (
                          <Settings className="w-4 h-4 mr-1.5" />
                        )}
                        {plan.cta}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Payment methods */}
                <motion.div
                  className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-center text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    Secure payments powered by Stripe
                  </p>
                  <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                    {/* Credit Card */}
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-secondary/50 rounded-lg">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-xs sm:text-sm">Card</span>
                    </div>
                    {/* Apple Pay - Apple logo + text */}
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-secondary/50 rounded-lg">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      <span className="text-xs sm:text-sm">Pay</span>
                    </div>
                    {/* PayPal */}
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-secondary/50 rounded-lg">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h5.693c2.734 0 4.58.676 5.486 2.01.896 1.319.96 2.987.19 4.958-.212.543-.503 1.127-.861 1.737l-.004.006c-.758 1.297-1.763 2.202-2.978 2.686a.476.476 0 0 0-.245.575l1.89 8.895a.641.641 0 0 1-.627.77h-4.29a.643.643 0 0 1-.627-.51l-1.62-7.63h-1.88l-1.435 7.33a.643.643 0 0 1-.63.51z" fill="#003087"/>
                        <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H7.72a.483.483 0 0 1-.477-.558L7.418 21h1.518l.95-6.02h1.385c4.678 0 7.75-2.203 8.796-6.502z" fill="#0070E0"/>
                      </svg>
                      <span className="text-xs sm:text-sm">PayPal</span>
                    </div>
                    {/* Google Pay - Google G logo + text */}
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-secondary/50 rounded-lg">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-xs sm:text-sm">Pay</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Setup Wizard Modal */}
      <SetupWizardModal
        isOpen={showSetupWizard}
        onClose={() => setShowSetupWizard(false)}
        onComplete={handleSetupComplete}
      />
    </AnimatePresence>
  );
}

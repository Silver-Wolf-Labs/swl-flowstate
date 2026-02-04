"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Waves } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to FlowState
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Terms & Conditions</h1>
              <p className="text-muted-foreground">Last updated: February 4, 2025</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            {/* Table of Contents */}
            <section className="p-4 bg-secondary/30 rounded-xl border border-border">
              <h2 className="text-lg font-semibold mb-3">Contents</h2>
              <ul className="space-y-1 text-sm">
                <li><a href="#terms" className="text-primary hover:underline">Terms of Service</a></li>
                <li><a href="#refund" className="text-primary hover:underline">Refund Policy</a></li>
              </ul>
            </section>

            {/* Terms of Service Section */}
            <div id="terms" className="pt-4">
              <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-border">Terms of Service</h2>
            </div>

            <section>
              <h3 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using FlowState (&quot;the Service&quot;), provided by Silver Wolf Labs, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">2. Description of Service</h3>
              <p className="text-muted-foreground leading-relaxed">
                FlowState is a mood-adaptive productivity dashboard that provides focus timers, ambient music integration, and analytics to help users maintain productive work sessions. The Service includes both free and paid subscription tiers.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">3. User Accounts</h3>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">4. Subscription and Payments</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Paid subscriptions are billed in advance on a monthly or annual basis. By subscribing to a paid plan, you authorize us to charge your payment method for the subscription fees.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Prices are subject to change with 30 days notice</li>
                <li>Subscriptions automatically renew unless cancelled</li>
                <li>You may cancel your subscription at any time</li>
                <li>Refunds are handled according to our Refund Policy below</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">5. Acceptable Use</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Share your account credentials with others</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">6. Intellectual Property</h3>
              <p className="text-muted-foreground leading-relaxed">
                The Service and its original content, features, and functionality are owned by Silver Wolf Labs and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">7. Limitation of Liability</h3>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Silver Wolf Labs shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">8. Changes to Terms</h3>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the Service. Continued use after changes constitutes acceptance of the new terms.
              </p>
            </section>

            {/* Refund Policy Section */}
            <div id="refund" className="pt-8 mt-8 border-t border-border">
              <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-border">Refund Policy</h2>
            </div>

            <section>
              <h3 className="text-xl font-semibold mb-4">Merchant of Record</h3>
              <p className="text-muted-foreground leading-relaxed">
                All payments for FlowState are processed by Paddle.com, who acts as our Merchant of Record. This means you purchase FlowState from Paddle, and all refund requests are handled according to Paddle&apos;s refund policy.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">Consumer Right to Cancel</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you are a Consumer, you have the right to cancel your purchase and receive a full refund within 14 days without giving any reason. The cancellation period expires 14 days from the day after completion of the transaction.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Important:</strong> Your right to cancel does not apply once you have started to download, stream, or otherwise acquire the digital content. By downloading or accessing FlowState, you consent to immediate performance and acknowledge that you lose your right of withdrawal.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">How to Request a Refund or Cancellation</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To request a refund or cancel your purchase, please contact Paddle directly through their support channels at{" "}
                <a href="https://paddle.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paddle.com</a>.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Paddle will reimburse all payments using the same payment method you used for the initial transaction, without undue delay and no later than 14 days after being informed of your decision to cancel.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">Subscriptions</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Paid subscriptions automatically renew until cancelled. To cancel your subscription:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Contact Paddle at least 48 hours before the end of your current billing period</li>
                <li>Provide your order number and the email address used to purchase</li>
                <li>Your cancellation will take effect at the next payment date</li>
                <li>There are no refunds on unused subscription periods</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">Refund Policy</h3>
              <p className="text-muted-foreground leading-relaxed">
                Refunds are provided at the sole discretion of Paddle on a case-by-case basis. This does not affect your statutory rights as a Consumer in relation to products which are not as described, faulty, or not fit for purpose.
              </p>
            </section>

            {/* Contact Section */}
            <section className="pt-8 mt-8 border-t border-border">
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms & Conditions or our Refund Policy, please contact us at{" "}
                <a href="mailto:fabriziomendezalberti@gmail.com" className="text-primary hover:underline">
                  fabriziomendezalberti@gmail.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}


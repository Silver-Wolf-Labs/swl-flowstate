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
              <h3 className="text-xl font-semibold mb-4">30-Day Money-Back Guarantee</h3>
              <p className="text-muted-foreground leading-relaxed">
                We want you to be completely satisfied with FlowState. If you&apos;re not happy with your purchase, we offer a full refund within 30 days of your initial subscription purchase—no questions asked.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">Eligibility for Refunds</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">You are eligible for a full refund if:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>You request a refund within 30 days of your initial purchase</li>
                <li>This is your first refund request for FlowState</li>
                <li>You have not violated our Terms of Service</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">How to Request a Refund</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">To request a refund:</p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                <li>Email us at <a href="mailto:fabriziomendezalberti@gmail.com" className="text-primary hover:underline">fabriziomendezalberti@gmail.com</a></li>
                <li>Include your account email and order/transaction ID</li>
                <li>Briefly explain why you&apos;re requesting a refund (optional but helpful)</li>
              </ol>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We typically process refund requests within 3-5 business days. Once approved, the refund will be credited to your original payment method within 5-10 business days, depending on your bank.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">Subscription Cancellations</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can cancel your subscription at any time. When you cancel:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>You will retain access until the end of your current billing period</li>
                <li>No further charges will be made</li>
                <li>Your data will be retained for 30 days after cancellation</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">Annual Subscriptions</h3>
              <p className="text-muted-foreground leading-relaxed">
                For annual subscriptions, the 30-day money-back guarantee applies from the date of purchase. After 30 days, you may cancel at any time but will not receive a prorated refund for the remaining months.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">Exceptions</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">Refunds may not be granted if:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>The request is made after 30 days from purchase</li>
                <li>You have previously received a refund for FlowState</li>
                <li>Your account was terminated for Terms of Service violations</li>
                <li>There is evidence of fraud or abuse</li>
              </ul>
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


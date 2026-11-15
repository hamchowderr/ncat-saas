"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  PlayCircle,
  CreditCard,
  Clock,
  Shield,
  Zap
} from "lucide-react";

const benefits = [
  "No setup required - start in minutes",
  "Process unlimited files during trial",
  "Cancel anytime - no commitment",
  "24/7 priority support included"
];

const features = [
  { icon: Clock, text: "Instant activation" },
  { icon: CreditCard, text: "No credit card required" },
  { icon: Shield, text: "Enterprise security" },
  { icon: Zap, text: "Full feature access" }
];

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-24">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute right-20 bottom-20 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Badge className="border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Limited Time: Extended Free Trial
            </Badge>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-6 text-4xl leading-tight font-bold text-white md:text-6xl"
          >
            Ready to Transform Your
            <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              {" "}
              Media Workflow?
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-blue-100 md:text-2xl"
          >
            Join thousands of professionals who&apos;ve already streamlined their media processing.
            Start your free trial today and see the difference.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-12 flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="hover:shadow-3xl group w-full bg-white px-12 py-4 text-lg font-bold text-blue-900 shadow-2xl transition-all duration-300 hover:bg-blue-50 sm:w-auto"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="group w-full border-white/30 bg-transparent px-12 py-4 text-lg font-semibold text-white backdrop-blur-sm hover:border-white/50 hover:bg-white/10 sm:w-auto"
                >
                  <PlayCircle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Benefits list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mx-auto mb-16 grid max-w-2xl gap-4 sm:grid-cols-2"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3 text-blue-100"
              >
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-400" />
                <span className="text-sm md:text-base">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mx-auto grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                  className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
                >
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }}>
                    <Icon className="mx-auto mb-3 h-8 w-8 text-white" />
                  </motion.div>
                  <span className="text-sm font-medium text-white">{feature.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Floating elements for visual interest */}
        <motion.div
          className="absolute top-40 left-10 h-4 w-4 rounded-full bg-white/20"
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-60 right-16 h-6 w-6 rounded-full bg-blue-300/30"
          animate={{
            y: [0, -30, 0],
            x: [0, 10, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 h-8 w-8 rounded-full bg-purple-300/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Final trust indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-blue-200">
            <Shield className="h-4 w-4" />
            <span>14-day free trial • No commitment • Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

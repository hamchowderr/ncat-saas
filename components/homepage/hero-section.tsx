"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles } from "lucide-react";

const heroVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const floatingVariants = {
  animate: { y: [0, -10, 0] }
};

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8, ease: "easeOut", staggerChildren: 0.2 }}
          className="mx-auto max-w-5xl"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <Badge
              variant="secondary"
              className="border-0 bg-white/80 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm dark:bg-gray-800/80"
            >
              <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
              AI-Powered Media Processing Platform
            </Badge>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={itemVariants}
            className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-5xl leading-tight font-bold text-transparent md:text-7xl"
          >
            Professional Media Processing Made Simple
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600 md:text-2xl dark:text-gray-300"
          >
            Transform, transcribe, and optimize your content with powerful AI-driven workflows.
            Scale your media production without the complexity.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl"
                >
                  Start Your Free Trial
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-200 bg-white/80 px-8 py-4 text-lg font-semibold shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-800"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center gap-6 text-sm text-gray-500 sm:flex-row dark:text-gray-400"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              No Setup Required
            </div>
            <div className="hidden h-4 w-px bg-gray-300 sm:block dark:bg-gray-600" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Enterprise Security
            </div>
            <div className="hidden h-4 w-px bg-gray-300 sm:block dark:bg-gray-600" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              24/7 Support
            </div>
          </motion.div>
        </motion.div>

        {/* Floating dashboard preview */}
        <motion.div
          variants={floatingVariants}
          animate="animate"
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mt-32 max-w-4xl"
        >
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
              className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80"
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <div className="ml-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  NCAT Dashboard
                </div>
              </div>

              <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
                <div className="text-6xl text-blue-300 dark:text-blue-600">
                  <Play className="h-16 w-16" />
                </div>
              </div>

              {/* Mock interface elements */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="flex h-16 items-center justify-center rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30">
                  <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Transcribe
                  </div>
                </div>
                <div className="flex h-16 items-center justify-center rounded-lg bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30">
                  <div className="text-xs font-medium text-purple-700 dark:text-purple-300">
                    Combine
                  </div>
                </div>
                <div className="flex h-16 items-center justify-center rounded-lg bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/30">
                  <div className="text-xs font-medium text-green-700 dark:text-green-300">
                    Caption
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Glow effect */}
            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

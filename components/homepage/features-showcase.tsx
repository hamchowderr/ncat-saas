"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  Film,
  Type,
  Scissors,
  Image as ImageIcon,
  Workflow,
  ArrowRight,
  Zap
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Video Transcription",
    description:
      "AI-powered speech-to-text with industry-leading accuracy. Support for 50+ languages.",
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30"
  },
  {
    icon: Film,
    title: "Audio/Video Combine",
    description:
      "Seamlessly merge multiple audio and video files with automatic sync and optimization.",
    color: "from-purple-500 to-purple-600",
    bgColor: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30"
  },
  {
    icon: Type,
    title: "Automatic Captions",
    description:
      "Generate accurate captions with custom styling, timing, and multi-language support.",
    color: "from-green-500 to-green-600",
    bgColor: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30"
  },
  {
    icon: Scissors,
    title: "Video Trim & Edit",
    description: "Precise video trimming, cutting, and basic editing with frame-perfect accuracy.",
    color: "from-orange-500 to-orange-600",
    bgColor: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30"
  },
  {
    icon: ImageIcon,
    title: "Image Processing",
    description:
      "Transform, resize, and optimize images with advanced filters and batch processing.",
    color: "from-pink-500 to-pink-600",
    bgColor: "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/30"
  },
  {
    icon: Workflow,
    title: "AI-Powered Workflows",
    description:
      "Automate complex media tasks with pre-built workflows and custom automation chains.",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/30"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const hoverVariants = {
  hover: { scale: 1.02, y: -5 }
};

export function FeaturesShowcase() {
  return (
    <section className="relative overflow-hidden bg-white py-24 dark:bg-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-40 -left-40 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-purple-900/20">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Powerful Features
            </span>
          </div>

          <h2 className="mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl dark:from-gray-100 dark:to-gray-400">
            Everything You Need for Media Processing
          </h2>

          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            Professional-grade tools that handle your entire media workflow. From transcription to
            final production, we&apos;ve got you covered.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover="hover"
              >
                <motion.div
                  variants={hoverVariants}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Card className="h-full overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-2xl dark:bg-gray-900/80">
                    <CardContent className="p-8">
                      {/* Icon with gradient background */}
                      <div className="relative mb-6">
                        <motion.div
                          className={`h-16 w-16 rounded-2xl bg-gradient-to-r ${feature.bgColor} relative z-10 mb-4 flex items-center justify-center`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon
                            className={`h-8 w-8 ${
                              feature.color === "from-blue-500 to-blue-600"
                                ? "text-blue-600"
                                : feature.color === "from-purple-500 to-purple-600"
                                  ? "text-purple-600"
                                  : feature.color === "from-green-500 to-green-600"
                                    ? "text-green-600"
                                    : feature.color === "from-orange-500 to-orange-600"
                                      ? "text-orange-600"
                                      : feature.color === "from-pink-500 to-pink-600"
                                        ? "text-pink-600"
                                        : "text-indigo-600"
                            }`}
                          />
                        </motion.div>

                        {/* Glow effect */}
                        <motion.div
                          className={`absolute inset-0 h-16 w-16 rounded-2xl bg-gradient-to-r ${feature.color} opacity-20 blur-xl`}
                          whileHover={{ scale: 1.2, opacity: 0.3 }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>

                      <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
                        {feature.title}
                      </h3>

                      <p className="mb-4 leading-relaxed text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>

                      {/* Learn more link */}
                      <motion.div
                        className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        Learn more
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            All features included in every plan
          </div>
        </motion.div>
      </div>
    </section>
  );
}

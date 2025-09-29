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
    description: "AI-powered speech-to-text with industry-leading accuracy. Support for 50+ languages.",
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30"
  },
  {
    icon: Film,
    title: "Audio/Video Combine",
    description: "Seamlessly merge multiple audio and video files with automatic sync and optimization.",
    color: "from-purple-500 to-purple-600",
    bgColor: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30"
  },
  {
    icon: Type,
    title: "Automatic Captions",
    description: "Generate accurate captions with custom styling, timing, and multi-language support.",
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
    description: "Transform, resize, and optimize images with advanced filters and batch processing.",
    color: "from-pink-500 to-pink-600",
    bgColor: "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/30"
  },
  {
    icon: Workflow,
    title: "AI-Powered Workflows",
    description: "Automate complex media tasks with pre-built workflows and custom automation chains.",
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
    <section className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-40 -left-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"
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

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-800/50 mb-6">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Powerful Features
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Everything You Need for Media Processing
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Professional-grade tools that handle your entire media workflow.
            From transcription to final production, we&apos;ve got you covered.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                <motion.div variants={hoverVariants} transition={{ duration: 0.2, ease: "easeOut" }}>
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-8">
                      {/* Icon with gradient background */}
                      <div className="relative mb-6">
                        <motion.div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.bgColor} flex items-center justify-center mb-4 relative z-10`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className={`w-8 h-8 ${
                            feature.color === "from-blue-500 to-blue-600" ? "text-blue-600" :
                            feature.color === "from-purple-500 to-purple-600" ? "text-purple-600" :
                            feature.color === "from-green-500 to-green-600" ? "text-green-600" :
                            feature.color === "from-orange-500 to-orange-600" ? "text-orange-600" :
                            feature.color === "from-pink-500 to-pink-600" ? "text-pink-600" :
                            "text-indigo-600"
                          }`} />
                        </motion.div>

                        {/* Glow effect */}
                        <motion.div
                          className={`absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} opacity-20 blur-xl`}
                          whileHover={{ scale: 1.2, opacity: 0.3 }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>

                      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                        {feature.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        {feature.description}
                      </p>

                      {/* Learn more link */}
                      <motion.div
                        className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        Learn more
                        <ArrowRight className="w-4 h-4 ml-1" />
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
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            All features included in every plan
          </div>
        </motion.div>
      </div>
    </section>
  );
}
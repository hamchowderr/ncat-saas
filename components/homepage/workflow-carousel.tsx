"use client";

import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Mic2,
  VideoIcon,
  Sparkles,
  Volume2,
  ArrowRight
} from "lucide-react";
import { useState } from "react";

const workflows = [
  {
    id: "podcast-clips",
    title: "Podcast to Social Clips",
    description:
      "Automatically extract the most engaging moments from your podcast episodes and create viral-ready social media clips.",
    icon: Mic2,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    steps: [
      "Upload podcast audio",
      "AI identifies highlights",
      "Auto-generate clips",
      "Export for social"
    ],
    popular: true
  },
  {
    id: "auto-captions",
    title: "Auto-Generate Captions",
    description:
      "Add professional captions to any video with perfect timing, custom styling, and multi-language support.",
    icon: VideoIcon,
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    steps: [
      "Upload video file",
      "AI transcribes speech",
      "Style captions",
      "Download with captions"
    ],
    popular: false
  },
  {
    id: "batch-processing",
    title: "Batch Video Processing",
    description:
      "Process hundreds of videos simultaneously with consistent settings, formats, and quality optimization.",
    icon: Play,
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    steps: ["Upload video batch", "Configure settings", "AI processes all", "Download results"],
    popular: false
  },
  {
    id: "audio-enhancement",
    title: "Audio Enhancement & Cleanup",
    description:
      "Remove background noise, enhance speech clarity, and optimize audio levels for professional quality.",
    icon: Volume2,
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
    steps: ["Upload audio file", "AI analyzes quality", "Apply enhancements", "Export clean audio"],
    popular: true
  }
];

export function WorkflowCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % workflows.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + workflows.length) % workflows.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  const currentWorkflow = workflows[currentIndex];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-24 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 right-20 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 25,
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
          className="mb-16 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 dark:border-indigo-800/50 dark:from-indigo-900/20 dark:to-purple-900/20">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Popular Workflows
            </span>
          </div>

          <h2 className="mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl dark:from-gray-100 dark:to-gray-400">
            Streamline Your Media Production
          </h2>

          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            Pre-built workflows that handle complex media tasks automatically. Save hours of manual
            work with AI-powered automation.
          </p>
        </motion.div>

        <div className="mx-auto max-w-6xl">
          {/* Main workflow showcase */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-12"
          >
            <Card className="overflow-hidden rounded-2xl border-0 bg-white/80 shadow-2xl backdrop-blur-xl dark:bg-gray-900/80">
              <CardContent className="p-0">
                <div className="grid gap-0 lg:grid-cols-2">
                  {/* Left side - Content */}
                  <div className="flex flex-col justify-center p-8 lg:p-12">
                    <div className="mb-6 flex items-center gap-3">
                      <motion.div
                        className={`h-12 w-12 rounded-xl bg-gradient-to-r ${currentWorkflow.bgColor} flex items-center justify-center`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <currentWorkflow.icon
                          className={`h-6 w-6 ${
                            currentWorkflow.color === "from-blue-500 to-cyan-500"
                              ? "text-blue-600"
                              : currentWorkflow.color === "from-purple-500 to-pink-500"
                                ? "text-purple-600"
                                : currentWorkflow.color === "from-green-500 to-emerald-500"
                                  ? "text-green-600"
                                  : "text-orange-600"
                          }`}
                        />
                      </motion.div>

                      {currentWorkflow.popular && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 px-2 py-1 text-xs text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"
                        >
                          Most Popular
                        </Badge>
                      )}
                    </div>

                    <h3 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {currentWorkflow.title}
                    </h3>

                    <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                      {currentWorkflow.description}
                    </p>

                    {/* Steps */}
                    <div className="mb-8 space-y-4">
                      {currentWorkflow.steps.map((step, stepIndex) => (
                        <motion.div
                          key={stepIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: stepIndex * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div
                            className={`h-6 w-6 rounded-full bg-gradient-to-r ${currentWorkflow.color} flex items-center justify-center text-xs font-bold text-white`}
                          >
                            {stepIndex + 1}
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">{step}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <Button className="flex-1 sm:flex-none">
                        <Play className="mr-2 h-4 w-4" />
                        Try This Workflow
                      </Button>
                      <Button variant="outline" className="flex-1 sm:flex-none">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Right side - Visual */}
                  <div
                    className={`bg-gradient-to-br ${currentWorkflow.bgColor} flex min-h-[400px] items-center justify-center rounded-b-2xl p-8 lg:rounded-r-2xl lg:rounded-b-none lg:p-12`}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="relative"
                    >
                      {/* Mock workflow visualization */}
                      <div className="h-40 w-64 overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
                        <div className="flex h-8 items-center bg-gray-100 px-4 dark:bg-gray-700">
                          <div className="flex gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <div className="h-3 w-3 rounded-full bg-yellow-500" />
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                          </div>
                        </div>
                        <div className="space-y-3 p-4">
                          {currentWorkflow.steps.map((_, stepIndex) => (
                            <motion.div
                              key={stepIndex}
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 0.8, delay: stepIndex * 0.2 }}
                              className={`h-2 bg-gradient-to-r ${currentWorkflow.color} rounded-full opacity-80`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Floating elements */}
                      <motion.div
                        className="absolute -top-4 -right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <currentWorkflow.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/80"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Indicators */}
            <div className="flex gap-2">
              {workflows.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-blue-600"
                      : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/80"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

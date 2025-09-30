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
    description: "Automatically extract the most engaging moments from your podcast episodes and create viral-ready social media clips.",
    icon: Mic2,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    steps: ["Upload podcast audio", "AI identifies highlights", "Auto-generate clips", "Export for social"],
    duration: "~3 minutes",
    popular: true
  },
  {
    id: "auto-captions",
    title: "Auto-Generate Captions",
    description: "Add professional captions to any video with perfect timing, custom styling, and multi-language support.",
    icon: VideoIcon,
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    steps: ["Upload video file", "AI transcribes speech", "Style captions", "Download with captions"],
    duration: "~2 minutes",
    popular: false
  },
  {
    id: "batch-processing",
    title: "Batch Video Processing",
    description: "Process hundreds of videos simultaneously with consistent settings, formats, and quality optimization.",
    icon: Play,
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    steps: ["Upload video batch", "Configure settings", "AI processes all", "Download results"],
    duration: "~10 minutes",
    popular: false
  },
  {
    id: "audio-enhancement",
    title: "Audio Enhancement & Cleanup",
    description: "Remove background noise, enhance speech clarity, and optimize audio levels for professional quality.",
    icon: Volume2,
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
    steps: ["Upload audio file", "AI analyzes quality", "Apply enhancements", "Export clean audio"],
    duration: "~1 minute",
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
    <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
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

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200/50 dark:border-indigo-800/50 mb-6">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Popular Workflows
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Streamline Your Media Production
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Pre-built workflows that handle complex media tasks automatically.
            Save hours of manual work with AI-powered automation.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Main workflow showcase */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-12"
          >
            <Card className="overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Left side - Content */}
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentWorkflow.bgColor} flex items-center justify-center`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <currentWorkflow.icon className={`w-6 h-6 ${
                          currentWorkflow.color === "from-blue-500 to-cyan-500" ? "text-blue-600" :
                          currentWorkflow.color === "from-purple-500 to-pink-500" ? "text-purple-600" :
                          currentWorkflow.color === "from-green-500 to-emerald-500" ? "text-green-600" :
                          "text-orange-600"
                        }`} />
                      </motion.div>

                      <div className="flex gap-2">
                        {currentWorkflow.popular && (
                          <Badge variant="secondary" className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
                            Most Popular
                          </Badge>
                        )}
                        <Badge variant="outline" className="px-2 py-1 text-xs">
                          {currentWorkflow.duration}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                      {currentWorkflow.title}
                    </h3>

                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                      {currentWorkflow.description}
                    </p>

                    {/* Steps */}
                    <div className="space-y-4 mb-8">
                      {currentWorkflow.steps.map((step, stepIndex) => (
                        <motion.div
                          key={stepIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: stepIndex * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${currentWorkflow.color} text-white text-xs font-bold flex items-center justify-center`}>
                            {stepIndex + 1}
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">{step}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <Button className="flex-1 sm:flex-none">
                        <Play className="w-4 h-4 mr-2" />
                        Try This Workflow
                      </Button>
                      <Button variant="outline" className="flex-1 sm:flex-none">
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Right side - Visual */}
                  <div className={`bg-gradient-to-br ${currentWorkflow.bgColor} flex items-center justify-center p-8 lg:p-12 min-h-[400px] rounded-b-2xl lg:rounded-b-none lg:rounded-r-2xl`}>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="relative"
                    >
                      {/* Mock workflow visualization */}
                      <div className="w-64 h-40 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                        <div className="h-8 bg-gray-100 dark:bg-gray-700 flex items-center px-4">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
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
                        className="absolute -top-4 -right-4 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <currentWorkflow.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
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
              className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Indicators */}
            <div className="flex gap-2">
              {workflows.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-blue-600 w-8"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
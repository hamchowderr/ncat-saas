"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, Shield, Clock, Globe, Award, TrendingUp, CheckCircle } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    company: "PodcastPro",
    content:
      "NCAT has transformed our content workflow. What used to take hours now takes minutes. The AI transcription is incredibly accurate.",
    rating: 5,
    avatar: "SC",
    metric: "90% time saved"
  },
  {
    name: "Michael Rodriguez",
    role: "Marketing Director",
    company: "CreativeAgency",
    content:
      "Our clients love the quality of captions and video processing. NCAT helps us deliver premium results consistently.",
    rating: 5,
    avatar: "MR",
    metric: "150+ projects delivered"
  },
  {
    name: "Emma Thompson",
    role: "Education Specialist",
    company: "LearnOnline",
    content:
      "The automated workflows have made our course content so much more accessible. Students engagement has increased significantly.",
    rating: 5,
    avatar: "ET",
    metric: "40% better engagement"
  }
];

const trustIndicators = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant with end-to-end encryption"
  },
  {
    icon: Clock,
    title: "99.9% Uptime",
    description: "Reliable service with 24/7 monitoring"
  },
  {
    icon: Globe,
    title: "Global Scale",
    description: "Processing millions of files worldwide"
  },
  {
    icon: Award,
    title: "Industry Recognition",
    description: "Trusted by Fortune 500 companies"
  }
];

export function SocialProof() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-24 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-60 left-40 h-80 w-80 rounded-full bg-blue-400/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200/50 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 dark:border-green-800/50 dark:from-green-900/20 dark:to-emerald-900/20">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Loved by Professionals
            </span>
          </div>

          <h2 className="mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl dark:from-gray-100 dark:to-gray-400">
            Join Thousands of Happy Users
          </h2>

          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            See why professionals choose NCAT for their media processing needs. Real results from
            real users.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto mb-20 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4"
        >
          {[
            { value: "15,000+", label: "Active Users" },
            { value: "2M+", label: "Files Processed" },
            { value: "99.9%", label: "Uptime SLA" },
            { value: "4.9/5", label: "User Rating" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-2xl border border-gray-200/50 bg-white/60 p-6 text-center backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/60"
            >
              <div className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-100">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="mb-20 grid gap-8 md:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="h-full border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:bg-gray-900/80">
                <CardContent className="p-8">
                  {/* Rating */}
                  <div className="mb-4 flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <Quote className="mb-4 h-8 w-8 text-gray-300 dark:text-gray-600" />

                  <p className="mb-6 leading-relaxed text-gray-700 italic dark:text-gray-300">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  {/* Metric Badge */}
                  <Badge
                    variant="secondary"
                    className="mb-6 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                  >
                    {testimonial.metric}
                  </Badge>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto max-w-5xl"
        >
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Enterprise-Grade Security & Reliability
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Built for businesses that demand the highest standards
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {trustIndicators.map((indicator, index) => {
              const Icon = indicator.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="rounded-2xl border border-gray-200/50 bg-white/60 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-blue-300 dark:border-gray-700/50 dark:bg-gray-800/60 dark:hover:border-blue-600"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                    className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </motion.div>

                  <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    {indicator.title}
                  </h4>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {indicator.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Final Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200/50 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 dark:border-green-800/50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Trusted by 10,000+ professionals worldwide
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Megaphone,
  GraduationCap,
  Video,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const audiences = [
  {
    icon: Video,
    title: "Content Creators & Podcasters",
    description: "Scale your content production with automated transcription, clip generation, and multi-platform optimization.",
    benefits: ["Faster content turnaround", "Multi-platform distribution", "Professional quality output"],
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30",
    stats: "10x faster content creation",
    popular: true
  },
  {
    icon: Megaphone,
    title: "Marketing Agencies",
    description: "Deliver premium media services to clients without the overhead. White-label solutions available.",
    benefits: ["Scalable client delivery", "Higher profit margins", "White-label options"],
    color: "from-purple-500 to-purple-600",
    bgColor: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30",
    stats: "3x more clients served",
    popular: false
  },
  {
    icon: GraduationCap,
    title: "Coaches & Educators",
    description: "Transform educational content into engaging, accessible formats with automated captions and transcripts.",
    benefits: ["Accessible learning content", "Course material optimization", "Student engagement boost"],
    color: "from-green-500 to-green-600",
    bgColor: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30",
    stats: "40% better engagement",
    popular: false
  },
  {
    icon: Users,
    title: "Video Production Teams",
    description: "Streamline post-production workflows with batch processing, automated editing, and quality enhancement.",
    benefits: ["Reduced post-production time", "Consistent quality output", "Team collaboration tools"],
    color: "from-orange-500 to-orange-600",
    bgColor: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30",
    stats: "60% faster delivery",
    popular: true
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 }
};

const cardHoverVariants = {
  hover: { scale: 1.02, y: -8 }
};

export function TargetAudience() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute bottom-20 left-20 w-72 h-72 bg-green-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-40 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 18,
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200/50 dark:border-green-800/50 mb-6">
            <Target className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Built for Professionals
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Trusted by Industry Leaders
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            From solo creators to enterprise teams, NCAT scales with your business.
            See how professionals are transforming their media workflows.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          {audiences.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <motion.div
                key={audience.title}
                variants={itemVariants}
                transition={{ duration: 0.8, ease: "easeOut" }}
                whileHover="hover"
              >
                <motion.div variants={cardHoverVariants} transition={{ duration: 0.3, ease: "easeOut" }} className="h-full">
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden relative">
                    {audience.popular && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1">
                          Popular
                        </Badge>
                      </div>
                    )}

                    <CardContent className="p-8">
                      {/* Icon and Title */}
                      <div className="flex items-start gap-4 mb-6">
                        <motion.div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${audience.bgColor} flex items-center justify-center flex-shrink-0`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className={`w-7 h-7 ${
                            audience.color === "from-blue-500 to-blue-600" ? "text-blue-600" :
                            audience.color === "from-purple-500 to-purple-600" ? "text-purple-600" :
                            audience.color === "from-green-500 to-green-600" ? "text-green-600" :
                            "text-orange-600"
                          }`} />
                        </motion.div>

                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                            {audience.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {audience.stats}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                        {audience.description}
                      </p>

                      {/* Benefits */}
                      <div className="space-y-3 mb-6">
                        {audience.benefits.map((benefit, benefitIndex) => (
                          <motion.div
                            key={benefitIndex}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: benefitIndex * 0.1 }}
                            className="flex items-center gap-3"
                          >
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {benefit}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* CTA */}
                      <motion.div
                        className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer">
                          See use cases
                        </span>
                        <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </motion.div>
                    </CardContent>

                    {/* Glow effect on hover */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${audience.color} opacity-0 blur-3xl -z-10`}
                      whileHover={{ opacity: 0.1, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
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
    description:
      "Scale your content production with automated transcription, clip generation, and multi-platform optimization.",
    benefits: [
      "Faster content turnaround",
      "Multi-platform distribution",
      "Professional quality output"
    ],
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30",
    stats: "10x faster content creation",
    popular: true
  },
  {
    icon: Megaphone,
    title: "Marketing Agencies",
    description:
      "Deliver premium media services to clients without the overhead. White-label solutions available.",
    benefits: ["Scalable client delivery", "Higher profit margins", "White-label options"],
    color: "from-purple-500 to-purple-600",
    bgColor: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30",
    stats: "3x more clients served",
    popular: false
  },
  {
    icon: GraduationCap,
    title: "Coaches & Educators",
    description:
      "Transform educational content into engaging, accessible formats with automated captions and transcripts.",
    benefits: [
      "Accessible learning content",
      "Course material optimization",
      "Student engagement boost"
    ],
    color: "from-green-500 to-green-600",
    bgColor: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30",
    stats: "40% better engagement",
    popular: false
  },
  {
    icon: Users,
    title: "Video Production Teams",
    description:
      "Streamline post-production workflows with batch processing, automated editing, and quality enhancement.",
    benefits: [
      "Reduced post-production time",
      "Consistent quality output",
      "Team collaboration tools"
    ],
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
    <section className="relative overflow-hidden bg-white py-24 dark:bg-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute bottom-20 left-20 h-72 w-72 rounded-full bg-green-400/10 blur-3xl"
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
          className="absolute top-40 right-40 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl"
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

      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200/50 bg-gradient-to-r from-green-50 to-blue-50 px-4 py-2 dark:border-green-800/50 dark:from-green-900/20 dark:to-blue-900/20">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Built for Professionals
            </span>
          </div>

          <h2 className="mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl dark:from-gray-100 dark:to-gray-400">
            Trusted by Industry Leaders
          </h2>

          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            From solo creators to enterprise teams, NCAT scales with your business. See how
            professionals are transforming their media workflows.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2"
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
                <motion.div
                  variants={cardHoverVariants}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-full"
                >
                  <Card className="relative h-full overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-2xl dark:bg-gray-900/80">
                    {audience.popular && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-1 text-xs text-white">
                          Popular
                        </Badge>
                      </div>
                    )}

                    <CardContent className="p-8">
                      {/* Icon and Title */}
                      <div className="mb-6 flex items-start gap-4">
                        <motion.div
                          className={`h-14 w-14 rounded-2xl bg-gradient-to-r ${audience.bgColor} flex flex-shrink-0 items-center justify-center`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon
                            className={`h-7 w-7 ${
                              audience.color === "from-blue-500 to-blue-600"
                                ? "text-blue-600"
                                : audience.color === "from-purple-500 to-purple-600"
                                  ? "text-purple-600"
                                  : audience.color === "from-green-500 to-green-600"
                                    ? "text-green-600"
                                    : "text-orange-600"
                            }`}
                          />
                        </motion.div>

                        <div className="flex-1">
                          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                            {audience.title}
                          </h3>
                          <div className="mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {audience.stats}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-300">
                        {audience.description}
                      </p>

                      {/* Benefits */}
                      <div className="mb-6 space-y-3">
                        {audience.benefits.map((benefit, benefitIndex) => (
                          <motion.div
                            key={benefitIndex}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: benefitIndex * 0.1 }}
                            className="flex items-center gap-3"
                          >
                            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {benefit}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* CTA */}
                      <motion.div
                        className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400">
                          See use cases
                        </span>
                        <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </motion.div>
                    </CardContent>

                    {/* Glow effect on hover */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${audience.color} -z-10 opacity-0 blur-3xl`}
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

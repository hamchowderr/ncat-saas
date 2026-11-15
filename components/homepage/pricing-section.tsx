"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ArrowRight,
  Zap,
  Crown,
  Rocket,
  Star,
  Users,
  Clock,
  Shield,
  Sparkles
} from "lucide-react";

const plans = [
  {
    name: "Forever Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with media processing",
    features: [
      "5 video transcriptions per month",
      "Basic audio/video combine",
      "Standard quality output",
      "Email support",
      "1 GB storage",
      "Watermarked outputs"
    ],
    buttonText: "Get Started Free",
    buttonVariant: "outline" as const,
    popular: false,
    icon: Zap,
    color: "from-gray-500 to-gray-600",
    bgColor: "from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/30"
  },
  {
    name: "Professional",
    price: "$29",
    period: "per month",
    description: "Everything you need for professional content creation",
    features: [
      "Unlimited video transcriptions",
      "Advanced audio/video processing",
      "HD quality output",
      "Priority support",
      "100 GB storage",
      "No watermarks",
      "Custom captions styling",
      "Batch processing",
      "API access"
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "default" as const,
    popular: true,
    icon: Crown,
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30"
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "Advanced features for teams and businesses",
    features: [
      "Everything in Professional",
      "4K/8K quality output",
      "White-label solutions",
      "24/7 phone support",
      "1 TB storage",
      "Team collaboration tools",
      "Advanced analytics",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    popular: false,
    icon: Rocket,
    color: "from-purple-500 to-purple-600",
    bgColor: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }
};

export function PricingSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-24 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl"
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
          className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl"
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

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-blue-50 px-4 py-2 dark:border-emerald-800/50 dark:from-emerald-900/20 dark:to-blue-900/20">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Simple, Transparent Pricing
            </span>
          </div>

          <h2 className="mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl dark:from-gray-100 dark:to-gray-400">
            Choose the Perfect Plan for You
          </h2>

          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            Start free and scale as you grow. No hidden fees, no surprises. Cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3"
        >
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -10 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transform">
                    <Badge className="border-2 border-white bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-2xl dark:border-gray-900">
                      <Star className="mr-1.5 h-4 w-4 fill-white" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card
                  className={`relative h-full overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-2xl dark:bg-gray-900/80 ${
                    plan.popular
                      ? "ring-2 ring-blue-500 ring-offset-4 dark:ring-offset-gray-900"
                      : ""
                  }`}
                >
                  <CardContent className={plan.popular ? "p-8 pt-12" : "p-8"}>
                    {/* Plan Header */}
                    <div className="mb-8 text-center">
                      <motion.div
                        className={`mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-r ${plan.bgColor} flex items-center justify-center`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon
                          className={`h-8 w-8 ${
                            plan.color === "from-gray-500 to-gray-600"
                              ? "text-gray-600"
                              : plan.color === "from-blue-500 to-blue-600"
                                ? "text-blue-600"
                                : "text-purple-600"
                          }`}
                        />
                      </motion.div>

                      <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {plan.name}
                      </h3>

                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                          {plan.price}
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">{plan.period}</span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
                    </div>

                    {/* Features List */}
                    <div className="mb-8 space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: featureIndex * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant={plan.buttonVariant}
                        size="lg"
                        className={`w-full font-semibold ${
                          plan.buttonVariant === "default"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                            : "border-2"
                        }`}
                      >
                        {plan.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="mx-auto mb-8 grid max-w-4xl gap-6 md:grid-cols-3">
            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-300">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">14-day free trial</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-300">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">No setup fees</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-300">
              <Clock className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">Cancel anytime</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            All plans include SSL encryption, 99.9% uptime SLA, and priority customer support.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Zap, Crown, Rocket, Sparkles } from "lucide-react";
import { createClient } from "@/lib/client";
import { useWorkspace } from "@/hooks/use-workspace";
import { CheckoutButton } from "./checkout-button";

interface BillingProduct {
  gateway_product_id: string;
  gateway_name: string;
  name: string;
  description: string | null;
  features: Record<string, any> | null;
  active: boolean;
  is_visible_in_ui: boolean;
}

interface BillingPrice {
  gateway_price_id: string;
  gateway_product_id: string;
  currency: string;
  amount: number;
  recurring_interval: string;
  recurring_interval_count: number;
  active: boolean;
  tier: string | null;
  free_trial_days: number | null;
  gateway_name: string;
}

interface PlanWithPrice {
  product: BillingProduct;
  price: BillingPrice;
  isCurrentPlan: boolean;
}

const planIcons: Record<string, any> = {
  free: Zap,
  pro: Crown,
  professional: Crown,
  business: Rocket,
  enterprise: Rocket
};

const planColors: Record<string, string> = {
  free: "from-gray-500 to-gray-600",
  pro: "from-blue-500 to-blue-600",
  professional: "from-blue-500 to-blue-600",
  business: "from-purple-500 to-purple-600",
  enterprise: "from-purple-500 to-purple-600"
};

/**
 * Plan Comparison Component
 *
 * Displays available billing plans with current subscription highlighting.
 * Uses React Query for data fetching with automatic caching and retry logic.
 */
export function PlanComparison() {
  const { data: workspace } = useWorkspace();

  // Fetch billing plans and current subscription
  const {
    data: plansData,
    isLoading,
    error
  } = useQuery({
    queryKey: ["billingPlans", workspace?.id],
    queryFn: async () => {
      if (!workspace) throw new Error("No workspace found");

      const supabase = createClient();

      // Get current subscription to highlight current plan
      const { data: customer } = await supabase
        .from("billing_customers")
        .select("gateway_customer_id")
        .eq("workspace_id", workspace.id)
        .eq("gateway_name", "stripe")
        .maybeSingle();

      let currentPlanId: string | null = null;
      let customerId: string | null = null;

      if (customer) {
        customerId = customer.gateway_customer_id;

        const { data: subscription } = await supabase
          .from("billing_subscriptions")
          .select("gateway_product_id")
          .eq("gateway_customer_id", customer.gateway_customer_id)
          .eq("status", "active")
          .order("current_period_end", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subscription) {
          currentPlanId = subscription.gateway_product_id;
        }
      }

      // Fetch all products and prices
      const { data: products, error: productsError } = await supabase
        .from("billing_products")
        .select("*")
        .order("name");

      if (productsError) throw productsError;

      const { data: prices, error: pricesError } = await supabase
        .from("billing_prices")
        .select("*")
        .order("amount");

      if (pricesError) throw pricesError;

      // Combine products with their prices
      const plansWithPrices =
        (products
          ?.map((product) => {
            const price = prices?.find((p) => p.gateway_product_id === product.gateway_product_id);
            if (!price) return null;

            return {
              product,
              price,
              isCurrentPlan: product.gateway_product_id === currentPlanId
            };
          })
          .filter((plan) => plan !== null) as PlanWithPrice[]) || [];

      return {
        plans: plansWithPrices,
        customerId
      };
    },
    enabled: !!workspace?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  const plans = plansData?.plans || [];
  const customerId = plansData?.customerId || null;

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const getPlanFeatures = (planName: string): string[] => {
    const name = planName.toLowerCase();

    if (name.includes("free")) {
      return [
        "Basic file processing",
        "Up to 10 API calls per month",
        "Community support",
        "Basic workspace management",
        "10 GB storage"
      ];
    } else if (name.includes("pro") || name.includes("professional")) {
      return [
        "Advanced file processing",
        "Up to 1,000 API calls per month",
        "Priority support",
        "Team collaboration",
        "25 GB storage",
        "Advanced analytics"
      ];
    } else if (name.includes("business") || name.includes("enterprise")) {
      return [
        "Unlimited file processing",
        "Unlimited API calls",
        "24/7 dedicated support",
        "Advanced analytics",
        "Custom integrations",
        "50 GB storage",
        "SLA guarantee"
      ];
    }

    return ["Contact support for details"];
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    for (const [key, Icon] of Object.entries(planIcons)) {
      if (name.includes(key)) return Icon;
    }
    return Zap;
  };

  const getPlanColor = (planName: string) => {
    const name = planName.toLowerCase();
    for (const [key, color] of Object.entries(planColors)) {
      if (name.includes(key)) return color;
    }
    return "from-gray-500 to-gray-600";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="mx-auto mb-4 h-10 w-[300px]" />
          <Skeleton className="mx-auto h-6 w-[400px]" />
          <Skeleton className="mx-auto mt-2 h-4 w-[500px]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-4">
                <Skeleton className="mb-4 h-12 w-12 rounded-xl" />
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="mt-2 h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-[120px]" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="mt-4 h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load billing plans"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (plans.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-purple-900/20">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Compare Plans & Upgrade
          </span>
        </div>
        <h2 className="text-2xl font-bold">Choose the Perfect Plan for Your Needs</h2>
        <p className="text-muted-foreground mt-2">
          Upgrade or downgrade anytime. No hidden fees, cancel anytime.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = getPlanIcon(plan.product.name);
          const color = getPlanColor(plan.product.name);
          const features = getPlanFeatures(plan.product.name);
          const isPopular = plan.product.name.toLowerCase().includes("pro");

          return (
            <Card
              key={plan.product.gateway_product_id}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                plan.isCurrentPlan ? "ring-2 ring-green-500 ring-offset-2" : ""
              } ${isPopular && !plan.isCurrentPlan ? "ring-2 ring-blue-500/50" : ""}`}
            >
              {plan.isCurrentPlan && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-green-500 text-white">Current Plan</Badge>
                </div>
              )}
              {isPopular && !plan.isCurrentPlan && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${color} bg-opacity-10`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{plan.product.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {plan.product.description || "Complete media processing solution"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {formatPrice(plan.price.amount, plan.price.currency)}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    /{plan.price.recurring_interval}
                  </span>
                </div>

                <div className="space-y-3">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  {plan.isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <CheckoutButton
                      priceId={plan.price.gateway_price_id}
                      planName={plan.product.name}
                      customerId={customerId || undefined}
                      className="w-full"
                      variant="default"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-muted-foreground mt-6 text-center text-sm">
        All plans include SSL encryption, 99.9% uptime SLA, and priority customer support.
      </div>
    </div>
  );
}

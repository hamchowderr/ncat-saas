"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, CreditCard, DollarSign, Package } from "lucide-react";
import { createClient } from "@/lib/client";
import { useWorkspace } from "@/hooks/use-workspace";
import { useUser } from "@/hooks/use-user";

interface Subscription {
  id: string;
  gateway_subscription_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  currency: string;
  is_trial: boolean;
  trial_ends_at: string | null;
  cancel_at_period_end: boolean;
  quantity: number;
  billing_products: {
    name: string;
    description: string;
    features: Record<string, any>;
  } | null;
  billing_prices: {
    amount: number;
    currency: string;
    recurring_interval: string;
    recurring_interval_count: number;
  } | null;
  // For the flattened response from our query
  name?: string;
  description?: string;
  features?: Record<string, any>;
  amount?: number;
  recurring_interval?: string;
  recurring_interval_count?: number;
}

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { workspace, loading: workspaceLoading } = useWorkspace();
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    async function fetchSubscription() {
      // Wait for both user and workspace to finish loading
      if (userLoading || workspaceLoading) {
        return;
      }

      // If user is loaded but there's no user, this is an auth issue, not workspace issue
      if (!user) {
        setError("Authentication required");
        setLoadingSubscription(false);
        return;
      }

      if (!workspace) {
        console.log("🔧 SubscriptionStatus: No workspace found. userLoading:", userLoading, "workspaceLoading:", workspaceLoading, "user:", user?.email, "workspace:", workspace);
        setError("No workspace found");
        setLoadingSubscription(false);
        return;
      }

      // Clear any previous error when workspace becomes available
      setError(null);
      console.log("🔧 SubscriptionStatus: Workspace found:", workspace);

      try {
        const supabase = createClient();

        // First get the customer for this workspace
        const { data: customer, error: customerError } = await supabase
          .from("billing_customers")
          .select("gateway_customer_id")
          .eq("workspace_id", workspace.id)
          .eq("gateway_name", "stripe")
          .single();

        if (!customer) {
          setSubscription(null);
          setLoadingSubscription(false);
          return;
        }

        // Fetch subscription with joined product and price data in a single query
        const { data, error: subError } = await supabase
          .from("billing_subscriptions")
          .select(`
            *,
            billing_products!inner(name, description, features),
            billing_prices!inner(amount, currency, recurring_interval, recurring_interval_count)
          `)
          .eq("gateway_customer_id", customer.gateway_customer_id)
          .order("status", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subError) {
          setError("Failed to fetch subscription");
          console.error("Subscription fetch error:", subError);
          setLoadingSubscription(false);
          return;
        }

        // Handle case where no subscription exists
        if (!data) {
          setSubscription(null);
          setLoadingSubscription(false);
          return;
        }

        // Map the joined data to the expected structure
        const subscriptionWithDetails = {
          ...data,
          name: data.billing_products?.name,
          description: data.billing_products?.description,
          features: data.billing_products?.features,
          amount: data.billing_prices?.amount,
          recurring_interval: data.billing_prices?.recurring_interval,
          recurring_interval_count: data.billing_prices?.recurring_interval_count
        };

        setSubscription(subscriptionWithDetails as Subscription);
      } catch (error) {
        setError("Failed to fetch subscription");
        console.error("Error fetching subscription:", error);
      } finally {
        setLoadingSubscription(false);
      }
    }

    fetchSubscription();
  }, [workspace, workspaceLoading, user, userLoading]);

  if (userLoading || workspaceLoading || loadingSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading subscription information...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>No active subscription found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You don&apos;t have an active subscription. Visit our pricing page to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trialing":
        return "bg-blue-100 text-blue-800";
      case "past_due":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
        return "bg-gray-100 text-gray-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase()
    }).format(amount / 100); // Stripe amounts are in cents
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Plan</span>
          <span>{subscription.name || subscription.billing_products?.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Status</span>
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>

        {subscription.is_trial && subscription.trial_ends_at && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Trial Ends</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(subscription.trial_ends_at)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-medium">Price</span>
          <span>
            {formatPrice(
              subscription.amount || subscription.billing_prices?.amount || 0,
              subscription.currency
            )}
            /{subscription.recurring_interval || subscription.billing_prices?.recurring_interval}
          </span>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Current Period</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(subscription.current_period_start)} -{" "}
              {formatDate(subscription.current_period_end)}
            </span>
          </div>

          {subscription.cancel_at_period_end && (
            <div className="flex items-center justify-between">
              <span className="font-medium text-yellow-600">Cancellation</span>
              <span className="text-yellow-600">Will cancel at period end</span>
            </div>
          )}
        </div>

        {(subscription.features || subscription.billing_products?.features) && (
          <>
            <Separator />
            <div>
              <h4 className="mb-2 font-medium">Plan Features</h4>
              <div className="text-muted-foreground space-y-2 text-sm">
                {(() => {
                  const features = subscription.features || subscription.billing_products?.features || {};

                  // Filter out technical metadata and show user-friendly features
                  const filteredFeatures = Object.entries(features).filter(([key]) =>
                    !key.startsWith('sync_') &&
                    !key.includes('_to_') &&
                    !key.includes('app') &&
                    key !== 'tier'
                  );

                  // If no user-friendly features, show plan-specific features based on plan name
                  if (filteredFeatures.length === 0) {
                    const planName = subscription.name || subscription.billing_products?.name || '';

                    if (planName.toLowerCase().includes('free')) {
                      return (
                        <ul className="space-y-1">
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Basic file processing
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Up to 10 API calls per month
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Community support
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Basic workspace management
                          </li>
                        </ul>
                      );
                    } else if (planName.toLowerCase().includes('pro')) {
                      return (
                        <ul className="space-y-1">
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Advanced file processing
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Up to 1,000 API calls per month
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Priority support
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Team collaboration
                          </li>
                        </ul>
                      );
                    } else if (planName.toLowerCase().includes('business') || planName.toLowerCase().includes('enterprise')) {
                      return (
                        <ul className="space-y-1">
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            Unlimited file processing
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            Unlimited API calls
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            24/7 dedicated support
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            Advanced analytics
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            Custom integrations
                          </li>
                        </ul>
                      );
                    }

                    return (
                      <p>Contact support for plan details</p>
                    );
                  }

                  // Show filtered user-friendly features
                  return (
                    <ul className="space-y-1">
                      {filteredFeatures.map(([feature, value]) => (
                        <li key={feature} className="flex items-center justify-between">
                          <span className="capitalize">{feature.replace(/[_-]/g, " ")}</span>
                          <span className="font-medium">{String(value)}</span>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

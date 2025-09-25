"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, CreditCard, DollarSign, Package } from "lucide-react";
import { createClient } from "@/lib/client";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const supabase = createClient();

        // Get the current user
        const {
          data: { user },
          error: authError
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        // First get the customer for this workspace
        const { data: customer, error: customerError } = await supabase
          .from("billing_customers")
          .select("gateway_customer_id")
          .eq("workspace_id", user.id)
          .eq("gateway_name", "stripe")
          .single();

        if (!customer) {
          setSubscription(null);
          setLoading(false);
          return;
        }

        // Then fetch subscription data only (we'll get product/price separately)
        const { data, error: subError } = await supabase
          .from("billing_subscriptions")
          .select("*")
          .eq("gateway_customer_id", customer.gateway_customer_id)
          .order("status", { ascending: false })
          .limit(1)
          .single();

        if (subError) {
          if (subError.code === "PGRST116") {
            setSubscription(null);
          } else {
            setError("Failed to fetch subscription");
            console.error("Subscription fetch error:", subError);
          }
          setLoading(false);
          return;
        }

        // Get product details
        const { data: product } = await supabase
          .from("billing_products")
          .select("name, description, features")
          .eq("gateway_product_id", data.gateway_product_id)
          .single();

        // Get price details
        const { data: price } = await supabase
          .from("billing_prices")
          .select("amount, currency, recurring_interval, recurring_interval_count")
          .eq("gateway_price_id", data.gateway_price_id)
          .single();

        // Combine the data
        const subscriptionWithDetails = {
          ...data,
          name: product?.name,
          description: product?.description,
          features: product?.features,
          amount: price?.amount,
          recurring_interval: price?.recurring_interval,
          recurring_interval_count: price?.recurring_interval_count,
          billing_products: product,
          billing_prices: price
        };

        setSubscription(subscriptionWithDetails as Subscription);
      } catch (error) {
        setError("Failed to fetch subscription");
        console.error("Error fetching subscription:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  if (loading) {
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
    }).format(amount);
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
          <span className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
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
              <ul className="text-muted-foreground space-y-1 text-sm">
                {Object.entries(
                  subscription.features || subscription.billing_products?.features || {}
                ).map(([feature, value]) => (
                  <li key={feature} className="flex items-center justify-between">
                    <span>{feature.replace("_", " ")}</span>
                    <span className="font-medium">{String(value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

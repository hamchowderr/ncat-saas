import { Suspense } from "react";
import { CustomerPortal } from "@/components/billing/customer-portal";
import { SubscriptionStatus } from "@/components/billing/subscription-status";
import { PlanComparison } from "@/components/billing/plan-comparison";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CreditCard, FileText, Settings } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="container mx-auto space-y-10 py-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription, billing information, and payment methods.
        </p>
      </div>

      {/* Current Subscription Status - Full Width */}
      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        }
      >
        <SubscriptionStatus />
      </Suspense>

      {/* Additional Information - 3 Column Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Payment Processor</span>
                <span className="font-medium">Stripe</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Security</span>
                <span className="font-medium">PCI DSS Compliant</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Encryption</span>
                <span className="font-medium">256-bit SSL</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Access your complete billing history, including invoices and receipts, through the
              Customer Portal.
            </p>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Billing Support</p>
              <p className="font-medium">support@ncat-saas.com</p>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Response Time</p>
              <p className="font-medium">Within 24 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Management - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Billing Management
          </CardTitle>
          <CardDescription>
            Access Stripe Customer Portal to manage payment methods and billing history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerPortal className="w-full" />
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Plan Comparison & Upgrade Section - Full Width */}
      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </CardContent>
          </Card>
        }
      >
        <PlanComparison />
      </Suspense>
    </div>
  );
}

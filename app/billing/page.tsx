import { Suspense } from "react";
import { CustomerPortal } from "@/components/billing/customer-portal";
import { SubscriptionStatus } from "@/components/billing/subscription-status";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, FileText, Settings } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="container mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription, billing information, and payment methods.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Subscription Status */}
        <div className="space-y-6">
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

          {/* Billing Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Billing Management
              </CardTitle>
              <CardDescription>
                Access Stripe Customer Portal to manage your subscription, payment methods, and
                billing history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerPortal className="w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="space-y-6">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>
                Your payment methods and billing details are securely managed by Stripe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Processor</span>
                  <span className="font-medium">Stripe</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Security</span>
                  <span className="font-medium">PCI DSS Compliant</span>
                </div>
                <div className="flex items-center justify-between">
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
              <CardDescription>View and download your invoices and receipts.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Access your complete billing history, including invoices and receipts, through the
                Customer Portal above.
              </p>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Contact our support team for billing questions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">Billing Support</p>
                <p className="text-muted-foreground">support@ncat-saas.com</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Response Time</p>
                <p className="text-muted-foreground">Within 24 hours</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

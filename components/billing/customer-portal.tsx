"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";

interface CustomerPortalProps {
  customerId?: string;
  className?: string;
}

export function CustomerPortal({ customerId, className }: CustomerPortalProps) {
  const [loading, setLoading] = useState(false);

  const handlePortalAccess = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/billing/portal", {
        method: customerId ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: customerId ? JSON.stringify({ customerId }) : undefined
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error accessing billing portal:", error);
      alert("Failed to access billing portal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handlePortalAccess} disabled={loading} className={className}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <ExternalLink className="mr-2 h-4 w-4" />
          Manage Billing
        </>
      )}
    </Button>
  );
}

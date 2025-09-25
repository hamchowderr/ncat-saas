"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createClient } from "@/lib/client"
import { useUser } from "@/hooks/use-user"
import { useWorkspace } from "@/hooks/use-workspace"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, CheckCircle } from "lucide-react"

const onboardingSchema = z.object({
  organizationName: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(50, "Organization name must not exceed 50 characters")
    .trim()
})

type OnboardingFormValues = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useUser()
  const { refreshWorkspace } = useWorkspace()

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      organizationName: ""
    }
  })

  const onSubmit = async (data: OnboardingFormValues) => {
    if (!user) {
      toast.error("User not found. Please try logging in again.")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Update the workspace name with the organization name
      const { error } = await supabase
        .from("workspaces")
        .update({ name: data.organizationName })
        .eq("id", user.id)

      if (error) {
        console.error("Error updating workspace:", error)
        toast.error("Failed to set up your organization. Please try again.")
        return
      }

      // Set up free subscription
      try {
        const subscriptionResponse = await fetch("/api/billing/subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!subscriptionResponse.ok) {
          // Log the error but don't block onboarding
          console.error("Failed to create subscription:", await subscriptionResponse.text())
          toast("Organization created! Billing setup will be completed shortly.", {
            description: "You can access billing settings later if needed."
          })
        } else {
          const subscriptionData = await subscriptionResponse.json()
          console.log("Free subscription created:", subscriptionData.subscriptionId)
        }
      } catch (subscriptionError) {
        // Log the error but don't block onboarding
        console.error("Subscription setup error:", subscriptionError)
      }

      // Clear signup email from localStorage as onboarding is complete
      localStorage.removeItem('signupEmail')

      // Refresh workspace context to get updated organization name
      await refreshWorkspace()

      toast.success("Welcome to your organization!")
      router.push("/workspace/file-manager")

    } catch (error) {
      console.error("Onboarding error:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome to NCAT SaaS!</CardTitle>
            <CardDescription>
              Your email has been confirmed. Let&apos;s set up your organization to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your organization name"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Setup
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
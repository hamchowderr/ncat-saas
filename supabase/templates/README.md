# Email Templates

This directory contains all email templates used by the NCAT SaaS application, organized by purpose.

## Directory Structure

```
templates/
├── auth/          Authentication emails
├── workspace/     Team collaboration emails
├── billing/       Subscription and payment emails
├── jobs/          Media processing notifications
├── security/      Account security alerts
└── marketing/     Product announcements and engagement
```

## Template Categories

### 🔐 auth/ - Authentication Emails

Templates for user authentication flows:

- **confirm_signup.html** ✅ - Email confirmation after signup
  - Triggered by: User registration
  - Variables: `{{ .SiteURL }}`, `{{ .TokenHash }}`
  - Expiration: 24 hours
  - Redirect: `/auth/onboarding`

- **password_reset.html** 🔜 - Password reset emails
  - Triggered by: "Forgot Password" flow
  - Variables: `{{ .SiteURL }}`, `{{ .TokenHash }}`
  - Redirect: `/auth/update-password`

- **email_change_confirmation.html** 🔜 - Email change verification
  - Triggered by: User changes email address
  - Variables: `{{ .SiteURL }}`, `{{ .TokenHash }}`, `{{ .NewEmail }}`

- **magic_link.html** 🔜 - Passwordless login
  - Triggered by: Magic link login request
  - Variables: `{{ .SiteURL }}`, `{{ .TokenHash }}`

### 👥 workspace/ - Team Collaboration

Templates for workspace member management:

- **invite.html** ✅ - Workspace invitation
  - Triggered by: Admin/Owner invites member
  - Variables: `{{ .ConfirmationURL }}`
  - API: `POST /api/workspace/invite`
  - Expiration: 24 hours

- **member_joined.html** 🔜 - New member notification
  - Triggered by: User accepts invitation
  - Variables: `{{ .MemberName }}`, `{{ .WorkspaceName }}`
  - Recipient: Existing workspace members

- **member_removed.html** 🔜 - Member removal notification
  - Triggered by: Admin removes member
  - Variables: `{{ .MemberName }}`, `{{ .WorkspaceName }}`
  - Recipient: Removed member

- **role_changed.html** 🔜 - Role update notification
  - Triggered by: Admin changes member role
  - Variables: `{{ .OldRole }}`, `{{ .NewRole }}`, `{{ .WorkspaceName }}`

### 💳 billing/ - Subscription & Payments

Templates for Stripe webhook events:

- **subscription_created.html** 🔜 - New subscription confirmation
  - Triggered by: `customer.subscription.created`
  - Variables: `{{ .PlanName }}`, `{{ .Amount }}`, `{{ .BillingInterval }}`

- **subscription_cancelled.html** 🔜 - Cancellation confirmation
  - Triggered by: `customer.subscription.deleted`
  - Variables: `{{ .PlanName }}`, `{{ .EndDate }}`
  - Include: Win-back offer

- **payment_succeeded.html** 🔜 - Payment receipt
  - Triggered by: `invoice.payment_succeeded`
  - Variables: `{{ .Amount }}`, `{{ .InvoiceNumber }}`, `{{ .InvoiceURL }}`

- **payment_failed.html** 🔜 - Payment failure alert
  - Triggered by: `invoice.payment_failed`
  - Variables: `{{ .Amount }}`, `{{ .RetryDate }}`, `{{ .UpdatePaymentURL }}`
  - Priority: HIGH (prevent churn)

- **trial_ending.html** 🔜 - Trial expiration reminder
  - Triggered by: 3 days before trial ends
  - Variables: `{{ .DaysRemaining }}`, `{{ .PlanName }}`, `{{ .UpgradeURL }}`

- **invoice_created.html** 🔜 - New invoice notification
  - Triggered by: `invoice.created`
  - Variables: `{{ .Amount }}`, `{{ .DueDate }}`, `{{ .InvoiceURL }}`

- **receipt.html** 🔜 - Payment receipt
  - Triggered by: `charge.succeeded`
  - Variables: `{{ .Amount }}`, `{{ .Date }}`, `{{ .ReceiptURL }}`

### ⚙️ jobs/ - Media Processing Notifications

Templates for NCAT API job completion:

- **processing_complete.html** 🔜 - Job completion notification
  - Triggered by: NCAT webhook when job completes
  - Variables: `{{ .JobId }}`, `{{ .JobType }}`, `{{ .ResultURL }}`, `{{ .Duration }}`
  - Webhook: `supabase/functions/ncat-webhook/index.ts`

- **processing_failed.html** 🔜 - Processing error alert
  - Triggered by: NCAT webhook when job fails
  - Variables: `{{ .JobId }}`, `{{ .JobType }}`, `{{ .ErrorMessage }}`

- **batch_complete.html** 🔜 - Batch processing summary
  - Triggered by: Multiple jobs complete
  - Variables: `{{ .TotalJobs }}`, `{{ .SuccessCount }}`, `{{ .FailureCount }}`

### 🔒 security/ - Account Security

Templates for security notifications:

- **password_changed.html** 🔜 - Password change confirmation
  - Triggered by: User changes password
  - Variables: `{{ .ChangeDate }}`, `{{ .IPAddress }}`

- **new_login.html** 🔜 - Unusual login alert
  - Triggered by: Login from new device/location
  - Variables: `{{ .LoginDate }}`, `{{ .Device }}`, `{{ .Location }}`

- **suspicious_activity.html** 🔜 - Security alert
  - Triggered by: Unusual account activity
  - Variables: `{{ .ActivityType }}`, `{{ .Date }}`

### 📢 marketing/ - Product & Engagement

Templates for user engagement:

- **welcome.html** 🔜 - Welcome email series
  - Triggered by: After email confirmation
  - Variables: `{{ .UserName }}`, `{{ .WorkspaceName }}`

- **feature_announcement.html** 🔜 - New feature notification
  - Triggered by: Manual send or scheduled
  - Variables: `{{ .FeatureName }}`, `{{ .FeatureDescription }}`, `{{ .LearnMoreURL }}`

- **maintenance_notice.html** 🔜 - Maintenance notification
  - Triggered by: Scheduled maintenance
  - Variables: `{{ .StartTime }}`, `{{ .Duration }}`, `{{ .EstimatedDowntime }}`

## Template Variables

### Supabase Built-in Variables

Available in all Supabase-native email templates:

- `{{ .SiteURL }}` - Base URL of your application
- `{{ .TokenHash }}` - Authentication token hash
- `{{ .Token }}` - Raw authentication token
- `{{ .Code }}` - OTP code (for SMS/OTP flows)
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Pre-built confirmation URL

### Custom Variables

For templates using the `send-email` Edge Function, you can pass any variables via the `html` parameter.

## Configuration

Email templates are configured in `supabase/config.toml`:

```toml
[auth.email.template.confirm_signup]
subject = "Confirm your signup"
content_path = "./supabase/templates/auth/confirm_signup.html"

[auth.email.template.invite]
subject = "You've been invited to join a workspace"
content_path = "./supabase/templates/workspace/invite.html"
```

## Email Delivery

### Supabase Native Emails

Authentication emails (signup confirmation, password reset, invitations) are sent automatically by Supabase:

- **Local Development**: Emails captured by Inbucket (http://localhost:54324)
- **Production**: Configure SMTP in `supabase/config.toml` or use Supabase email service

### Custom Emails

For custom transactional emails, use the `send-email` Edge Function:

```typescript
// Example: Send custom email
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: "user@example.com",
      subject: "Your media is ready!",
      html: emailTemplate,
      from: "NCAT SaaS <noreply@ncat-saas.com>"
    })
  }
);
```

**Edge Function**: `supabase/functions/send-email/index.ts`
**Email Provider**: Resend API
**Environment Variable**: `RESEND_API_KEY`

## Development Workflow

### 1. Testing Emails Locally

Supabase provides Inbucket for email testing:

```bash
# Start Supabase (includes Inbucket)
npx supabase start

# View emails at:
# http://localhost:54324
```

All emails sent during local development are captured here.

### 2. Creating New Templates

1. Create HTML file in appropriate folder (e.g., `auth/new_template.html`)
2. Use Supabase template variables: `{{ .VariableName }}`
3. Add configuration to `supabase/config.toml` if needed
4. Test in Inbucket

### 3. Template Design Guidelines

- **Responsive**: Use table-based layouts for email client compatibility
- **Inline CSS**: Email clients strip `<style>` tags
- **Alt text**: Always include alt text for images
- **Plain text fallback**: Consider providing text version
- **Test**: Use services like Litmus or Email on Acid

### 4. Brand Consistency

All templates should follow these brand guidelines:

- **Primary Color**: `#2563eb` (blue)
- **Font Family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Button Style**: Rounded corners (6px), bold text
- **Footer**: Include company info and unsubscribe link
- **Logo**: Include NCAT SaaS logo in header

## Integration Points

### Stripe Webhooks

Billing email triggers in `supabase/functions/stripe-webhook/index.ts`:

```typescript
// Events that should trigger emails:
- customer.subscription.created
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
- charge.succeeded
```

### NCAT Webhooks

Job notification triggers in `supabase/functions/ncat-webhook/index.ts`:

```typescript
// When job status changes to:
- "completed" → Send processing_complete.html
- "failed" → Send processing_failed.html
```

### Workspace Invitations

Invitation trigger in `app/api/workspace/invite/route.ts`:

```typescript
// Uses Supabase Admin API
await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
  data: { workspaceId, role },
  redirectTo: `${siteUrl}/auth/callback`
});
```

## Status Legend

- ✅ **Active** - Template exists and is in use
- 🔜 **Planned** - Template planned but not yet created
- ⚠️ **Deprecated** - Template no longer used
- 🚧 **In Progress** - Template being developed

## Environment Variables

Required for email functionality:

```bash
# Resend API (for custom transactional emails)
RESEND_API_KEY=re_your_api_key

# Base URL (for email links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase (for native emails)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Resources

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Resend Documentation](https://resend.com/docs)
- [Email Design Best Practices](https://really-good-emails.com/)
- [Can I Email?](https://www.caniemail.com/) - CSS support in email clients

## Future Enhancements

1. **Email Preferences**: User settings for notification opt-in/out
2. **Email Templates Admin**: UI for managing templates without code changes
3. **A/B Testing**: Test different email variations
4. **Analytics**: Track open rates, click-through rates
5. **Localization**: Multi-language email templates
6. **Drip Campaigns**: Automated email series for onboarding
7. **Digest Emails**: Daily/weekly summary emails
8. **Smart Sending**: Optimize send times based on user activity

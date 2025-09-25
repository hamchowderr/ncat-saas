# Integration Setup Guide

## Stripe CLI Integration

### Local Development Webhook Testing

```bash
# Forward webhooks to local development server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test specific events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted
stripe trigger payment_intent.succeeded
```

### Useful Stripe CLI Commands

```bash
# List customers
stripe customers list

# Create test subscription
stripe subscriptions create --customer cus_xxx --price price_xxx

# Monitor API calls
stripe logs tail

# Test webhook endpoints
stripe events resend evt_xxx
```

## Sentry MCP Setup

### Installation

```bash
claude mcp add sentry
```

### Configuration

- Requires Sentry API token
- Configure project access
- Set up error monitoring for production debugging

### Use Cases

- Real-time error investigation
- Performance monitoring
- Release tracking
- Issue management

## Integration Benefits

### Stripe CLI + Existing Webhook Handlers

- Test subscription lifecycle locally
- Debug payment flow issues
- Validate webhook processing logic
- Simulate error scenarios safely

### Sentry MCP + Production Monitoring

- Investigate errors directly from Claude
- Correlate issues with code changes
- Monitor application health
- Debug production issues faster

## TODO

- [ ] Set up Stripe CLI webhook forwarding
- [ ] Configure Sentry MCP server
- [ ] Test webhook event handling
- [ ] Validate error monitoring setup

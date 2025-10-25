 # MWPLU Donation System Setup Guide

This guide explains how to set up the complete donation system with Stripe payment processing and email notifications.

## 🚀 Overview

The donation system consists of:
- **Frontend**: Clean, minimalist donation form
- **Payment Processing**: Stripe payment links for secure transactions
- **Success/Failure Handling**: Dedicated pages for payment results
- **Email Notifications**: Automated receipt emails via Supabase Edge Functions
- **Analytics**: Donation tracking for insights

## 📋 Prerequisites

1. **Stripe Account**: With payment links configured
2. **Supabase Project**: For backend and email functionality
3. **Email Provider**: Configured in Supabase (e.g., SendGrid, Resend)

## 🔧 Setup Steps

### 1. Stripe Configuration

#### Configure Payment Links in Stripe Dashboard:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Payment Links**
3. Create payment links for each preset amount (5€, 10€, 15€, etc.)
4. Set success URL: `https://yourdomain.com/donation/success?amount={CHECKOUT_SESSION_LINE_ITEMS_PRICE_UNIT_AMOUNT}`
5. Set cancel URL: `https://yourdomain.com/donation/cancel`

#### Update Payment Links in Code:
```javascript
// Update these URLs in src/composables/useDonation.js
const DONATION_LINKS = {
  5: "your-stripe-payment-link-for-5-euros",
  10: "your-stripe-payment-link-for-10-euros",
  // ... etc
}
```

### 2. Supabase Edge Function for Email

Create a new Edge Function in your Supabase project:

```sql
-- First, create the donations table for tracking
CREATE TABLE donations (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  reference VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'stripe',
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS policy if needed
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
```

#### Edge Function Code (`supabase/functions/send-donation-email/index.ts`):

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, text } = await req.json()

    // Initialize email service (example with Resend)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MWPLU <noreply@mwplu.com>',
        to: [to],
        subject,
        html,
        text,
      }),
    })

    const result = await emailResponse.json()

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

### 3. Environment Variables

Add to your `.env` file:

```env
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Supabase (already configured)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# In Supabase Edge Function environment:
RESEND_API_KEY=re_...
```

### 4. Stripe Webhook (Optional but Recommended)

For production, set up webhooks to handle payment events:

1. **Create Webhook Endpoint** in Stripe Dashboard
2. **Set Endpoint URL**: `https://your-supabase-url.com/functions/v1/stripe-webhook`
3. **Select Events**: `checkout.session.completed`, `payment_intent.succeeded`

#### Webhook Handler (`supabase/functions/stripe-webhook/index.ts`):

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
  
  // Verify webhook signature
  // ... signature validation logic
  
  const event = JSON.parse(body)
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    
    // Process donation completion
    const donationData = {
      amount: session.amount_total / 100,
      reference: session.id,
      email: session.customer_details.email,
      paymentMethod: 'Carte bancaire'
    }
    
    // Send email notification
    // ... call email service
    
    // Track donation
    // ... insert into database
  }
  
  return new Response('OK', { status: 200 })
})
```

## 🎨 Customization

### Email Templates
Modify email templates in `src/services/donationService.js`:
- Update styling to match your brand
- Add more detailed receipt information
- Include tax deduction information if applicable

### Payment Amounts
Update preset amounts in `src/composables/useDonation.js`:
```javascript
const presetAmounts = [5, 10, 15, 20, 30, 50, 100] // Modify as needed
```

### Success/Cancel Pages
Customize the success and cancel pages:
- `src/views/DonationSuccessView.vue`
- `src/views/DonationCancelView.vue`

## 🧪 Testing

### Test Payments
1. Use Stripe test mode with test card numbers
2. Test success flow: `4242 4242 4242 4242`
3. Test decline: `4000 0000 0000 0002`

### Test Email Notifications
1. Set up email provider in test mode
2. Use test email addresses
3. Check email delivery and formatting

## 🚀 Production Deployment

### Final Checklist:
- [ ] Switch Stripe to live mode
- [ ] Update payment links with production URLs
- [ ] Configure production email provider
- [ ] Set up Stripe webhooks
- [ ] Test complete flow end-to-end
- [ ] Monitor error logs

## 📊 Analytics & Monitoring

The system tracks donations in the `donations` table. You can create dashboards to monitor:
- Total donations over time
- Average donation amount
- Most popular donation amounts
- Donation success rates

## 🛟 Support

For issues with the donation system:
1. Check Stripe Dashboard for payment status
2. Review Supabase logs for email delivery
3. Monitor browser console for client-side errors
4. Check network requests for API failures

## 🔒 Security Considerations

- Payment processing handled entirely by Stripe (PCI compliant)
- Webhook signature validation for production
- No sensitive payment data stored locally
- Email notifications sent server-side only
- HTTPS required for production

---

**Donation System Status**: ✅ Ready for production with proper configuration
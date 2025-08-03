# Contact Form Integration Setup

This document explains how to set up the contact form to send messages via Discord, Telegram, or email.

## Environment Variables

Add the following variables to your `.env` file:

```env
# Discord Webhook (Recommended - Easiest setup)
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL

# Email fallback handled by Supabase Edge Function
# (Uses your existing Supabase setup + Resend API)
```

## Setup Instructions

### Option 1: Discord Webhook (Recommended)

1. **Create Discord Server** (if you don't have one)
2. **Go to Server Settings** → Integrations → Webhooks
3. **Create New Webhook**
4. **Copy the Webhook URL** and add it to your `.env` file
5. **Test**: Submit a contact form and check your Discord channel

### Option 2: Telegram Bot

1. **Create a Bot**:
   - Message `@BotFather` on Telegram
   - Use `/newbot` command
   - Get your bot token

2. **Get Chat ID**:
   - Add the bot to your channel/group
   - Send a message to the channel
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find your chat ID in the response

3. **Add to `.env`**:

   ```env
   VITE_TELEGRAM_BOT_TOKEN=your_bot_token
   VITE_TELEGRAM_CHAT_ID=your_chat_id
   ```

### Option 3: Email Fallback (Automatic)

If Discord fails, the system will try to send via email using a Supabase Edge Function.

1. **Create Edge Function** in Supabase:

  ```typescript
  // supabase/functions/send-contact-email/index.ts
  import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  serve(async (req) => {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    try {
      const { name, email, subject, message, messageId } = await req.json()

      // Use Resend API or your preferred email service
      const resendApiKey = Deno.env.get('RESEND_API_KEY')
      const targetEmail = Deno.env.get('CONTACT_EMAIL') || 'contact@mwplu.com'
      
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'MWPLU Contact <noreply@mwplu.com>',
          to: [targetEmail],
          subject: `Contact Form: ${subject}`,
          html: `
            <h3>Nouveau message de contact</h3>
            <p><strong>Nom:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Sujet:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            ${messageId ? `<p><small>ID: ${messageId}</small></p>` : ''}
          `,
        }),
      })

      const result = await emailResponse.json()

      return new Response(
        JSON.stringify({ success: true, data: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }
  })
  ```

2. **Add Environment Variables** in Supabase Dashboard:

   - `RESEND_API_KEY`: Your Resend API key
   - `CONTACT_EMAIL`: Email where you want to receive messages

## Database Setup

The contact form also saves messages to a `contact_messages` table for backup and tracking.

Create this table in Supabase:

```sql
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage contact messages
CREATE POLICY "Allow service role access" ON contact_messages
  FOR ALL USING (auth.role() = 'service_role');
```

## Testing

1. **Fill out the contact form** on your website
2. **Check your Discord** for the message
3. **Verify in Supabase** that the message was saved to the database
4. **Test failure case** by temporarily removing the Discord webhook URL from your `.env` file (should show error)

## Delivery Strategy

The system sends messages via **Discord webhook only**:

1. **Discord** (if webhook URL is provided) - Primary delivery method
2. **Database backup** (always saves, even if delivery fails)

**Benefits:**
- ✅ **Instant notification** - Messages appear immediately in Discord
- ✅ **Reliable delivery** - Direct webhook integration
- ✅ **Rich formatting** - Discord embeds with proper styling
- ✅ **Simple setup** - Only requires Discord webhook URL

## Troubleshooting

- **Check browser console** for error messages
- **Verify environment variables** are properly set
- **Test webhooks directly** using curl or Postman
- **Check Supabase logs** for Edge Function errors
- **Verify database permissions** for contact_messages table
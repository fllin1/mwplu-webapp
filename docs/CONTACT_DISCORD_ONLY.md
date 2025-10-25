# Contact Form - Discord Only Setup

## Overview
The contact form now uses **Discord webhook only** for reliable message delivery. Email functionality has been removed to simplify the system.

## Required Environment Variables

Add this to your project's `.env` file:

```env
# Discord Webhook Configuration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url_here
```

## Discord Setup Steps

### 1. **Create Discord Webhook**
- Go to your Discord server
- Navigate to **Server Settings → Integrations → Webhooks**  
- Click **Create Webhook**
- Choose the channel for contact messages
- Copy the **Webhook URL**

### 2. **Configure Environment Variable**
```bash
# In your .env file
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz
```

## Contact Service Features

### **📧 Rich Discord Messages**
- **Styled embeds** with MWPLU branding
- **Contact details** clearly formatted  
- **Message content** with proper formatting
- **Timestamp** and message ID tracking

### **🛡️ Error Handling**
- **Field validation** for required inputs
- **Webhook URL verification** before sending
- **Discord response checking** for errors
- **Database backup** regardless of delivery status

### **🎯 Simple Integration**
- **Single webhook URL** configuration
- **Direct Discord API** calls
- **No external email services** required
- **Immediate notification** delivery

## Database Backup

### **All messages are saved** to the `contact_messages` table:
- **Name, email, subject, message** - Full contact details
- **Status tracking** - 'sent_discord', 'failed', etc.
- **Timestamp** - When message was submitted
- **Message ID** - Unique identifier for tracking

## Testing

### **Test the Contact Form:**
1. **Fill out contact form** on your website
2. **Check Discord channel** for immediate notification
3. **Verify in Supabase** that message was saved to database
4. **Test failure case** by removing webhook URL (should show error)

### **Expected Behavior:**
- **✅ Form submission** → Success without errors
- **✅ Discord notification** → Immediate Discord message with rich formatting
- **✅ Database record** → Message saved with 'sent_discord' status
- **✅ User feedback** → "Envoyé avec succès via Discord"

## Benefits of Discord-Only

### **✅ Simplicity**
- **Single integration point** - only Discord webhook needed
- **No email service setup** - no SMTP configuration required
- **Immediate delivery** - no email delays or spam filtering
- **Easy troubleshooting** - fewer moving parts

### **✅ Reliability**
- **Direct API calls** - no intermediate email services
- **Rich formatting** - Discord embeds look professional
- **Real-time notifications** - instant alerts to your team
- **Status tracking** - clear success/failure indicators

### **✅ User Experience**
- **Fast feedback** - immediate success confirmation
- **Clear messaging** - users know message was delivered
- **Consistent behavior** - no fallback complexity
- **Professional appearance** - well-formatted Discord embeds

## Troubleshooting

### **Common Issues:**

**❌ "Le canal Discord a échoué"**
- ✅ **Fix**: Check `DISCORD_WEBHOOK_URL` is set correctly
- ✅ **Fix**: Verify webhook URL is valid and active
- ✅ **Fix**: Check Discord channel permissions

**❌ Discord message not appearing**
- ✅ **Fix**: Verify webhook points to correct channel
- ✅ **Fix**: Check Discord server permissions
- ✅ **Fix**: Test webhook URL directly

**❌ Form submission errors**
- ✅ **Fix**: Check browser console for detailed errors
- ✅ **Fix**: Verify all required fields are filled
- ✅ **Fix**: Check network connectivity

This simplified setup ensures reliable, immediate contact form delivery without email complexity! 📬✨
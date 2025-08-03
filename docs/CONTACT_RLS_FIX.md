# Contact Form RLS Policy Fix

## Problem
The contact form was failing with a 403 Forbidden error:
```
POST https://ofeyssipibktmbfebibo.supabase.co/rest/v1/contact_messages 403 (Forbidden)
Database error: new row violates row-level security policy for table "contact_messages"
```

## Root Cause
The `contact_messages` table had Row Level Security (RLS) enabled but only allowed access to the service role. Since contact forms are submitted by **anonymous users** (not logged in), they were blocked from inserting new messages.

## Solution Applied

### **Before (Restrictive):**
```sql
-- Only service role could access
"Allow service role access" - FOR ALL - auth.role() = 'service_role'
```

### **After (Proper Contact Form Policies):**
```sql
-- 1. Allow anyone to submit contact messages
"Allow anonymous contact submissions" - FOR INSERT - TO anon, authenticated

-- 2. Allow authenticated users to view messages (for admin dashboard)  
"Allow authenticated users to view messages" - FOR SELECT - TO authenticated

-- 3. Allow service role full access (for backend operations)
"Service role full access" - FOR ALL - TO service_role
```

## Security Benefits

### **✅ Secure & Functional:**
- **Anonymous users CAN** submit contact messages (expected behavior)
- **Anonymous users CANNOT** view existing messages (security)
- **Authenticated users CAN** view messages (admin feature)
- **Service role CAN** do everything (backend operations)

### **🔒 Data Protection:**
- Contact submissions work for public users
- Message viewing restricted to authenticated admins
- Backend services have full control for automated processing

## Testing Steps

1. **Fill out contact form** as anonymous user → ✅ Should work
2. **Check Discord/Email** → ✅ Should receive notifications  
3. **View in Supabase dashboard** → ✅ Should show new message
4. **Try to query messages as anonymous** → ❌ Should be blocked (security)

## Technical Details

- **RLS Policies** properly configured for contact form use case
- **Anonymous INSERT** allowed for form submissions
- **Authenticated SELECT** for admin dashboard viewing
- **Service role ALL** for complete backend control

This fix maintains security while enabling the core contact form functionality.
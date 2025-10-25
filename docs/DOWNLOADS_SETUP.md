# Downloads Table Setup

## Current Issues and Fixes

### Issues Found:
1. **PluSourcesTab downloads were not being tracked** - Only analytics tracking, no database tracking
2. **Dashboard queries missing data** - Table structure mismatch
3. **Only PluSynthesisView was tracking downloads** - Other download sources weren't tracked

### Database Table Structure

The `downloads` table should have these fields:
```sql
CREATE TABLE downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT DEFAULT 'pdf',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Users can only see their own downloads
CREATE POLICY "Users can view own downloads" ON downloads
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own downloads
CREATE POLICY "Users can insert own downloads" ON downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Fixed Components

### 1. PluSourcesTab.vue
- ✅ Added `dbService` import
- ✅ Added proper `dbService.trackDownload()` call
- ✅ Maintains both database tracking and analytics tracking
- ✅ Better error handling and user feedback

### 2. Dashboard Downloads Display
- ✅ Fixed queries to match actual table structure
- ✅ Simplified display (document_id instead of non-existent city/zone fields)
- ✅ Proper error handling

## Download Tracking Locations

Now downloads are tracked in:

1. **PluSynthesisView.vue** - PDF downloads from main synthesis page
2. **PluSourcesTab.vue** - Downloads from the sources/downloads tab
3. **Dashboard shows all tracked downloads** - Recent downloads with proper data

## Testing Downloads

### Test the Download Tracking:

1. **Go to a PLU document page**
2. **Click on Downloads tab**
3. **Click download button** (PDF, DOCX, etc.)
4. **Check the downloads table** in Supabase for new entry
5. **Check dashboard** - should show the download in recent downloads

### Expected Database Entry:
```json
{
  "id": "uuid-here",
  "document_id": "document-slug-here", 
  "user_id": "user-uuid-here",
  "type": "pdf",
  "created_at": "2024-01-01T10:00:00Z"
}
```

### Expected Dashboard Display:
- Download date
- Download type (PDF, DOCX, etc.)
- Document ID
- Should appear in "Recent Downloads" section

## Troubleshooting

### If downloads still don't appear in dashboard:

1. **Check browser console** for JavaScript errors
2. **Verify user is authenticated** - downloads only tracked for logged-in users
3. **Check Supabase downloads table** - verify entries are being created
4. **Check user_id matching** - dashboard user_id should match downloads user_id
5. **Refresh dashboard page** to reload data

### If downloads aren't being tracked:

1. **Check browser console** for tracking errors
2. **Verify Supabase connection** and table permissions
3. **Check RLS policies** - ensure user can insert downloads
4. **Test with a simple manual query** in Supabase SQL editor

### Manual Test Query:
```sql
-- Check if downloads are being created
SELECT * FROM downloads WHERE user_id = 'your-user-id' ORDER BY created_at DESC LIMIT 5;

-- Check table structure
\d downloads;
```

## Implementation Notes

- Downloads are tracked **asynchronously** - tracking failures won't block the download
- **Analytics** and **database tracking** happen independently
- **Mock downloads** in PluSourcesTab still get tracked (useful for testing)
- **Real downloads** in PluSynthesisView also get tracked
- Dashboard shows **both real and mock downloads** for testing purposes

The system is now properly tracking all download attempts and displaying them in the user dashboard.
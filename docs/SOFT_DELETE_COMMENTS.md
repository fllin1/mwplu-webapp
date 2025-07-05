# Soft Delete for Comments

## Overview

The comments system now implements soft delete functionality, which means deleted comments are not immediately removed from the database but are instead marked as deleted and hidden from normal views.

## How It Works

### 1. Database Structure
- Added `deleted_at` column to the `comments` table
- When a comment is "deleted", the `deleted_at` timestamp is set
- Comments with `deleted_at IS NULL` are considered active
- Comments with a `deleted_at` value are considered deleted

### 2. Visibility
- The RLS policy automatically filters out deleted comments from normal queries
- Only non-deleted comments (`deleted_at IS NULL`) are visible to users
- Deleted comments can still be accessed through the `deleted_comments` view (for admin purposes)
- The `deleted_comments` view no longer exposes user emails for security reasons

### 3. Soft Delete Process
- Uses a database function `soft_delete_comment()` to handle the deletion
- This function runs with SECURITY DEFINER to bypass RLS restrictions
- Ensures users can only delete their own comments

### 4. Retention Period
- Deleted comments are kept for 30 days by default
- After 30 days, they can be permanently removed using the cleanup function

## Available Functions

### 1. Cleanup Old Deleted Comments
```sql
-- Permanently delete comments that have been soft-deleted for more than 30 days
SELECT cleanup_deleted_comments();

-- Or specify a custom retention period (e.g., 60 days)
SELECT cleanup_deleted_comments(60);
```

### 2. Restore a Deleted Comment
```sql
-- Restore a specific comment by ID
SELECT restore_comment('comment-uuid-here');
```

### 3. View Deleted Comments
```sql
-- View all soft-deleted comments
SELECT * FROM deleted_comments;
```

## Setting Up Scheduled Cleanup

To automatically clean up old deleted comments, you can set up a scheduled job using:

1. **Supabase Cron Jobs** (if available in your plan)
2. **External scheduler** (e.g., GitHub Actions, cron job on a server)
3. **Manual periodic cleanup**

Example cron job SQL:
```sql
-- Run cleanup every day at 2 AM
SELECT cron.schedule(
    'cleanup-deleted-comments',
    '0 2 * * *',
    'SELECT cleanup_deleted_comments();'
);
```

## Benefits

1. **Data Recovery**: Accidentally deleted comments can be restored within the retention period
2. **Audit Trail**: Maintains a record of deleted content for compliance/moderation
3. **Performance**: Deleted comments don't clutter the main table queries
4. **Flexibility**: Retention period can be adjusted based on requirements

## Security Considerations

- Users can only soft-delete their own comments
- The `deleted_comments` view should be restricted to administrators
- The `restore_comment` function should be restricted to administrators
- Regular cleanup prevents indefinite data retention 
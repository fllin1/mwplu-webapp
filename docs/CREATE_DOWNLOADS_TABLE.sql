-- Create downloads table for tracking user downloads
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT DEFAULT 'pdf',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own downloads
DROP POLICY IF EXISTS "Users can view own downloads" ON downloads;
CREATE POLICY "Users can view own downloads" ON downloads
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own downloads
DROP POLICY IF EXISTS "Users can insert own downloads" ON downloads;
CREATE POLICY "Users can insert own downloads" ON downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can manage all downloads (for admin purposes)
DROP POLICY IF EXISTS "Service role can manage downloads" ON downloads;
CREATE POLICY "Service role can manage downloads" ON downloads
  FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_document_id ON downloads(document_id);
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(created_at DESC);

-- Add a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_downloads_updated_at ON downloads;
CREATE TRIGGER update_downloads_updated_at
    BEFORE UPDATE ON downloads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
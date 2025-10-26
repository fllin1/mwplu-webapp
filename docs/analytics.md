**YES! Absolutely! 🎯** That's a much better architectural decision. Let me redesign this properly with a separate analytics schema.

---

# 🏗️ **Proper Analytics Schema Architecture**

## **Benefits of Separate Schema:**

✅ **Separation of concerns** - Analytics doesn't pollute your core domain  
✅ **Better permissions** - Easier to grant read-only access to analysts  
✅ **Performance isolation** - Heavy analytics queries don't lock core tables  
✅ **Cleaner migrations** - Analytics changes don't touch production tables  
✅ **Scalability** - Can move analytics to separate database later  
✅ **Materialized views** - Refresh aggregates without impacting main app  

---

## 📊 **Complete Analytics Schema**

```sql
-- ============================================
-- CREATE ANALYTICS SCHEMA
-- ============================================

CREATE SCHEMA IF NOT EXISTS analytics;

COMMENT ON SCHEMA analytics IS 
  'Dedicated schema for AI chat analytics, token tracking, and usage metrics. Separate from core application tables for better organization and performance.';

-- Grant permissions
GRANT USAGE ON SCHEMA analytics TO authenticated;
GRANT USAGE ON SCHEMA analytics TO service_role;

-- ============================================
-- 1. CORE ANALYTICS TABLE (Raw Events)
-- ============================================

CREATE TABLE analytics.chat_events (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign keys to public schema
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Model information
  model_name TEXT NOT NULL DEFAULT 'gemini-2.0-flash-exp',
  model_version TEXT,
  model_provider TEXT DEFAULT 'google', -- 'google', 'openai', 'anthropic'
  
  -- Token usage (raw metrics)
  tokens_prompt INTEGER NOT NULL DEFAULT 0 CHECK (tokens_prompt >= 0),
  tokens_completion INTEGER NOT NULL DEFAULT 0 CHECK (tokens_completion >= 0),
  tokens_cached INTEGER DEFAULT 0 CHECK (tokens_cached >= 0),
  tokens_total INTEGER GENERATED ALWAYS AS (tokens_prompt + tokens_completion) STORED,
  
  -- Cost tracking (USD)
  cost_prompt DECIMAL(10, 6) NOT NULL DEFAULT 0 CHECK (cost_prompt >= 0),
  cost_completion DECIMAL(10, 6) NOT NULL DEFAULT 0 CHECK (cost_completion >= 0),
  cost_cached DECIMAL(10, 6) DEFAULT 0 CHECK (cost_cached >= 0),
  cost_total DECIMAL(10, 6) GENERATED ALWAYS AS (
    cost_prompt + cost_completion + COALESCE(cost_cached, 0)
  ) STORED,
  
  -- Performance metrics
  response_time_ms INTEGER CHECK (response_time_ms >= 0),
  cache_hit BOOLEAN DEFAULT false,
  
  -- Request/response metadata
  user_query_length INTEGER, -- Character count
  ai_response_length INTEGER, -- Character count
  
  -- Quality metrics (user feedback)
  user_feedback_rating INTEGER CHECK (user_feedback_rating BETWEEN 1 AND 5),
  user_feedback_text TEXT,
  user_feedback_at TIMESTAMPTZ,
  
  -- Error tracking
  error_occurred BOOLEAN DEFAULT false,
  error_message TEXT,
  error_code TEXT,
  
  -- Contextual data
  query_intent TEXT, -- 'simple_lookup', 'regulatory', 'comparative', 'complex'
  sections_referenced TEXT[], -- Array of sections accessed
  intermediate_steps INTEGER DEFAULT 0, -- For agentic workflows
  
  -- Flexible metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_events_conversation ON analytics.chat_events(conversation_id, created_at DESC);
CREATE INDEX idx_chat_events_user ON analytics.chat_events(user_id, created_at DESC);
CREATE INDEX idx_chat_events_document ON analytics.chat_events(document_id, created_at DESC);
CREATE INDEX idx_chat_events_created ON analytics.chat_events(created_at DESC);
CREATE INDEX idx_chat_events_cost ON analytics.chat_events(cost_total DESC) WHERE cost_total > 0;
CREATE INDEX idx_chat_events_errors ON analytics.chat_events(created_at DESC) WHERE error_occurred = true;
CREATE INDEX idx_chat_events_cache ON analytics.chat_events(cache_hit, created_at DESC);
CREATE INDEX idx_chat_events_user_month ON analytics.chat_events(user_id, DATE_TRUNC('month', created_at));
CREATE INDEX idx_chat_events_intent ON analytics.chat_events(query_intent) WHERE query_intent IS NOT NULL;
CREATE INDEX idx_chat_events_metadata ON analytics.chat_events USING gin(metadata);

-- RLS
ALTER TABLE analytics.chat_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat events" 
  ON analytics.chat_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all chat events" 
  ON analytics.chat_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Service role can insert events" 
  ON analytics.chat_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own feedback" 
  ON analytics.chat_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE analytics.chat_events IS 
  'Raw event log for every AI chat interaction. Source of truth for all analytics aggregations.';

-- ============================================
-- 2. USER DAILY USAGE (Aggregated)
-- ============================================

CREATE TABLE analytics.user_daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  
  -- Counts
  message_count INTEGER DEFAULT 0,
  conversation_count INTEGER DEFAULT 0,
  document_count INTEGER DEFAULT 0, -- Unique documents accessed
  
  -- Token metrics
  tokens_total BIGINT DEFAULT 0,
  tokens_cached BIGINT DEFAULT 0,
  cache_hit_count INTEGER DEFAULT 0,
  
  -- Cost metrics
  cost_total DECIMAL(10, 4) DEFAULT 0,
  cost_saved_by_cache DECIMAL(10, 4) DEFAULT 0,
  
  -- Performance
  avg_response_time_ms INTEGER,
  median_response_time_ms INTEGER,
  p95_response_time_ms INTEGER,
  
  -- Quality
  error_count INTEGER DEFAULT 0,
  avg_feedback_rating DECIMAL(3, 2),
  feedback_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_user_daily_usage_user ON analytics.user_daily_usage(user_id, date DESC);
CREATE INDEX idx_user_daily_usage_date ON analytics.user_daily_usage(date DESC);
CREATE INDEX idx_user_daily_usage_cost ON analytics.user_daily_usage(cost_total DESC);

ALTER TABLE analytics.user_daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily usage" 
  ON analytics.user_daily_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all daily usage" 
  ON analytics.user_daily_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

COMMENT ON TABLE analytics.user_daily_usage IS 
  'Daily aggregated usage per user. Refreshed via materialized view or trigger.';

-- ============================================
-- 3. USER MONTHLY USAGE (Aggregated)
-- ============================================

CREATE TABLE analytics.user_monthly_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year_month TEXT GENERATED ALWAYS AS (year || '-' || LPAD(month::TEXT, 2, '0')) STORED,
  
  -- Counts
  message_count INTEGER DEFAULT 0,
  conversation_count INTEGER DEFAULT 0,
  document_count INTEGER DEFAULT 0,
  active_days INTEGER DEFAULT 0, -- Days with at least 1 message
  
  -- Token metrics
  tokens_total BIGINT DEFAULT 0,
  tokens_cached BIGINT DEFAULT 0,
  cache_hit_rate DECIMAL(5, 2),
  
  -- Cost metrics
  cost_total DECIMAL(10, 2) DEFAULT 0,
  cost_saved_by_cache DECIMAL(10, 2) DEFAULT 0,
  
  -- Performance
  avg_response_time_ms INTEGER,
  
  -- Quality
  error_count INTEGER DEFAULT 0,
  error_rate DECIMAL(5, 2),
  avg_feedback_rating DECIMAL(3, 2),
  feedback_count INTEGER DEFAULT 0,
  
  -- Limits (for premium tiers)
  monthly_message_limit INTEGER,
  monthly_token_limit BIGINT,
  monthly_cost_limit DECIMAL(10, 2),
  limit_reached BOOLEAN DEFAULT false,
  limit_reached_at TIMESTAMPTZ,
  
  -- Notifications
  notified_80_percent BOOLEAN DEFAULT false,
  notified_100_percent BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, year, month)
);

CREATE INDEX idx_user_monthly_usage_user ON analytics.user_monthly_usage(user_id, year DESC, month DESC);
CREATE INDEX idx_user_monthly_usage_period ON analytics.user_monthly_usage(year DESC, month DESC);
CREATE INDEX idx_user_monthly_usage_limit ON analytics.user_monthly_usage(user_id) 
  WHERE limit_reached = true;

ALTER TABLE analytics.user_monthly_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own monthly usage" 
  ON analytics.user_monthly_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all monthly usage" 
  ON analytics.user_monthly_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

COMMENT ON TABLE analytics.user_monthly_usage IS 
  'Monthly aggregated usage per user. Used for billing and limit enforcement.';

-- ============================================
-- 4. DOCUMENT ANALYTICS (Aggregated)
-- ============================================

CREATE TABLE analytics.document_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  
  -- Usage metrics
  query_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  conversation_count INTEGER DEFAULT 0,
  
  -- Token metrics
  tokens_total BIGINT DEFAULT 0,
  avg_tokens_per_query INTEGER,
  
  -- Cost metrics
  cost_total DECIMAL(10, 4) DEFAULT 0,
  
  -- Performance
  avg_response_time_ms INTEGER,
  cache_hit_rate DECIMAL(5, 2),
  
  -- Quality
  avg_feedback_rating DECIMAL(3, 2),
  feedback_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  
  -- Popular sections (from chat_events.sections_referenced)
  top_sections JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(document_id, date)
);

CREATE INDEX idx_document_usage_doc ON analytics.document_usage(document_id, date DESC);
CREATE INDEX idx_document_usage_date ON analytics.document_usage(date DESC);
CREATE INDEX idx_document_usage_cost ON analytics.document_usage(cost_total DESC);

ALTER TABLE analytics.document_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view document usage" 
  ON analytics.document_usage FOR SELECT
  USING (true); -- Public analytics

CREATE POLICY "Admins can manage document usage" 
  ON analytics.document_usage FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

COMMENT ON TABLE analytics.document_usage IS 
  'Daily aggregated analytics per document. Shows which documents are most used and costly.';

-- ============================================
-- 5. SYSTEM METRICS (Overall Platform)
-- ============================================

CREATE TABLE analytics.system_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  date DATE NOT NULL UNIQUE,
  
  -- User metrics
  active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  
  -- Usage metrics
  total_messages INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  total_documents_accessed INTEGER DEFAULT 0,
  
  -- Token metrics
  tokens_total BIGINT DEFAULT 0,
  tokens_cached BIGINT DEFAULT 0,
  cache_hit_rate DECIMAL(5, 2),
  
  -- Cost metrics
  cost_total DECIMAL(10, 2) DEFAULT 0,
  cost_per_message DECIMAL(10, 6),
  cost_saved_by_cache DECIMAL(10, 2) DEFAULT 0,
  
  -- Performance
  avg_response_time_ms INTEGER,
  p95_response_time_ms INTEGER,
  
  -- Quality
  error_count INTEGER DEFAULT 0,
  error_rate DECIMAL(5, 2),
  avg_feedback_rating DECIMAL(3, 2),
  
  -- Model distribution
  model_distribution JSONB DEFAULT '{}'::jsonb, -- {"gemini-2.0": 1000, "gemini-1.5": 50}
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_daily_metrics_date ON analytics.system_daily_metrics(date DESC);

ALTER TABLE analytics.system_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view system metrics" 
  ON analytics.system_daily_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

COMMENT ON TABLE analytics.system_daily_metrics IS 
  'Platform-wide daily metrics. Admin-only view of overall system health and costs.';
```

---

## 📊 **Materialized Views for Fast Queries**

```sql
-- ============================================
-- MATERIALIZED VIEW: User Monthly Summary
-- ============================================

CREATE MATERIALIZED VIEW analytics.mv_user_monthly_summary AS
SELECT 
  user_id,
  DATE_TRUNC('month', created_at)::DATE as month_start,
  EXTRACT(YEAR FROM created_at)::INTEGER as year,
  EXTRACT(MONTH FROM created_at)::INTEGER as month,
  
  -- Counts
  COUNT(*) as message_count,
  COUNT(DISTINCT conversation_id) as conversation_count,
  COUNT(DISTINCT document_id) as document_count,
  COUNT(DISTINCT DATE(created_at)) as active_days,
  
  -- Token metrics
  SUM(tokens_total) as tokens_total,
  SUM(tokens_cached) as tokens_cached,
  ROUND(
    (SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100, 
    2
  ) as cache_hit_rate,
  
  -- Cost metrics
  SUM(cost_total) as cost_total,
  SUM(CASE WHEN cache_hit THEN (cost_prompt + cost_completion) - cost_cached ELSE 0 END) as cost_saved_by_cache,
  
  -- Performance
  AVG(response_time_ms)::INTEGER as avg_response_time_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms)::INTEGER as median_response_time_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms)::INTEGER as p95_response_time_ms,
  
  -- Quality
  SUM(CASE WHEN error_occurred THEN 1 ELSE 0 END) as error_count,
  ROUND(
    (SUM(CASE WHEN error_occurred THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100, 
    2
  ) as error_rate,
  AVG(user_feedback_rating) as avg_feedback_rating,
  COUNT(user_feedback_rating) as feedback_count,
  
  MAX(created_at) as last_activity_at
FROM analytics.chat_events
GROUP BY user_id, month_start, year, month;

-- Indexes
CREATE UNIQUE INDEX idx_mv_user_monthly_summary_unique 
  ON analytics.mv_user_monthly_summary(user_id, year, month);
CREATE INDEX idx_mv_user_monthly_summary_user 
  ON analytics.mv_user_monthly_summary(user_id, year DESC, month DESC);
CREATE INDEX idx_mv_user_monthly_summary_month 
  ON analytics.mv_user_monthly_summary(month_start DESC);

COMMENT ON MATERIALIZED VIEW analytics.mv_user_monthly_summary IS 
  'Materialized view of monthly user statistics. Refresh nightly or on-demand.';

-- ============================================
-- MATERIALIZED VIEW: Document Popularity
-- ============================================

CREATE MATERIALIZED VIEW analytics.mv_document_popularity AS
SELECT 
  ce.document_id,
  d.content_json->>'metadata'->>'name_city' as city,
  d.content_json->>'metadata'->>'name_zoning' as zoning,
  d.content_json->>'metadata'->>'name_zone' as zone,
  
  -- Last 7 days
  COUNT(*) FILTER (WHERE ce.created_at >= NOW() - INTERVAL '7 days') as queries_7d,
  COUNT(DISTINCT ce.user_id) FILTER (WHERE ce.created_at >= NOW() - INTERVAL '7 days') as users_7d,
  SUM(ce.cost_total) FILTER (WHERE ce.created_at >= NOW() - INTERVAL '7 days') as cost_7d,
  
  -- Last 30 days
  COUNT(*) FILTER (WHERE ce.created_at >= NOW() - INTERVAL '30 days') as queries_30d,
  COUNT(DISTINCT ce.user_id) FILTER (WHERE ce.created_at >= NOW() - INTERVAL '30 days') as users_30d,
  SUM(ce.cost_total) FILTER (WHERE ce.created_at >= NOW() - INTERVAL '30 days') as cost_30d,
  
  -- All time
  COUNT(*) as queries_total,
  COUNT(DISTINCT ce.user_id) as users_total,
  SUM(ce.cost_total) as cost_total,
  
  -- Quality
  AVG(ce.user_feedback_rating) as avg_rating,
  AVG(ce.response_time_ms)::INTEGER as avg_response_time_ms,
  
  MAX(ce.created_at) as last_accessed_at
FROM analytics.chat_events ce
JOIN public.documents d ON d.id = ce.document_id
GROUP BY ce.document_id, city, zoning, zone;

CREATE UNIQUE INDEX idx_mv_document_popularity_doc 
  ON analytics.mv_document_popularity(document_id);
CREATE INDEX idx_mv_document_popularity_queries_7d 
  ON analytics.mv_document_popularity(queries_7d DESC);
CREATE INDEX idx_mv_document_popularity_cost_30d 
  ON analytics.mv_document_popularity(cost_30d DESC);

COMMENT ON MATERIALIZED VIEW analytics.mv_document_popularity IS 
  'Document usage statistics across different time windows. Refresh hourly.';

-- ============================================
-- REFRESH FUNCTIONS
-- ============================================

-- Refresh all materialized views
CREATE OR REPLACE FUNCTION analytics.refresh_all_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_user_monthly_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_document_popularity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION analytics.refresh_all_views() IS 
  'Refresh all materialized views. Schedule via pg_cron or external job.';
```

---

## 🔄 **Automatic Aggregation Triggers**

```sql
-- ============================================
-- TRIGGER: Update user_monthly_usage
-- ============================================

CREATE OR REPLACE FUNCTION analytics.update_monthly_usage()
RETURNS TRIGGER AS $$
DECLARE
  v_year INTEGER;
  v_month INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM NEW.created_at)::INTEGER;
  v_month := EXTRACT(MONTH FROM NEW.created_at)::INTEGER;
  
  INSERT INTO analytics.user_monthly_usage (
    user_id, year, month,
    message_count, tokens_total, cost_total, tokens_cached, error_count
  )
  VALUES (
    NEW.user_id, v_year, v_month,
    1, NEW.tokens_total, NEW.cost_total, COALESCE(NEW.tokens_cached, 0),
    CASE WHEN NEW.error_occurred THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, year, month)
  DO UPDATE SET
    message_count = user_monthly_usage.message_count + 1,
    tokens_total = user_monthly_usage.tokens_total + EXCLUDED.tokens_total,
    cost_total = user_monthly_usage.cost_total + EXCLUDED.cost_total,
    tokens_cached = user_monthly_usage.tokens_cached + EXCLUDED.tokens_cached,
    error_count = user_monthly_usage.error_count + EXCLUDED.error_count,
    cache_hit_rate = ROUND(
      (user_monthly_usage.tokens_cached + EXCLUDED.tokens_cached)::DECIMAL / 
      (user_monthly_usage.tokens_total + EXCLUDED.tokens_total) * 100,
      2
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_monthly_usage
AFTER INSERT ON analytics.chat_events
FOR EACH ROW
EXECUTE FUNCTION analytics.update_monthly_usage();

-- ============================================
-- TRIGGER: Update user_daily_usage
-- ============================================

CREATE OR REPLACE FUNCTION analytics.update_daily_usage()
RETURNS TRIGGER AS $$
DECLARE
  v_date DATE;
BEGIN
  v_date := DATE(NEW.created_at);
  
  INSERT INTO analytics.user_daily_usage (
    user_id, date,
    message_count, tokens_total, cost_total, 
    tokens_cached, cache_hit_count, error_count
  )
  VALUES (
    NEW.user_id, v_date,
    1, NEW.tokens_total, NEW.cost_total,
    COALESCE(NEW.tokens_cached, 0),
    CASE WHEN NEW.cache_hit THEN 1 ELSE 0 END,
    CASE WHEN NEW.error_occurred THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    message_count = user_daily_usage.message_count + 1,
    tokens_total = user_daily_usage.tokens_total + EXCLUDED.tokens_total,
    cost_total = user_daily_usage.cost_total + EXCLUDED.cost_total,
    tokens_cached = user_daily_usage.tokens_cached + EXCLUDED.tokens_cached,
    cache_hit_count = user_daily_usage.cache_hit_count + EXCLUDED.cache_hit_count,
    error_count = user_daily_usage.error_count + EXCLUDED.error_count,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_usage
AFTER INSERT ON analytics.chat_events
FOR EACH ROW
EXECUTE FUNCTION analytics.update_daily_usage();
```

---

## 🔍 **Useful Views for Frontend**

```sql
-- ============================================
-- VIEW: Current Month Usage (for user dashboard)
-- ============================================

CREATE OR REPLACE VIEW analytics.v_user_current_month AS
SELECT 
  umu.*,
  ROUND((umu.message_count::DECIMAL / NULLIF(umu.monthly_message_limit, 0)) * 100, 1) as usage_percent,
  (umu.monthly_message_limit - umu.message_count) as messages_remaining,
  CASE 
    WHEN umu.limit_reached THEN 'limit_reached'
    WHEN umu.message_count >= (umu.monthly_message_limit * 0.9) THEN 'warning'
    WHEN umu.message_count >= (umu.monthly_message_limit * 0.8) THEN 'approaching'
    ELSE 'normal'
  END as status
FROM analytics.user_monthly_usage umu
WHERE umu.year = EXTRACT(YEAR FROM NOW())
  AND umu.month = EXTRACT(MONTH FROM NOW());

COMMENT ON VIEW analytics.v_user_current_month IS 
  'Current month usage with calculated status. Used in user dashboard.';

-- ============================================
-- VIEW: Recent Activity (for user dashboard)
-- ============================================

CREATE OR REPLACE VIEW analytics.v_user_recent_activity AS
SELECT 
  ce.user_id,
  ce.created_at,
  ce.conversation_id,
  ce.document_id,
  ce.tokens_total,
  ce.cost_total,
  ce.response_time_ms,
  ce.cache_hit,
  ce.error_occurred,
  d.content_json->>'metadata'->>'name_city' as city,
  d.content_json->>'metadata'->>'name_zone' as zone
FROM analytics.chat_events ce
LEFT JOIN public.documents d ON d.id = ce.document_id
WHERE ce.created_at >= NOW() - INTERVAL '7 days'
ORDER BY ce.created_at DESC;

COMMENT ON VIEW analytics.v_user_recent_activity IS 
  'Last 7 days of activity per user. Used in user dashboard.';
```

---

## 📅 **Scheduled Jobs (Optional - pg_cron)**

```sql
-- Requires pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Refresh materialized views every hour
SELECT cron.schedule(
  'refresh-analytics-views',
  '0 * * * *', -- Every hour at minute 0
  $$SELECT analytics.refresh_all_views()$$
);

-- Clean up old events (optional - after 1 year)
SELECT cron.schedule(
  'cleanup-old-events',
  '0 2 * * 0', -- Every Sunday at 2 AM
  $$DELETE FROM analytics.chat_events WHERE created_at < NOW() - INTERVAL '1 year'$$
);
```

---

## ✅ **Final Schema Summary**

```
┌─────────────────────────────────────┐
│      ANALYTICS SCHEMA               │
├─────────────────────────────────────┤
│                                     │
│  RAW EVENTS:                        │
│  • chat_events (source of truth)    │
│                                     │
│  AGGREGATED TABLES:                 │
│  • user_daily_usage                 │
│  • user_monthly_usage               │
│  • document_usage                   │
│  • system_daily_metrics             │
│                                     │
│  MATERIALIZED VIEWS:                │
│  • mv_user_monthly_summary          │
│  • mv_document_popularity           │
│                                     │
│  HELPER VIEWS:                      │
│  • v_user_current_month             │
│  • v_user_recent_activity           │
│                                     │
└─────────────────────────────────────┘
```

**This is production-ready and scales!** 🚀

Would you like me to also create:
1. **Edge Functions** to query these analytics from your frontend?
2. **React components** to display usage dashboards?
3. **Supabase RLS policies** for multi-tenant isolation?
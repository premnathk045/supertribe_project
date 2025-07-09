/*
  # Social Media Aggregator Tables

  1. New Tables
    - social_media_links: Stores user's social media platform links
    - aggregated_posts: Stores social media posts from various platforms
    - bio_page_settings: Stores customization settings for bio pages
  
  2. Security
    - Enable row level security on all tables
    - Add policies for proper access control
    - Ensure users can manage only their own content
*/

-- Create social_media_links table
CREATE TABLE IF NOT EXISTS public.social_media_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  url text NOT NULL,
  display_name text,
  icon text,
  display_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT social_media_links_platform_check CHECK (platform = ANY (ARRAY[
    'twitter', 'instagram', 'youtube', 'tiktok', 'facebook', 
    'linkedin', 'github', 'twitch', 'discord', 'spotify',
    'pinterest', 'behance', 'dribbble', 'medium', 'patreon',
    'snapchat', 'reddit', 'website', 'email', 'other'
  ]))
);

-- Create aggregated_posts table
CREATE TABLE IF NOT EXISTS public.aggregated_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  original_url text NOT NULL,
  embed_html text,
  og_data jsonb DEFAULT '{}'::jsonb,
  thumbnail_url text,
  title text,
  description text,
  tags text[],
  published_at timestamptz,
  display_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT aggregated_posts_platform_check CHECK (platform = ANY (ARRAY[
    'twitter', 'instagram', 'youtube', 'tiktok', 'facebook', 
    'linkedin', 'github', 'twitch', 'medium', 'other'
  ]))
);

-- Create bio_page_settings table
CREATE TABLE IF NOT EXISTS public.bio_page_settings (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  custom_url text UNIQUE,
  title text,
  description text,
  theme text DEFAULT 'default',
  background_color text DEFAULT '#ffffff',
  text_color text DEFAULT '#000000',
  accent_color text DEFAULT '#ec4899',
  font text DEFAULT 'Inter',
  seo_keywords text[],
  show_social_links boolean DEFAULT true,
  show_aggregated_posts boolean DEFAULT true,
  layout_type text DEFAULT 'grid' CHECK (layout_type IN ('grid', 'list')),
  is_public boolean DEFAULT true,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.social_media_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aggregated_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bio_page_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for social_media_links
CREATE POLICY "Users can manage their own social media links"
ON public.social_media_links
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can read public social media links"
ON public.social_media_links
FOR SELECT
TO public
USING (is_visible = true);

-- Create policies for aggregated_posts
CREATE POLICY "Users can manage their own aggregated posts"
ON public.aggregated_posts
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can read public aggregated posts"
ON public.aggregated_posts
FOR SELECT
TO public
USING (is_visible = true);

-- Create policies for bio_page_settings
CREATE POLICY "Users can manage their own bio page settings"
ON public.bio_page_settings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can read public bio page settings"
ON public.bio_page_settings
FOR SELECT
TO public
USING (is_public = true);

-- Create function to verify custom URL
CREATE OR REPLACE FUNCTION verify_custom_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow alphanumeric characters, hyphens, and underscores
  IF NEW.custom_url !~ '^[a-zA-Z0-9_-]+$' THEN
    RAISE EXCEPTION 'Custom URL must contain only alphanumeric characters, hyphens, and underscores';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for custom URL verification
CREATE TRIGGER before_insert_or_update_bio_page_settings
BEFORE INSERT OR UPDATE ON public.bio_page_settings
FOR EACH ROW
WHEN (NEW.custom_url IS NOT NULL)
EXECUTE FUNCTION verify_custom_url();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_social_media_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_social_media_links_timestamp
BEFORE UPDATE ON public.social_media_links
FOR EACH ROW
EXECUTE FUNCTION update_social_media_timestamp();

CREATE TRIGGER update_aggregated_posts_timestamp
BEFORE UPDATE ON public.aggregated_posts
FOR EACH ROW
EXECUTE FUNCTION update_social_media_timestamp();

CREATE TRIGGER update_bio_page_settings_timestamp
BEFORE UPDATE ON public.bio_page_settings
FOR EACH ROW
EXECUTE FUNCTION update_social_media_timestamp();

-- Create function to increment bio page view count
CREATE OR REPLACE FUNCTION increment_bio_page_view_count(user_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.bio_page_settings
  SET view_count = view_count + 1
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create function to get social media links by username
CREATE OR REPLACE FUNCTION get_social_links_by_username(username_param text)
RETURNS TABLE (
  id uuid,
  platform text,
  url text,
  display_name text,
  icon text,
  display_order integer,
  is_visible boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sml.id, sml.platform, sml.url, sml.display_name, sml.icon, 
    sml.display_order, sml.is_visible
  FROM social_media_links sml
  JOIN profiles p ON p.id = sml.user_id
  WHERE p.username = username_param
    AND sml.is_visible = true
  ORDER BY sml.display_order, sml.created_at;
END;
$$ LANGUAGE plpgsql;
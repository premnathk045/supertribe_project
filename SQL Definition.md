Supabase SQL Definition:

<!-- creator_verifications SQL -->
create table public.creator_verifications (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  status text null default 'pending'::text,
  full_name text null,
  email text null,
  phone_number text null,
  country text null,
  city text null,
  age_verified boolean null default false,
  age_verification_date timestamp with time zone null,
  profile_completed boolean null default false,
  profile_completion_date timestamp with time zone null,
  payment_setup_completed boolean null default false,
  payment_setup_date timestamp with time zone null,
  submitted_at timestamp with time zone null,
  approved_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint creator_verifications_pkey primary key (id),
  constraint creator_verifications_user_id_fkey foreign KEY (user_id) references auth.users (id),
  constraint creator_verifications_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'approved'::text,
          'rejected'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


<!--  payment_methods SQL -->
create table public.payment_methods (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  type text null default 'demo_card'::text,
  card_last_four text null,
  card_brand text null,
  is_default boolean null default false,
  is_demo boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint payment_methods_pkey primary key (id),
  constraint payment_methods_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;


<!-- poll_votes SQL -->
create table public.poll_votes (
  id uuid not null default gen_random_uuid (),
  post_id uuid null,
  user_id uuid null,
  option_index integer not null,
  created_at timestamp with time zone null default now(),
  constraint poll_votes_pkey primary key (id),
  constraint poll_votes_post_id_user_id_key unique (post_id, user_id),
  constraint poll_votes_post_id_fkey foreign KEY (post_id) references posts (id) on delete CASCADE,
  constraint poll_votes_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_poll_votes_post_id on public.poll_votes using btree (post_id) TABLESPACE pg_default;


<!-- post_comments SQL -->
create table public.post_comments (
  id uuid not null default gen_random_uuid (),
  post_id uuid null,
  user_id uuid null,
  content text not null,
  parent_id uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint post_comments_pkey primary key (id),
  constraint post_comments_parent_id_fkey foreign KEY (parent_id) references post_comments (id) on delete CASCADE,
  constraint post_comments_post_id_fkey foreign KEY (post_id) references posts (id) on delete CASCADE,
  constraint post_comments_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_post_comments_post_id on public.post_comments using btree (post_id) TABLESPACE pg_default;

create trigger trigger_update_comments_updated_at BEFORE
update on post_comments for EACH row
execute FUNCTION update_updated_at_column ();

create trigger trigger_update_post_comment_count
after INSERT
or DELETE on post_comments for EACH row
execute FUNCTION update_post_comment_count ();


<!-- post_likes SQL -->
create table public.post_likes (
  id uuid not null default gen_random_uuid (),
  post_id uuid null,
  user_id uuid null,
  created_at timestamp with time zone null default now(),
  constraint post_likes_pkey primary key (id),
  constraint post_likes_post_id_user_id_key unique (post_id, user_id),
  constraint post_likes_post_id_fkey foreign KEY (post_id) references posts (id) on delete CASCADE,
  constraint post_likes_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_post_likes_post_id on public.post_likes using btree (post_id) TABLESPACE pg_default;

create index IF not exists idx_post_likes_user_id on public.post_likes using btree (user_id) TABLESPACE pg_default;

create trigger trigger_update_post_like_count
after INSERT
or DELETE on post_likes for EACH row
execute FUNCTION update_post_like_count ();


<!-- post_saves SQL -->
create table public.post_saves (
  id uuid not null default gen_random_uuid (),
  post_id uuid null,
  user_id uuid null,
  created_at timestamp with time zone null default now(),
  constraint post_saves_pkey primary key (id),
  constraint post_saves_post_id_user_id_key unique (post_id, user_id),
  constraint post_saves_post_id_fkey foreign KEY (post_id) references posts (id) on delete CASCADE,
  constraint post_saves_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;


<!-- post_views SQL -->
create table public.post_views (
  id uuid not null default gen_random_uuid (),
  post_id uuid null,
  user_id uuid null,
  viewed_at timestamp with time zone null default now(),
  constraint post_views_pkey primary key (id),
  constraint post_views_post_id_user_id_key unique (post_id, user_id),
  constraint post_views_post_id_fkey foreign KEY (post_id) references posts (id) on delete CASCADE,
  constraint post_views_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_post_views_post_id on public.post_views using btree (post_id) TABLESPACE pg_default;

create trigger trigger_update_post_view_count
after INSERT on post_views for EACH row
execute FUNCTION update_post_view_count ();


<!-- posts SQL -->
create table public.posts (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  content text null,
  media_urls text[] null,
  is_premium boolean null default false,
  price numeric(10, 2) null,
  subscriber_discount integer null default 0,
  tags text[] null,
  poll jsonb null default '{}'::jsonb,
  preview_video_url text null,
  scheduled_for timestamp with time zone null,
  status text null default 'published'::text,
  like_count integer null default 0,
  comment_count integer null default 0,
  share_count integer null default 0,
  view_count integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint posts_pkey primary key (id),
  constraint posts_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint posts_status_check check (
    (
      status = any (
        array[
          'published'::text,
          'scheduled'::text,
          'draft'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_posts_user_id on public.posts using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_posts_status on public.posts using btree (status) TABLESPACE pg_default;

create index IF not exists idx_posts_created_at on public.posts using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_posts_scheduled_for on public.posts using btree (scheduled_for) TABLESPACE pg_default;

create index IF not exists idx_posts_tags on public.posts using gin (tags) TABLESPACE pg_default;

create trigger trigger_update_posts_updated_at BEFORE
update on posts for EACH row
execute FUNCTION update_updated_at_column ();


<!-- profiles SQL -->
create table public.profiles (
  id uuid not null,
  username text null,
  display_name text null,
  bio text null,
  avatar_url text null,
  user_type text null default 'fan'::text,
  is_verified boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_username_key unique (username),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id),
  constraint profiles_user_type_check check (
    (
      user_type = any (array['fan'::text, 'creator'::text])
    )
  )
) TABLESPACE pg_default;


<!-- stories SQL -->
create table public.stories (
  id uuid not null default gen_random_uuid (),
  creator_id uuid null,
  content_type text not null,
  media_url text null,
  media_path text null,
  caption text null,
  text_content text null,
  text_style jsonb null default '{}'::jsonb,
  background_style jsonb null default '{}'::jsonb,
  file_size bigint null,
  file_type text null,
  duration integer null,
  thumbnail_url text null,
  is_active boolean null default true,
  view_count integer null default 0,
  like_count integer null default 0,
  share_count integer null default 0,
  expires_at timestamp with time zone null default (now() + '24:00:00'::interval),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint stories_pkey primary key (id),
  constraint stories_creator_id_fkey foreign KEY (creator_id) references profiles (id) on delete CASCADE,
  constraint stories_content_type_check check (
    (
      content_type = any (array['photo'::text, 'video'::text, 'text'::text])
    )
  )
) TABLESPACE pg_default;


<!-- story_interactions SQL -->
create table public.story_interactions (
  id uuid not null default gen_random_uuid (),
  story_id uuid null,
  user_id uuid null,
  interaction_type text not null,
  reaction_emoji text null,
  created_at timestamp with time zone null default now(),
  constraint story_interactions_pkey primary key (id),
  constraint story_interactions_story_id_user_id_interaction_type_key unique (story_id, user_id, interaction_type),
  constraint story_interactions_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint story_interactions_interaction_type_check check (
    (
      interaction_type = any (
        array['like'::text, 'share'::text, 'reaction'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_story_interactions_story_id on public.story_interactions using btree (story_id) TABLESPACE pg_default;

create trigger trigger_update_story_interaction_count
after INSERT
or DELETE on story_interactions for EACH row
execute FUNCTION update_story_interaction_count ();


<!-- story_views SQL -->
create table public.story_views (
  id uuid not null default gen_random_uuid (),
  story_id uuid null,
  viewer_id uuid null,
  viewed_at timestamp with time zone null default now(),
  constraint story_views_pkey primary key (id),
  constraint story_views_story_id_viewer_id_key unique (story_id, viewer_id),
  constraint story_views_viewer_id_fkey foreign KEY (viewer_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_story_views_story_id on public.story_views using btree (story_id) TABLESPACE pg_default;

create index IF not exists idx_story_views_viewer_id on public.story_views using btree (viewer_id) TABLESPACE pg_default;

create trigger trigger_update_story_view_count
after INSERT on story_views for EACH row
execute FUNCTION update_story_view_count ();
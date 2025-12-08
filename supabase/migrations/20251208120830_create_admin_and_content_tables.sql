/*
  # Admin and Content Management Schema

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key, references auth.users)
      - `created_at` (timestamp)
      - Stores admin user IDs for authorization
    
    - `blog_posts`
      - `id` (uuid, primary key)
      - `slug` (varchar, unique)
      - `title` (varchar)
      - `excerpt` (text)
      - `content` (text, markdown)
      - `cover_image` (text)
      - `category` (varchar)
      - `tags` (text array)
      - `is_published` (boolean)
      - `published_at` (timestamp)
      - `view_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `courses`
      - `id` (uuid, primary key)
      - `slug` (varchar, unique)
      - `title` (varchar)
      - `description` (text)
      - `thumbnail` (text)
      - `difficulty` (varchar)
      - `duration_minutes` (integer)
      - `category` (varchar)
      - `is_published` (boolean)
      - `is_free` (boolean)
      - `price` (integer)
      - `sort_order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `lessons`
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key)
      - `title` (varchar)
      - `content` (text, markdown)
      - `video_url` (text)
      - `duration_minutes` (integer)
      - `sort_order` (integer)
      - `is_preview` (boolean)
      - `created_at` (timestamp)
    
    - `books`
      - `id` (uuid, primary key)
      - `title` (varchar)
      - `author` (varchar)
      - `description` (text)
      - `cover_image` (text)
      - `amazon_url` (text)
      - `category` (varchar)
      - `difficulty` (varchar)
      - `rating` (decimal)
      - `is_published` (boolean)
      - `sort_order` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Admin users can manage all content
    - Published content is viewable by everyone
    - Lessons preview requires authentication or admin access

  3. Functions
    - Auto-update `updated_at` column on blog_posts and courses
*/

-- ==========================================
-- Admin Users Management
-- ==========================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin_users" ON admin_users
  FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- ==========================================
-- Blog Posts
-- ==========================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  category VARCHAR(100),
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are viewable by everyone" ON blog_posts
  FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage blog posts" ON blog_posts
  FOR ALL 
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- ==========================================
-- E-Learning Courses
-- ==========================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  thumbnail TEXT,
  difficulty VARCHAR(50),
  duration_minutes INTEGER,
  category VARCHAR(100),
  is_published BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT true,
  price INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses are viewable" ON courses
  FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage courses" ON courses
  FOR ALL 
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Lessons of published courses are viewable" ON lessons
  FOR SELECT 
  USING (
    course_id IN (SELECT id FROM courses WHERE is_published = true)
    AND (is_preview = true OR auth.uid() IN (SELECT id FROM admin_users))
  );

CREATE POLICY "Admins can manage lessons" ON lessons
  FOR ALL 
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- ==========================================
-- Recommended Books
-- ==========================================
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255),
  description TEXT,
  cover_image TEXT,
  amazon_url TEXT,
  category VARCHAR(100),
  difficulty VARCHAR(50),
  rating DECIMAL(2,1),
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published books are viewable" ON books
  FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage books" ON books
  FOR ALL 
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- ==========================================
-- Triggers: Auto-update updated_at column
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_blog_posts_updated_at'
  ) THEN
    CREATE TRIGGER update_blog_posts_updated_at
      BEFORE UPDATE ON blog_posts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_courses_updated_at'
  ) THEN
    CREATE TRIGGER update_courses_updated_at
      BEFORE UPDATE ON courses
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

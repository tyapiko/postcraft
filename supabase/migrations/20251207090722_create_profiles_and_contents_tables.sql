/*
  # Postcraft Database Schema

  ## New Tables
  
  ### profiles
  User profile information and plan details
  - id: uuid (primary key, references auth.users)
  - display_name: text - User's display name
  - plan: text - Subscription plan (free/starter/pro)
  - generation_count: integer - Number of generations this month
  - created_at: timestamptz - Account creation timestamp
  - updated_at: timestamptz - Last update timestamp

  ### contents
  Generated content history
  - id: uuid (primary key)
  - user_id: uuid (references auth.users)
  - theme: text - Input theme for generation
  - tone: text - Selected tone (casual/business/professional)
  - platform: text - Target platform (twitter)
  - generated_text: text - AI-generated content
  - is_draft: boolean - Whether saved as draft
  - is_saved_to_notion: boolean - Whether saved to Notion
  - saved_to_notion_at: timestamptz - Notion save timestamp
  - created_at: timestamptz - Generation timestamp

  ## Security
  - Enable RLS on both tables
  - Users can only access their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text,
  plan text DEFAULT 'free' NOT NULL,
  generation_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create contents table
CREATE TABLE IF NOT EXISTS contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  theme text NOT NULL,
  tone text NOT NULL,
  platform text NOT NULL,
  generated_text text NOT NULL,
  is_draft boolean DEFAULT false NOT NULL,
  is_saved_to_notion boolean DEFAULT false NOT NULL,
  saved_to_notion_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- Contents policies
CREATE POLICY "Users can view own contents"
  ON contents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contents"
  ON contents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contents"
  ON contents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contents"
  ON contents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS contents_user_id_idx ON contents(user_id);
CREATE INDEX IF NOT EXISTS contents_created_at_idx ON contents(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
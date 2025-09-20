-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  farcaster_fid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memes table
CREATE TABLE IF NOT EXISTS public.memes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create battles table
CREATE TABLE IF NOT EXISTS public.battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  meme_a_id UUID NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  meme_b_id UUID NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  meme_id UUID NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(battle_id, voter_id)
);

-- Create reactions table
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id UUID NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fire', 'laugh', 'mind_blown', 'cringe', 'based')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meme_id, user_id, reaction_type)
);

-- Create leaderboard_entries table for tracking user stats
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_votes_received INTEGER DEFAULT 0,
  total_battles_won INTEGER DEFAULT 0,
  total_memes_created INTEGER DEFAULT 0,
  total_reactions_received INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for memes
CREATE POLICY "Anyone can view memes" ON public.memes FOR SELECT USING (true);
CREATE POLICY "Users can create memes" ON public.memes FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own memes" ON public.memes FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete their own memes" ON public.memes FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for battles
CREATE POLICY "Anyone can view battles" ON public.battles FOR SELECT USING (true);
CREATE POLICY "Users can create battles" ON public.battles FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own battles" ON public.battles FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for votes
CREATE POLICY "Anyone can view votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Users can create votes" ON public.votes FOR INSERT WITH CHECK (auth.uid() = voter_id);
CREATE POLICY "Users can update their own votes" ON public.votes FOR UPDATE USING (auth.uid() = voter_id);
CREATE POLICY "Users can delete their own votes" ON public.votes FOR DELETE USING (auth.uid() = voter_id);

-- RLS Policies for reactions
CREATE POLICY "Anyone can view reactions" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Users can create reactions" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reactions" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for leaderboard_entries
CREATE POLICY "Anyone can view leaderboard entries" ON public.leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "System can manage leaderboard entries" ON public.leaderboard_entries FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memes_creator_id ON public.memes(creator_id);
CREATE INDEX IF NOT EXISTS idx_battles_status ON public.battles(status);
CREATE INDEX IF NOT EXISTS idx_battles_created_at ON public.battles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_battle_id ON public.votes(battle_id);
CREATE INDEX IF NOT EXISTS idx_votes_meme_id ON public.votes(meme_id);
CREATE INDEX IF NOT EXISTS idx_reactions_meme_id ON public.reactions(meme_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard_entries(score DESC);

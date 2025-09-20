-- Function to update leaderboard scores
CREATE OR REPLACE FUNCTION public.update_leaderboard_score(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  votes_received INTEGER := 0;
  battles_won INTEGER := 0;
  memes_created INTEGER := 0;
  reactions_received INTEGER := 0;
  total_score INTEGER := 0;
BEGIN
  -- Count votes received for user's memes
  SELECT COUNT(*) INTO votes_received
  FROM public.votes v
  JOIN public.memes m ON v.meme_id = m.id
  WHERE m.creator_id = user_uuid;

  -- Count battles won (meme with most votes in completed battles)
  SELECT COUNT(*) INTO battles_won
  FROM public.battles b
  WHERE b.status = 'completed'
  AND (
    (SELECT COUNT(*) FROM public.votes v WHERE v.battle_id = b.id AND v.meme_id = b.meme_a_id) >
    (SELECT COUNT(*) FROM public.votes v WHERE v.battle_id = b.id AND v.meme_id = b.meme_b_id)
    AND (SELECT creator_id FROM public.memes WHERE id = b.meme_a_id) = user_uuid
  )
  OR (
    (SELECT COUNT(*) FROM public.votes v WHERE v.battle_id = b.id AND v.meme_id = b.meme_b_id) >
    (SELECT COUNT(*) FROM public.votes v WHERE v.battle_id = b.id AND v.meme_id = b.meme_a_id)
    AND (SELECT creator_id FROM public.memes WHERE id = b.meme_b_id) = user_uuid
  );

  -- Count memes created
  SELECT COUNT(*) INTO memes_created
  FROM public.memes
  WHERE creator_id = user_uuid;

  -- Count reactions received
  SELECT COUNT(*) INTO reactions_received
  FROM public.reactions r
  JOIN public.memes m ON r.meme_id = m.id
  WHERE m.creator_id = user_uuid;

  -- Calculate total score (weighted)
  total_score := (votes_received * 2) + (battles_won * 10) + (memes_created * 1) + (reactions_received * 1);

  -- Update leaderboard entry
  INSERT INTO public.leaderboard_entries (
    user_id, 
    total_votes_received, 
    total_battles_won, 
    total_memes_created, 
    total_reactions_received, 
    score,
    updated_at
  )
  VALUES (
    user_uuid, 
    votes_received, 
    battles_won, 
    memes_created, 
    reactions_received, 
    total_score,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_votes_received = EXCLUDED.total_votes_received,
    total_battles_won = EXCLUDED.total_battles_won,
    total_memes_created = EXCLUDED.total_memes_created,
    total_reactions_received = EXCLUDED.total_reactions_received,
    score = EXCLUDED.score,
    updated_at = EXCLUDED.updated_at;
END;
$$;

-- Function to get top leaderboard entries
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  total_votes_received INTEGER,
  total_battles_won INTEGER,
  total_memes_created INTEGER,
  total_reactions_received INTEGER,
  score INTEGER,
  rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    l.total_votes_received,
    l.total_battles_won,
    l.total_memes_created,
    l.total_reactions_received,
    l.score,
    ROW_NUMBER() OVER (ORDER BY l.score DESC) as rank
  FROM public.leaderboard_entries l
  JOIN public.profiles p ON l.user_id = p.id
  ORDER BY l.score DESC
  LIMIT limit_count;
END;
$$;

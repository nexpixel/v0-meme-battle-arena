-- Function to automatically update leaderboard when votes/reactions change
CREATE OR REPLACE FUNCTION public.auto_update_leaderboard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_user_id UUID;
BEGIN
  -- Determine which user's score needs updating based on the trigger
  IF TG_TABLE_NAME = 'votes' THEN
    -- Get the meme creator for vote changes
    SELECT creator_id INTO affected_user_id
    FROM public.memes
    WHERE id = COALESCE(NEW.meme_id, OLD.meme_id);
  ELSIF TG_TABLE_NAME = 'reactions' THEN
    -- Get the meme creator for reaction changes
    SELECT creator_id INTO affected_user_id
    FROM public.memes
    WHERE id = COALESCE(NEW.meme_id, OLD.meme_id);
  ELSIF TG_TABLE_NAME = 'memes' THEN
    -- For meme creation/deletion
    affected_user_id := COALESCE(NEW.creator_id, OLD.creator_id);
  END IF;

  -- Update the leaderboard score for the affected user
  IF affected_user_id IS NOT NULL THEN
    PERFORM public.update_leaderboard_score(affected_user_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for automatic leaderboard updates
DROP TRIGGER IF EXISTS trigger_update_leaderboard_votes ON public.votes;
CREATE TRIGGER trigger_update_leaderboard_votes
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_leaderboard();

DROP TRIGGER IF EXISTS trigger_update_leaderboard_reactions ON public.reactions;
CREATE TRIGGER trigger_update_leaderboard_reactions
  AFTER INSERT OR UPDATE OR DELETE ON public.reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_leaderboard();

DROP TRIGGER IF EXISTS trigger_update_leaderboard_memes ON public.memes;
CREATE TRIGGER trigger_update_leaderboard_memes
  AFTER INSERT OR UPDATE OR DELETE ON public.memes
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_leaderboard();

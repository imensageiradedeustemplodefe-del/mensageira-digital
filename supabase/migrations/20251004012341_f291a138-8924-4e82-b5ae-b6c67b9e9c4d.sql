-- Create photo_reactions table
CREATE TABLE IF NOT EXISTS public.photo_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('love', 'prayer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(photo_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.photo_reactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view reactions
CREATE POLICY "Anyone can view photo reactions"
ON public.photo_reactions
FOR SELECT
USING (true);

-- Allow anyone to insert reactions
CREATE POLICY "Anyone can insert photo reactions"
ON public.photo_reactions
FOR INSERT
WITH CHECK (true);

-- Allow users to delete their own reactions
CREATE POLICY "Users can delete their own reactions"
ON public.photo_reactions
FOR DELETE
USING (true);

-- Create index for better performance
CREATE INDEX idx_photo_reactions_photo_id ON public.photo_reactions(photo_id);
CREATE INDEX idx_photo_reactions_user_id ON public.photo_reactions(user_id);
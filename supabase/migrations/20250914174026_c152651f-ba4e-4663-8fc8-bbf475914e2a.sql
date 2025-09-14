-- Add column to allow public sharing of prayer requests
ALTER TABLE public.prayer_requests 
ADD COLUMN allow_public_share boolean DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN public.prayer_requests.allow_public_share IS 'Indica se a pessoa permitiu que sua oração seja compartilhada publicamente com outros usuários';
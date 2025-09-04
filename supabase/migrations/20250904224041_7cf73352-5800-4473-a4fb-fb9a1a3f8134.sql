-- Create live_streams table
CREATE TABLE public.live_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'facebook', 'custom')),
  stream_url TEXT NOT NULL,
  embed_url TEXT,
  is_active BOOLEAN DEFAULT false,
  is_live BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  viewer_count INTEGER DEFAULT 0,
  chat_enabled BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

-- Policies for live_streams
CREATE POLICY "Everyone can view active live streams" 
ON public.live_streams 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all live streams" 
ON public.live_streams 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Create trigger for updated_at
CREATE TRIGGER update_live_streams_updated_at
BEFORE UPDATE ON public.live_streams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_live_streams_active ON public.live_streams(is_active);
CREATE INDEX idx_live_streams_live ON public.live_streams(is_live);
CREATE INDEX idx_live_streams_scheduled ON public.live_streams(scheduled_at);
CREATE INDEX idx_live_streams_platform ON public.live_streams(platform);
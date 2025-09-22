-- Enable RLS policies for video uploads and interactions
-- Allow authenticated users to insert videos
CREATE POLICY "Authenticated users can insert movies" 
ON public.movies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own videos
CREATE POLICY "Users can update their own movies" 
ON public.movies 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own movies" 
ON public.movies 
FOR DELETE 
USING (auth.uid() = created_by);

-- Allow authenticated users to insert TV shows
CREATE POLICY "Authenticated users can insert tv shows" 
ON public.tv_shows 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own TV shows
CREATE POLICY "Users can update their own tv shows" 
ON public.tv_shows 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Allow users to delete their own TV shows
CREATE POLICY "Users can delete their own tv shows" 
ON public.tv_shows 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create storage buckets for video content
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('posters', 'posters', true);

-- Storage policies for videos (private)
CREATE POLICY "Users can upload their own videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for posters (public)
CREATE POLICY "Anyone can view posters" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'posters');

CREATE POLICY "Users can upload posters" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'posters' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update posters" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'posters' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete posters" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'posters' AND auth.uid() IS NOT NULL);
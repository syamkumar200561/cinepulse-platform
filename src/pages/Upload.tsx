import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload as UploadIcon, Video, Image } from "lucide-react";
import { toast } from "sonner";

const Upload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    release_year: new Date().getFullYear(),
    duration_minutes: "",
    rating: ""
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      toast.success('Video file selected');
    }
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      toast.success('Poster image selected');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setUploading(true);

    try {
      // For now, we'll just save the metadata without actual file upload
      // In a real implementation, you would upload files to Supabase Storage
      
      const movieData = {
        title: formData.title,
        description: formData.description,
        genre: formData.genre ? formData.genre.split(',').map(g => g.trim()) : [],
        release_year: parseInt(formData.release_year.toString()),
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        video_url: videoFile ? `placeholder-video-url-${Date.now()}` : null,
        poster_url: posterFile ? `placeholder-poster-url-${Date.now()}` : null,
        created_by: null // Would be user ID when auth is implemented
      };

      const { data, error } = await supabase
        .from('movies')
        .insert([movieData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Video uploaded successfully!');
      navigate(`/video/${data.id}`);
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground cursor-pointer" onClick={() => navigate('/')}>
              CinePulse
            </h1>
            <nav className="hidden md:flex space-x-6">
              <Button variant="ghost" onClick={() => navigate('/')}>Home</Button>
              <Button variant="ghost" onClick={() => navigate('/browse')}>Browse</Button>
              <Button variant="default">Upload</Button>
              <Button variant="ghost" onClick={() => navigate('/auth')}>Login</Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8">
          <div className="text-center mb-8">
            <UploadIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Upload Your Video</h2>
            <p className="text-muted-foreground">Share your content with the world</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video File Upload */}
            <div>
              <Label htmlFor="video">Video File</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Video className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      {videoFile ? videoFile.name : 'Click to upload video'}
                    </p>
                    <p className="text-xs text-muted-foreground">MP4, AVI, MOV (MAX. 500MB)</p>
                  </div>
                  <input 
                    id="video" 
                    type="file" 
                    accept="video/*" 
                    className="hidden" 
                    onChange={handleVideoUpload}
                  />
                </label>
              </div>
            </div>

            {/* Poster Upload */}
            <div>
              <Label htmlFor="poster">Poster Image</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      {posterFile ? posterFile.name : 'Click to upload poster'}
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 10MB)</p>
                  </div>
                  <input 
                    id="poster" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePosterUpload}
                  />
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter video title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter video description"
                rows={4}
              />
            </div>

            {/* Genre */}
            <div>
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                placeholder="Action, Comedy, Drama (comma separated)"
              />
            </div>

            {/* Release Year and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="release_year">Release Year</Label>
                <Input
                  id="release_year"
                  name="release_year"
                  type="number"
                  value={formData.release_year}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  name="duration_minutes"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  placeholder="120"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <Label htmlFor="rating">Rating (1-10)</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={formData.rating}
                onChange={handleInputChange}
                placeholder="8.5"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
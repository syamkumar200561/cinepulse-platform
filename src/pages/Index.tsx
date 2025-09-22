import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [featuredMovies, setFeaturedMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setFeaturedMovies(data || []);
    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">CinePulse</h1>
            <nav className="hidden md:flex space-x-6">
              <Button variant="ghost" onClick={() => navigate('/')}>Home</Button>
              <Button variant="ghost" onClick={() => navigate('/browse')}>Browse</Button>
              <Button variant="ghost" onClick={() => navigate('/upload')}>Upload</Button>
              <Button variant="ghost" onClick={() => navigate('/auth')}>Login</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Stream Your World
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover, upload, and share amazing videos with our modern streaming platform
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate('/browse')}
              className="gap-2"
            >
              <Play className="w-5 h-5" />
              Start Watching
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/upload')}
              className="gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Upload Video
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Videos */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-foreground">Featured Videos</h3>
            <Button variant="outline" onClick={() => navigate('/browse')}>
              View All
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-card rounded-lg overflow-hidden shadow-sm border animate-pulse">
                  <div className="aspect-video bg-muted"></div>
                  <div className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMovies.length > 0 ? (
                featuredMovies.map((movie) => (
                  <div 
                    key={movie.id} 
                    className="bg-card rounded-lg overflow-hidden shadow-sm border cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => navigate(`/video/${movie.id}`)}
                  >
                    <div className="aspect-video bg-muted relative">
                      {movie.poster_url ? (
                        <img 
                          src={movie.poster_url} 
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Play className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-card-foreground mb-2 line-clamp-1">{movie.title}</h4>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {movie.description || "No description available"}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {movie.duration_minutes ? `${movie.duration_minutes} min` : 'N/A'}
                        </span>
                        <span>{movie.release_year}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground mb-4">No featured content available yet</p>
                  <Button onClick={() => navigate('/upload')}>
                    Upload the first video
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;

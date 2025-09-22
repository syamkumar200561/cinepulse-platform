import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Filter, Grid, List } from "lucide-react";
import { toast } from "sonner";

const Browse = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<any[]>([]);
  const [tvShows, setTvShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("movies");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [moviesResponse, tvShowsResponse] = await Promise.all([
        supabase.from('movies').select('*').order('created_at', { ascending: false }),
        supabase.from('tv_shows').select('*').order('created_at', { ascending: false })
      ]);

      if (moviesResponse.error) throw moviesResponse.error;
      if (tvShowsResponse.error) throw tvShowsResponse.error;

      setMovies(moviesResponse.data || []);
      setTvShows(tvShowsResponse.data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = () => {
    const content = activeTab === "movies" ? movies : tvShows;
    return content.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleContentClick = (id: string) => {
    navigate(`/video/${id}`);
  };

  const ContentCard = ({ item }: { item: any }) => (
    <Card 
      className="overflow-hidden cursor-pointer hover:scale-105 transition-transform"
      onClick={() => handleContentClick(item.id)}
    >
      <div className="aspect-video bg-muted">
        {item.poster_url ? (
          <img 
            src={item.poster_url} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground mb-1">{item.title}</h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {item.description || "No description available"}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{item.release_year}</span>
          <span>{item.rating ? `${item.rating}/10` : 'Unrated'}</span>
        </div>
      </div>
    </Card>
  );

  const ContentList = ({ item }: { item: any }) => (
    <Card 
      className="p-4 cursor-pointer hover:bg-accent transition-colors"
      onClick={() => handleContentClick(item.id)}
    >
      <div className="flex gap-4">
        <div className="w-32 h-20 bg-muted rounded flex-shrink-0">
          {item.poster_url ? (
            <img 
              src={item.poster_url} 
              alt={item.title}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No Image
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-card-foreground mb-1">{item.title}</h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {item.description || "No description available"}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{item.release_year}</span>
            <span>{item.rating ? `${item.rating}/10` : 'Unrated'}</span>
            {activeTab === "tv_shows" && <span>{item.seasons} seasons</span>}
          </div>
        </div>
      </div>
    </Card>
  );

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
              <Button variant="default">Browse</Button>
              <Button variant="ghost" onClick={() => navigate('/upload')}>Upload</Button>
              <Button variant="ghost" onClick={() => navigate('/auth')}>Login</Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === "movies" ? "default" : "outline"}
            onClick={() => setActiveTab("movies")}
          >
            Movies ({movies.length})
          </Button>
          <Button
            variant={activeTab === "tv_shows" ? "default" : "outline"}
            onClick={() => setActiveTab("tv_shows")}
          >
            TV Shows ({tvShows.length})
          </Button>
        </div>

        {/* Content Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading content...</div>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredContent().map((item) => (
              <div key={item.id}>
                {viewMode === "grid" ? (
                  <ContentCard item={item} />
                ) : (
                  <ContentList item={item} />
                )}
              </div>
            ))}
          </div>
        )}

        {filteredContent().length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No content found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
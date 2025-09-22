import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Play, Heart, User, LogOut } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      setUser(user);
      fetchUserData(user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      const [videosResponse, watchlistResponse] = await Promise.all([
        supabase.from('movies').select('*').eq('created_by', userId),
        supabase.from('watchlists').select('*, movies(*), tv_shows(*)').eq('user_id', userId)
      ]);

      if (videosResponse.error) throw videosResponse.error;
      if (watchlistResponse.error) throw watchlistResponse.error;

      setUserVideos(videosResponse.data || []);
      setWatchlist(watchlistResponse.data || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const VideoCard = ({ video }: { video: any }) => (
    <Card className="overflow-hidden cursor-pointer hover:scale-105 transition-transform">
      <div className="aspect-video bg-muted">
        {video.poster_url ? (
          <img 
            src={video.poster_url} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground mb-1">{video.title}</h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {video.description || "No description available"}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{video.release_year}</span>
          <span>{video.rating ? `${video.rating}/10` : 'Unrated'}</span>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground cursor-pointer" onClick={() => navigate('/')}>
              CinePulse
            </h1>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex space-x-6">
                <Button variant="ghost" onClick={() => navigate('/')}>Home</Button>
                <Button variant="ghost" onClick={() => navigate('/browse')}>Browse</Button>
                <Button variant="ghost" onClick={() => navigate('/upload')}>Upload</Button>
              </nav>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.email}!
          </h2>
          <p className="text-muted-foreground">Manage your videos and discover new content</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/upload')}>
            <Upload className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Upload Video</h3>
            <p className="text-sm text-muted-foreground">Share your content with the world</p>
          </Card>
          
          <Card className="p-6 cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/browse')}>
            <Play className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Browse Content</h3>
            <p className="text-sm text-muted-foreground">Discover amazing videos and shows</p>
          </Card>
          
          <Card className="p-6">
            <Heart className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Your Stats</h3>
            <p className="text-sm text-muted-foreground">
              {userVideos.length} videos uploaded • {watchlist.length} in watchlist
            </p>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="videos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="videos">My Videos ({userVideos.length})</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist ({watchlist.length})</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            {userVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userVideos.map((video) => (
                  <div key={video.id} onClick={() => navigate(`/video/${video.id}`)}>
                    <VideoCard video={video} />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No videos uploaded yet</h3>
                <p className="text-muted-foreground mb-4">Start sharing your content with the community</p>
                <Button onClick={() => navigate('/upload')}>Upload Your First Video</Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="watchlist">
            {watchlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {watchlist.map((item) => {
                  const content = item.movies || item.tv_shows;
                  return (
                    <div key={item.id} onClick={() => navigate(`/video/${content.id}`)}>
                      <VideoCard video={content} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Your watchlist is empty</h3>
                <p className="text-muted-foreground mb-4">Add videos to your watchlist to watch later</p>
                <Button onClick={() => navigate('/browse')}>Browse Content</Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user?.email}</h3>
                  <p className="text-muted-foreground">Member since {new Date(user?.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Account Information</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Email: {user?.email}</p>
                    <p>Account ID: {user?.id}</p>
                    <p>Email Verified: {user?.email_confirmed_at ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Statistics</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Videos Uploaded: {userVideos.length}</p>
                    <p>Watchlist Items: {watchlist.length}</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
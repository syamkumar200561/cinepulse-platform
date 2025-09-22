import { Toaster } from "@/components/ui/toaster";
import { Film } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <>
      <header className="border-b py-4 px-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Film className="h-8 w-8" />
            <span className="text-2xl font-bold">CinePulse</span>
          </Link>
          {/* You can add other nav links here later */}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <Toaster />
    </>
  );
};

export default RootLayout;
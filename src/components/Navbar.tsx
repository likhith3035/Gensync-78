import { Link, useLocation } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isLanding = location.pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isLanding) return null;

  const authLink = user ? "/dashboard" : "/auth";

  return (
    <nav className="sticky top-0 z-50 glass-panel">
      <div className="container mx-auto flex items-center justify-between h-16 px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-md">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-extrabold text-foreground tracking-tight">StudentHub</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">How It Works</a>
          <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">Testimonials</a>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">About</Link>
          <Link to="/developer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">Developer</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to={authLink}>
            <Button variant="ghost" size="sm" className="font-semibold rounded-2xl h-10 px-5">{user ? "Dashboard" : "Log In"}</Button>
          </Link>
          {!user && (
            <Link to="/auth">
              <Button size="default" className="font-extrabold rounded-3xl h-12 px-8 shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:scale-105 transition-all duration-300">
                Get Started
              </Button>
            </Link>
          )}
        </div>

        <button className="md:hidden w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-muted/60 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card px-5 py-4 space-y-3 animate-fade-in">
          <a href="#features" className="block text-sm font-medium text-muted-foreground py-2">Features</a>
          <a href="#how-it-works" className="block text-sm font-medium text-muted-foreground py-2">How It Works</a>
          <a href="#testimonials" className="block text-sm font-medium text-muted-foreground py-2">Testimonials</a>
          <Link to="/about" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>About</Link>
          <Link to="/developer" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>Developer</Link>
          <div className="flex gap-3 pt-3">
            <Link to={authLink}><Button variant="ghost" size="sm" className="font-semibold rounded-2xl">{user ? "Dashboard" : "Log In"}</Button></Link>
            {!user && <Link to="/auth"><Button size="default" className="font-extrabold rounded-3xl h-11 px-6 shadow-lg bg-gradient-to-r from-primary to-primary/80">Get Started</Button></Link>}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
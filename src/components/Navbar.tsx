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
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-3 py-2">
      <div className="flex items-center justify-between h-12 px-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-md font-bold text-[#0F172A] tracking-tight">StudentHub</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">Features</a>
          <a href="#how-it-works" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#testimonials" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">Team</a>
          <Link to="/about" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">About</Link>
          <Link to="/developer" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">Developer</Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link to={authLink}>
            <Button variant="ghost" size="sm" className="font-semibold text-xs rounded-full h-9 px-4 text-slate-600 hover:bg-slate-50 stripe-btn-hover">{user ? "Dashboard" : "Log In"}</Button>
          </Link>
          {!user && (
            <Link to="/auth">
              <Button size="sm" className="font-semibold text-xs rounded-full h-9 px-5 bg-slate-900 hover:bg-slate-800 text-white shadow-sm stripe-btn-hover">
                Get Started
              </Button>
            </Link>
          )}
        </div>

        <button className="md:hidden w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors border" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-4 h-4 text-slate-600" /> : <Menu className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 rounded-3xl mt-2 p-4 space-y-2.5 border border-slate-100 shadow-lg animate-fade-in absolute left-0 right-0">
          <a href="#features" className="block text-xs font-semibold text-slate-600 py-1.5 px-3 rounded-lg hover:bg-slate-50" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#how-it-works" className="block text-xs font-semibold text-slate-600 py-1.5 px-3 rounded-lg hover:bg-slate-50" onClick={() => setMobileOpen(false)}>How It Works</a>
          <a href="#testimonials" className="block text-xs font-semibold text-slate-600 py-1.5 px-3 rounded-lg hover:bg-slate-50" onClick={() => setMobileOpen(false)}>Team</a>
          <Link to="/about" className="block text-xs font-semibold text-slate-600 py-1.5 px-3 rounded-lg hover:bg-slate-50" onClick={() => { setMobileOpen(false); }}>About</Link>
          <Link to="/developer" className="block text-xs font-semibold text-slate-600 py-1.5 px-3 rounded-lg hover:bg-slate-50" onClick={() => { setMobileOpen(false); }}>Developer</Link>
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <Link to={authLink} className="flex-1" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="sm" className="w-full font-semibold text-xs rounded-full h-9">{user ? "Dashboard" : "Log In"}</Button>
            </Link>
            {!user && (
              <Link to="/auth" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full font-bold text-xs rounded-full h-9 bg-[#0F172A] hover:bg-[#1E293B] text-white">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
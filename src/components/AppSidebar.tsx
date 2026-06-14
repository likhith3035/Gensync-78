import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, FolderKanban, BookOpen, User, Settings, GraduationCap, Shield, Share2, LogOut, MessageCircle, Calendar, Bookmark, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Briefcase, label: "Opportunities", path: "/opportunities" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: BookOpen, label: "Resources", path: "/resources" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: Users, label: "Community", path: "/community" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: Share2, label: "Sharing Hub", path: "/shares" },
  { icon: Bookmark, label: "Bookmarks", path: "/bookmarks" },
  { icon: TrendingUp, label: "Activity Feed", path: "/activity" },
  { icon: User, label: "Profile", path: "/profile" },
];

const AppSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <aside className="hidden md:flex flex-col w-[17rem] min-h-screen bg-card border-r border-border/30 px-4 py-6">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 mb-10 px-3">
        <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-md">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <span className="text-[1.1rem] font-extrabold text-foreground tracking-tight">StudentHub</span>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">by GenSync</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[0.825rem] font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Icon className={`w-[19px] h-[19px] shrink-0 ${isActive ? "text-primary" : ""}`} />
              {label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-5 pb-1.5 px-4">
              <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">Admin</p>
            </div>
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[0.825rem] font-semibold transition-all duration-300 ${
                location.pathname === "/admin"
                  ? "bg-destructive/8 text-destructive"
                  : "text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
              }`}
            >
              <Shield className="w-[19px] h-[19px] shrink-0" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-border/30 pt-4 mt-4 space-y-2">
        <Link
          to="/profile"
          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-[0.825rem] font-semibold text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all duration-300"
        >
          <LogOut className="w-[17px] h-[17px]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
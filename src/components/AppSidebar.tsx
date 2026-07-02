import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, FolderKanban, BookOpen, User, Settings, GraduationCap, Shield, Share2, LogOut, Calendar, Bookmark, TrendingUp, Users, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Heart, label: "Social Feed", path: "/feed" },
  { icon: Briefcase, label: "Opportunities", path: "/opportunities" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: BookOpen, label: "Resources", path: "/resources" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: Users, label: "Community", path: "/community" },
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
    <aside className="hidden md:flex flex-col w-[17rem] min-h-screen bg-white/60 backdrop-blur-md border-r border-slate-100/80 px-4 py-6">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 mb-10 px-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-[1.1rem] font-extrabold text-[#0F172A] tracking-tight">StudentHub</span>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">by GenSync</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-full text-[0.825rem] font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100/60 hover:text-slate-900"
              }`}
            >
              <Icon className="w-[19px] h-[19px] shrink-0" />
              {label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-5 pb-1.5 px-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Admin</p>
            </div>
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-full text-[0.825rem] font-semibold transition-all duration-300 ${
                location.pathname === "/admin"
                  ? "bg-destructive text-destructive-foreground shadow-sm"
                  : "text-slate-600 hover:bg-destructive/10 hover:text-destructive"
              }`}
            >
              <Shield className="w-[19px] h-[19px] shrink-0" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
        <Link
          to="/profile"
          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100/60 transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0F172A] truncate">{displayName}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-full text-[0.825rem] font-semibold text-slate-500 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
        >
          <LogOut className="w-[17px] h-[17px]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
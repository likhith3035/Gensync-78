import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, FolderKanban, BookOpen, User, Shield, Share2, Users } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const baseItems = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
  { icon: Users, label: "Community", path: "/community" },
  { icon: BookOpen, label: "Resources", path: "/resources" },
  { icon: User, label: "Profile", path: "/profile" },
];

const MobileNav = () => {
  const location = useLocation();
  const { isAdmin } = useIsAdmin();

  const items = isAdmin
    ? [...baseItems.slice(0, 3), { icon: Shield, label: "Admin", path: "/admin" }, baseItems[3]]
    : baseItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel safe-bottom">
      <div className="flex justify-around items-end px-2 pt-1.5 pb-2">
        {items.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center gap-0.5 min-w-[3.5rem] py-1"
            >
              <div
                className={`relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-primary/12"
                    : ""
                }`}
              >
                <Icon
                  className={`w-[20px] h-[20px] transition-all duration-300 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors duration-300 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
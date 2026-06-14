import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { Helmet } from "react-helmet-async";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  opportunities: "Opportunities",
  projects: "Projects",
  resources: "Resources",
  events: "Events",
  messages: "Messages",
  shares: "Sharing Hub",
  profile: "Profile",
  about: "About",
  developer: "Developer",
  admin: "Admin",
  info: "Info & Tips",
};

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => ({
    label: routeLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
    path: "/" + segments.slice(0, i + 1).join("/"),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      ...crumbs.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: crumb.label,
        item: `${BASE_URL}${crumb.path}`,
      })),
    ],
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-1.5 text-sm flex-wrap">
          <li>
            <Link
              to="/dashboard"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                {isLast ? (
                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium truncate max-w-[200px]"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;

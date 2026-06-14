import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ban } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-sarvam-ambient p-5">
      <SEO title="Page Not Found" noindex />
      <div className="card-premium-light p-8 text-center max-w-md w-full animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-6 border border-rose-100 shadow-sm">
          <Ban className="w-7 h-7 text-rose-500" />
        </div>
        <h1 className="mb-2 text-6xl font-bold font-serif-elegant text-slate-900">404</h1>
        <p className="mb-6 text-base text-slate-500">Oops! The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button className="gap-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white px-6 h-11 shadow-sm">
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

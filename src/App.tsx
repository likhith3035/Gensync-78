import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import PageTransition from "@/components/PageTransition";

// Lazy-loaded page components
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Opportunities = lazy(() => import("./pages/Opportunities"));
const Projects = lazy(() => import("./pages/Projects"));
const Resources = lazy(() => import("./pages/Resources"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const Shares = lazy(() => import("./pages/Shares"));
const SharedView = lazy(() => import("./pages/SharedView"));
const Events = lazy(() => import("./pages/Events"));
const About = lazy(() => import("./pages/About"));
const Developer = lazy(() => import("./pages/Developer"));
const Info = lazy(() => import("./pages/Info"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const ActivityFeed = lazy(() => import("./pages/ActivityFeed"));
const Community = lazy(() => import("./pages/Community"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Premium glassmorphic page loading skeleton
const PageLoader = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50/30 backdrop-blur-lg dark:bg-slate-950/30">
    <div className="relative flex flex-col items-center gap-4">
      {/* Animated gradient ring */}
      <div className="w-12 h-12 rounded-full border-[3px] border-slate-100 border-t-primary animate-spin shadow-md" />
      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase animate-pulse">
        Loading StudentHub
      </span>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PwaInstallPrompt />
        <BrowserRouter>
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/about" element={<About />} />
                <Route path="/developer" element={<Developer />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/shares" element={<ProtectedRoute><Shares /></ProtectedRoute>} />
                <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
                <Route path="/info" element={<ProtectedRoute><Info /></ProtectedRoute>} />
                <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
                <Route path="/activity" element={<ProtectedRoute><ActivityFeed /></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                <Route path="/shared/:token" element={<SharedView />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </PageTransition>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

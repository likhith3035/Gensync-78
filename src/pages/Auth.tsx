import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { GraduationCap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail, 
  confirmPasswordReset,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

const Auth = () => {
  const { user, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = location.state?.from || "/dashboard";

  useEffect(() => {
    const checkRecovery = () => {
      const hash = window.location.hash;
      const query = new URLSearchParams(window.location.search);
      const mode = query.get("mode") || "";
      const oobCode = query.get("oobCode") || "";
      
      if (
        hash.includes("type=recovery") || 
        query.get("type") === "recovery" || 
        hash.includes("recovery_token=") ||
        (mode === "resetPassword" && oobCode)
      ) {
        setIsRecovery(true);
        setIsLogin(true);
      }
    };

    checkRecovery();
    window.addEventListener("hashchange", checkRecovery);
    return () => window.removeEventListener("hashchange", checkRecovery);
  }, []);
  useEffect(() => {
    if (user && !authLoading && !isRecovery) {
      navigate(fromPath, { replace: true });
    }
  }, [user, authLoading, navigate, fromPath, isRecovery]);

  const isAllowedEmail = (emailStr: string) => {
    const lowerEmail = emailStr.toLowerCase().trim();
    
    // Explicitly allow the admin accounts
    const admins = ["kamilikhith@gmail.com", "uppumanogna@gmail.com", "luckylucky12h@gmail.com", "limaaiuse@gmail.com"];
    if (admins.includes(lowerEmail)) {
      return true;
    }

    // Allow all valid email addresses to sign up/in
    return lowerEmail.includes("@");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isAllowedEmail(email)) {
      toast.error("Access restricted: Only student emails from @nbkrist.org, @srmap.edu.in, or .edu/.edu.in educational domains are allowed.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
        navigate(fromPath);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: fullName });
          toast.success("Account created and logged in!");
          navigate(fromPath);
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth`,
      });
      toast.success("Password reset link sent to your email!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const query = new URLSearchParams(window.location.search);
    const oobCode = query.get("oobCode") || "";
    
    try {
      if (oobCode) {
        await confirmPasswordReset(auth, oobCode, password);
        toast.success("Password updated successfully!");
        setIsRecovery(false);
        setIsLogin(true);
        navigate("/auth");
      } else {
        if (auth.currentUser) {
          const { updatePassword } = await import("firebase/auth");
          await updatePassword(auth.currentUser, password);
          toast.success("Password updated successfully!");
          setIsRecovery(false);
          navigate(fromPath);
        } else {
          toast.error("No active session found. Please request a new link.");
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user) {
        if (user.email && !isAllowedEmail(user.email)) {
          await auth.signOut();
          toast.error("Access restricted: Only student emails from @nbkrist.org, @srmap.edu.in, or .edu/.edu.in educational domains are allowed.");
          return;
        }
        toast.success("Welcome back!");
        navigate(fromPath);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-background">
      <SEO
        title="Sign Up & Log In"
        description="Join StudentHub for free — sign up or log in to access resource sharing, internship discovery, project collaboration, messaging, and campus events. Created by GenSync."
        canonical="/auth"
        keywords="studenthub login, studenthub signup, join studenthub, student login, campus app register"
      />
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-[1.75rem] font-extrabold text-foreground tracking-tight">
            {isRecovery ? "Reset Password" : isLogin ? "Welcome back" : "Join StudentHub"}
          </h1>
          <p className="text-muted-foreground mt-2 text-[0.9rem]">
            {isRecovery 
              ? "You've successfully signed in via recovery link. Would you like to change your password now?" 
              : isLogin 
                ? "Sign in to your student account" 
                : "Create your free student account"}
          </p>
        </div>

        {/* Card */}
        <div className="card-campus p-7 sm:p-8" style={{ boxShadow: "0 20px 60px -12px hsl(210 20% 20% / 0.08)" }}>
          <form onSubmit={isRecovery ? handleUpdatePassword : handleEmailAuth} className="space-y-3.5">
            {!isRecovery && !isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="oneui-input pl-11"
                  required
                />
              </div>
            )}
            
            {!isRecovery && (
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="oneui-input pl-11"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={isRecovery ? "New password" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="oneui-input pl-11 pr-11"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {isLogin && !isRecovery && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full h-13 gap-1.5 font-semibold text-sm rounded-2xl mt-2" disabled={loading}>
              {loading 
                ? "Loading..." 
                : isRecovery 
                  ? "Update Password" 
                  : isLogin 
                    ? "Sign In" 
                    : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </Button>

            {!isRecovery && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-13 gap-2.5 font-semibold text-sm rounded-2xl border-border/60 hover:bg-muted/40 transition-colors"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
              </>
            )}
          </form>

          {!isRecovery ? (
            <p className="text-center text-sm text-muted-foreground mt-6">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-semibold hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          ) : (
            <div className="flex flex-col gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsRecovery(false);
                  navigate(fromPath);
                }}
                className="text-primary font-semibold hover:underline text-sm w-full text-center"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={() => setIsRecovery(false)}
                className="text-muted-foreground hover:text-foreground text-xs w-full text-center"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Free to join for all college students
        </p>
      </div>
    </div>
  );
};

export default Auth;
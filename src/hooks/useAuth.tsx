import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { getDeterministicUuid } from "@/lib/authHelpers";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: any; // Mapped to match user type
  session: any; // Dummy session to satisfy imports
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any stale Supabase session tokens in localStorage on mount
    supabase.auth.signOut().catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const mappedUser = {
          id: getDeterministicUuid(fbUser.uid),
          uid: fbUser.uid,
          email: fbUser.email || "",
          user_metadata: {
            full_name: fbUser.displayName || fbUser.email?.split("@")[0] || "Student",
          },
        };
        setUser(mappedUser);
        setSession({ user: mappedUser, access_token: "dummy" }); // Mock session

        // Sync user profile name and email to public profiles table
        const userUuid = getDeterministicUuid(fbUser.uid);
        const fullName = fbUser.displayName || fbUser.email?.split("@")[0] || "Student";
        const email = fbUser.email || "";

        supabase
          .from("profiles")
          .select("id")
          .eq("user_id", userUuid)
          .maybeSingle()
          .then(({ data, error }) => {
            if (!error) {
              if (!data) {
                supabase
                  .from("profiles")
                  .insert({
                    user_id: userUuid,
                    full_name: fullName,
                    email: email
                  })
                  .then(() => {});
              } else {
                supabase
                  .from("profiles")
                  .update({
                    full_name: fullName,
                    email: email
                  })
                  .eq("user_id", userUuid)
                  .then(() => {});
              }
            }
          });
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

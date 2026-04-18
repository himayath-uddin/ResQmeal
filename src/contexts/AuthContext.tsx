import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { getSessionFromFirebaseUser } from "@/lib/firebase-auth";
import type { AuthSession } from "@/lib/auth";

type AuthContextType = {
  user: AuthSession | null;
  isReady: boolean;
  login: (user: AuthSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isReady: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsReady(true);
        return;
      }

      try {
        const nextSession = await getSessionFromFirebaseUser(firebaseUser);
        setUser(nextSession);
      } catch (error) {
        console.error("Failed to restore Firebase session", error);
        setUser(null);
      } finally {
        setIsReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: AuthSession) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    void signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

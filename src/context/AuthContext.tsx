/**
 * BNKhub — Contexte d'authentification.
 * Uses localStorage to provide fully functional local authentication.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  user_metadata?: { username?: string };
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session on load
    const savedSession = localStorage.getItem("bnkhub_session");
    if (savedSession) {
      try {
        const u = JSON.parse(savedSession);
        setUser(u);
      } catch (e) {
        console.error("Failed to parse session", e);
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    // Mock signup
    const usersStr = localStorage.getItem("bnkhub_users") || "[]";
    const users = JSON.parse(usersStr);
    
    if (users.find((u: any) => u.email === email)) {
      throw new Error("Un compte existe déjà avec cette adresse e-mail.");
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password, // In a real app this would be hashed
      user_metadata: { username: username || email.split("@")[0] }
    };

    users.push(newUser);
    localStorage.setItem("bnkhub_users", JSON.stringify(users));

    const sessionUser = { id: newUser.id, email: newUser.email, user_metadata: newUser.user_metadata };
    localStorage.setItem("bnkhub_session", JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const signIn = async (email: string, password: string) => {
    const usersStr = localStorage.getItem("bnkhub_users") || "[]";
    const users = JSON.parse(usersStr);
    
    const u = users.find((u: any) => u.email === email && u.password === password);
    if (!u) {
      throw new Error("E-mail ou mot de passe incorrect.");
    }

    const sessionUser = { id: u.id, email: u.email, user_metadata: u.user_metadata };
    localStorage.setItem("bnkhub_session", JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const signOut = async () => {
    localStorage.removeItem("bnkhub_session");
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, signOut, signIn, signUp }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

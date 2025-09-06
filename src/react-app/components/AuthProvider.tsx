import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase, checkIsAdmin, getAdminByGitHubId, upsertAdminUser, signInWithGitHub, signOut as supabaseSignOut, AdminUser } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  adminUser: AdminUser | null;
  loading: boolean;
  signInWithGitHub: () => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Função para verificar e configurar dados do administrador
  const checkAndSetupAdmin = async (user: User) => {
    if (!user?.user_metadata?.provider_id) {
      setIsAdmin(false);
      setAdminUser(null);
      return;
    }

    const githubId = user.user_metadata.provider_id.toString();
    
    // Verificar se é administrador
    const adminStatus = await checkIsAdmin(githubId);
    setIsAdmin(adminStatus);

    if (adminStatus) {
      // Obter dados do administrador
      let adminData = await getAdminByGitHubId(githubId);
      
      // Se não encontrou dados, criar registro (primeiro login)
      if (!adminData) {
        const userData = {
          github_id: parseInt(githubId),
         github_username: user.user_metadata.user_name || user.user_metadata.preferred_username || "",
          email: user.email || '',
          name: user.user_metadata.full_name || user.user_metadata.name || '',
          avatar_url: user.user_metadata.avatar_url || ''
        };

        const { data } = await upsertAdminUser(userData);
        adminData = data?.[0] || null;
      }
      
      setAdminUser(adminData);
    } else {
      setAdminUser(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkAndSetupAdmin(session.user);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAndSetupAdmin(session.user);
        } else {
          setIsAdmin(false);
          setAdminUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    setIsAdmin(false);
    setAdminUser(null);
    await supabaseSignOut();
  };

  const value = {
    user,
    session,
    adminUser,
    loading,
    signInWithGitHub,
    signOut: handleSignOut,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  username: string;
  name: string;
}

interface AuthContextType {
  user: AdminUser | null;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('admin_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, name')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        return { error: 'Usuário ou senha incorretos' };
      }

      const adminUser = { id: data.id, username: data.username, name: data.name };
      setUser(adminUser);
      localStorage.setItem('admin_user', JSON.stringify(adminUser));
      
      return { error: null };
    } catch (error) {
      return { error: 'Erro ao fazer login' };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('admin_user');
  };

  const value = {
    user,
    signIn,
    signOut,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
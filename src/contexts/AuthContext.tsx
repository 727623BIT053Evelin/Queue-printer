
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authApi } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: 'student' | 'admin' | null;
  login: (email: string, password: string, role: 'student' | 'admin') => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'student' | 'admin' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);

    // Load role from localStorage if exists
    const savedRole = localStorage.getItem('userRole') as 'student' | 'admin' | null;
    setRole(savedRole || null);

    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'admin') => {
    try {
      setLoading(true);
      const user = await authApi.login(email, password);
      setUser(user);
      setRole(role);
      localStorage.setItem('userRole', role);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username} (${role})!`,
      });
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      const user = await authApi.register(username, email, password);
      setUser(user);
      setRole('student');
      localStorage.setItem('userRole', 'student');
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.username}!`,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again with different credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setRole(null);
      localStorage.removeItem('userRole');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


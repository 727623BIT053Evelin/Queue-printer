
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Printer, LogOut, User } from 'lucide-react';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full logo-gradient flex items-center justify-center">
            <Printer className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-gray-900">PrintQueue</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/queue" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            Queue Status
          </Link>
          <Link to="/upload" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            Upload Document
          </Link>
          <Link to="/documents" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            My Documents
          </Link>
        </nav>
        
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium hidden md:inline-block">Hi, {user.username}</span>
              <Button variant="ghost" size="icon" onClick={() => logout()}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="default" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;

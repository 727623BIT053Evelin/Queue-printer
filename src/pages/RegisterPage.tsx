
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Printer, Loader2 } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith('@mcet.in')) {
      setEmailError('Email must end with @mcet.in');
      return;
    }
    setEmailError('');
    try {
      await register(username, email, password);
      navigate('/documents');
    } catch (error) {
      // Error is handled in the Auth context with toast
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-full logo-gradient flex items-center justify-center">
            <Printer className="text-white h-6 w-6" />
          </div>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@mcet.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {emailError && <div className="text-red-600 text-xs">{emailError}</div>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-primary underline hover:text-primary/80">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

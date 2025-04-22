
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "admin">("student");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password, role);
      toast({
        title: `Logged in as ${role}`,
        description: "You have been successfully logged in.",
        variant: "default",
      });
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-sm w-full space-y-4">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        <div>
          <label htmlFor="email" className="block text-xs font-medium mb-1">Email</label>
          <Input 
            id="email"
            type="email"
            placeholder="yourname@mcet.in"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-medium mb-1">Password</label>
          <Input 
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 mb-2">Login as</label>
          <RadioGroup value={role} onValueChange={v => setRole(v as "student" | "admin")} className="flex gap-6">
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="student" id="login-student" />
              <label htmlFor="login-student">Student</label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="admin" id="login-admin" />
              <label htmlFor="login-admin">Admin</label>
            </div>
          </RadioGroup>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;

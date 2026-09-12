"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, { email, password });
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        alert("Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 selection:bg-green-100">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-600 p-2.5 rounded-xl mb-4 shadow-sm">
            <Zap size={28} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {isLogin ? "Enter your details to sign in to your account" : "Sign up to start automating your tasks"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm"
                required
              />
            </div>
          </div>

          {isLogin && (
            <div className="flex justify-end -mt-2">
              <a href="#" className="text-xs font-medium text-green-600 hover:text-green-700">
                Forgot password?
              </a>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="group relative flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-2"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {isLogin ? "Sign in" : "Sign up"}
                <ArrowRight size={18} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-green-600 hover:text-green-700 hover:underline transition-all"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

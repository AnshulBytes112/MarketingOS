/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff, Zap, BarChart3, Globe, Activity } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/overview";

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to login");
      }

      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0A11] text-white relative overflow-hidden font-sans p-4">
      {/* Background Glows and Lines */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1200px] pointer-events-none opacity-20">
        <div className="absolute w-[800px] h-[400px] bg-purple-600 rounded-full blur-[150px] -left-64 top-1/4" />
        <div className="absolute w-[800px] h-[400px] bg-blue-600 rounded-full blur-[150px] -right-64 bottom-1/4" />
        {/* Simulate the curved background lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path d="M0,400 Q250,500 500,400 T1000,400" fill="none" stroke="rgba(147, 51, 234, 0.4)" strokeWidth="1" />
          <path d="M0,500 Q250,600 500,500 T1000,500" fill="none" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1" />
          <path d="M0,600 Q250,700 500,600 T1000,600" fill="none" stroke="rgba(147, 51, 234, 0.2)" strokeWidth="1" />
        </svg>
      </div>

      <div className="z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
            <Zap className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">AI Brand Growth Engine</h1>
          <p className="text-sm text-gray-400">Smarter Marketing. Bigger Impact.</p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-[#16151A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Welcome Back 👋</h2>
            <p className="text-sm text-gray-400">Log in to your workspace to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-[#0B0A11]/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-300">Password</label>
                <Link href="#" className="text-xs text-blue-500 hover:text-blue-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-[#0B0A11]/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1 pb-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/50 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] text-white rounded-lg py-2.5 text-sm font-medium transition-all flex items-center justify-center shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Log In <span className="ml-2">→</span>
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <div className="h-px w-full bg-white/10" />
            <span className="px-3 text-xs text-gray-500 whitespace-nowrap">or continue with</span>
            <div className="h-px w-full bg-white/10" />
          </div>

          <button className="mt-6 w-full bg-transparent border border-white/10 hover:bg-white/5 text-white rounded-lg py-2.5 text-sm font-medium transition-all flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-xs text-gray-400">
            Don't have an account? <Link href="/signup" className="text-blue-500 hover:text-blue-400 transition-colors">Sign up</Link>
          </p>
        </div>

        {/* Feature Highlights Footer */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-[#16151A] border border-white/5 rounded-xl flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-[11px] font-semibold mb-1">AI-Powered Insights</h3>
            <p className="text-[10px] text-gray-500 leading-tight">Extract brand DNA and<br />analyze competitors</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-[#16151A] border border-white/5 rounded-xl flex items-center justify-center mb-3">
              <Globe className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-[11px] font-semibold mb-1">Multi-Channel Publishing</h3>
            <p className="text-[10px] text-gray-500 leading-tight">Publish and manage across<br />all your channels</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-[#16151A] border border-white/5 rounded-xl flex items-center justify-center mb-3">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-[11px] font-semibold mb-1">Data-Driven Growth</h3>
            <p className="text-[10px] text-gray-500 leading-tight">Optimize continuously<br />and maximize ROI</p>
          </div>
        </div>

        <div className="mt-8 text-[10px] text-gray-600">
          © 2025 AI Brand Growth Engine. All rights reserved.
        </div>
      </div>
      
      {/* Absolute Header Badge */}
      <div className="absolute top-6 left-6 px-3 py-1 bg-[#16151A] border border-white/5 rounded-full text-[10px] font-semibold tracking-wider text-purple-400">
        WEB (TENANT) LOGIN
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0B0A11]"><Loader2 className="animate-spin text-white" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

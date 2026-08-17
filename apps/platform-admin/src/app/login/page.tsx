'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, Eye, EyeOff, Shield, Zap, ShieldCheck } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, totpCode }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to authenticate');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0A11] text-white relative overflow-hidden font-sans p-4">
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at top right, black 40%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at top right, black 40%, transparent 70%)'
        }}
      />
      {/* Right side subtle glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[180px] opacity-10 pointer-events-none" />

      <div className="z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <Zap className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">AI Brand Growth Engine</h1>
          <p className="text-sm text-gray-400">Super Admin Control Center</p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-[#16151A]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
              Super Admin Login <Shield className="w-5 h-5 text-gray-400" />
            </h2>
            <p className="text-sm text-gray-400">Secure access to the platform control center</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="admin@aibrandos.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-[#0B0A11]/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">Password</label>
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

            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-300">Two-Factor Authentication</label>
                <Link href="#" className="text-xs text-blue-500 hover:text-blue-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <p className="text-[10px] text-gray-500 pb-1">Enter the 6-digit code from your authenticator app</p>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="000000"
                  required
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-[#0B0A11]/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all tracking-[0.2em]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 pb-2">
              <input
                type="checkbox"
                id="rememberDevice"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/50 cursor-pointer"
              />
              <label htmlFor="rememberDevice" className="text-xs text-gray-400 cursor-pointer select-none">
                Remember this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] text-white rounded-lg py-2.5 text-sm font-medium transition-all flex items-center justify-center shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] disabled:opacity-70 mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Log In <span className="ml-2">→</span>
            </button>
          </form>

          {/* Secure Admin Access Banner */}
          <div className="mt-6 bg-[#0B0A11]/80 border border-indigo-500/20 rounded-xl p-4 flex gap-3 items-start">
            <Lock className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-indigo-300 mb-0.5">Secure Admin Access</h4>
              <p className="text-[10px] text-gray-400 leading-snug">
                All admin actions are logged and monitored for your security.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Need help? <Link href="#" className="text-blue-500 hover:text-blue-400 transition-colors">Contact Support</Link>
          </p>
        </div>

        <div className="mt-12 text-[10px] text-gray-600">
          © 2025 AI Brand Growth Engine. All rights reserved.
        </div>
      </div>
      
      {/* Absolute Header Badge */}
      <div className="absolute top-6 left-6 px-3 py-1 bg-[#16151A] border border-white/5 rounded-full text-[10px] font-semibold tracking-wider text-indigo-400">
        SUPER ADMIN LOGIN
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0B0A11]"><Loader2 className="animate-spin text-white" /></div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

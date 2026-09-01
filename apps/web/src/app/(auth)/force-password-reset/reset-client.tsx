"use client";

import { useState } from "react";
import { resetPassword } from "./actions";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

export function ForcePasswordResetClient() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(password);
      router.push("/overview");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0A11] p-4 font-sans text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-[#16151A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 relative z-10 shadow-2xl">
        <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-purple-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-center">Change Your Password</h1>
        <p className="text-gray-400 text-sm mb-8 text-center leading-relaxed">
          For security reasons, you must change your temporary password before accessing your account.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">New Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#0B0A11]/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-[#0B0A11]/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm py-3 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Lock className="w-4 h-4" /> Save Password</>}
          </button>
        </form>
      </div>
    </div>
  );
}

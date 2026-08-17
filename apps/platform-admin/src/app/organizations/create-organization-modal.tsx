'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, X, Building2, User, Key, Check } from 'lucide-react';

export default function CreateOrganizationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [planTier, setPlanTier] = useState('STARTER');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('password123');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          planTier,
          ownerName,
          ownerEmail,
          ownerPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create organization');
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        // Reset form
        setName('');
        setSlug('');
        setOwnerName('');
        setOwnerEmail('');
        setOwnerPassword('password123');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2 text-sm"
      >
        <Plus className="w-4 h-4" />
        Create Organization
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#16151A] border border-white/10 text-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-lg text-white">Create New Organization</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Organization created successfully! Refreshing...
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Organization Details
                </h4>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Acme Corp"
                    value={name}
                    onChange={handleNameChange}
                    className="w-full bg-[#0B0A11] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Slug / Subdomain *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="acme-corp"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-[#0B0A11] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Plan Tier
                    </label>
                    <select
                      value={planTier}
                      onChange={(e) => setPlanTier(e.target.value)}
                      className="w-full bg-[#0B0A11] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="STARTER">STARTER</option>
                      <option value="GROWTH">GROWTH</option>
                      <option value="SCALE">SCALE</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-3 border-t border-white/10">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Primary Tenant Owner
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full bg-[#0B0A11] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Owner Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@acme.com"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className="w-full bg-[#0B0A11] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <Key className="w-3 h-3 text-gray-400" /> Initial Password
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="password123"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    className="w-full bg-[#0B0A11] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    The owner will use this password to log in to the web app (`http://localhost:3000/login`).
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || success}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isLoading ? 'Creating...' : 'Create Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

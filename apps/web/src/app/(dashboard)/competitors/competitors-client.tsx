'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Edit, Trash2, Loader2, AlertCircle, ExternalLink, Globe, ShieldAlert
} from 'lucide-react';
import { 
  getCompetitors, createCompetitor, updateCompetitor, deleteCompetitor
} from './actions';
import { createCompetitorSchema } from './schemas';
import { BrandCompetitor } from '@prisma/client';

interface CompetitorsClientProps {
  brandId: string;
  userRole: string;
}

// Custom Premium Social Icon SVGs
const SocialIcon = ({ platform, className = "w-4 h-4" }: { platform: string, className?: string }) => {
  switch (platform) {
    case 'instagram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    case 'twitter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.17 1.22 1.32 2.92 2.1 4.74 2.2v3.77c-1.89-.04-3.72-.75-5.18-1.99-.08-.07-.15-.14-.23-.22v6.62c.03 2.19-.89 4.34-2.52 5.82-1.8 1.69-4.32 2.45-6.75 2.05-2.61-.41-4.9-2.28-5.75-4.79-.97-2.82-.41-6.07 1.51-8.32 1.63-1.96 4.1-3.04 6.67-2.92v3.74c-1.53-.16-3.08.38-4.08 1.56-.99 1.15-1.31 2.82-.82 4.28.48 1.48 1.86 2.58 3.42 2.76 1.49.2 3.05-.33 3.93-1.56.68-.89.98-2.05.95-3.16V0h-.4z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      );
    case 'youtube':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
        </svg>
      );
    default:
      return null;
  }
};

const getSocialUrl = (platform: string, handle: string): string => {
  if (handle.startsWith('http')) return handle;
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${handle}`;
    case 'twitter':
      return `https://x.com/${handle}`;
    case 'tiktok':
      return `https://tiktok.com/@${handle}`;
    case 'facebook':
      return `https://facebook.com/${handle}`;
    case 'linkedin':
      return `https://linkedin.com/company/${handle}`;
    case 'youtube':
      return handle.startsWith('@') ? `https://youtube.com/${handle}` : `https://youtube.com/@${handle}`;
    default:
      return '#';
  }
};

export default function CompetitorsClient({ brandId, userRole }: CompetitorsClientProps) {
  const queryClient = useQueryClient();
  const isViewer = userRole === 'VIEWER';

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<BrandCompetitor | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');

  // Error States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Queries
  const { data: competitors = [], isLoading, error } = useQuery<BrandCompetitor[]>({
    queryKey: ['competitors', brandId],
    queryFn: () => getCompetitors(brandId),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof createCompetitor>[1]) => createCompetitor(brandId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors', brandId] });
      closeModal();
    },
    onError: (err: Error) => {
      setGlobalError(err.message || 'Failed to create competitor');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Parameters<typeof updateCompetitor>[2] }) => updateCompetitor(id, brandId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors', brandId] });
      closeModal();
    },
    onError: (err: Error) => {
      setGlobalError(err.message || 'Failed to update competitor');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCompetitor(id, brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors', brandId] });
    },
    onError: (err: Error) => {
      alert(err.message || 'Failed to delete competitor');
    }
  });

  // Handlers
  const openAddModal = () => {
    if (isViewer) return;
    setEditingCompetitor(null);
    setName('');
    setWebsiteUrl('');
    setInstagram('');
    setFacebook('');
    setLinkedin('');
    setTwitter('');
    setYoutube('');
    setTiktok('');
    setErrors({});
    setGlobalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (comp: BrandCompetitor) => {
    if (isViewer) return;
    setEditingCompetitor(comp);
    setName(comp.name);
    setWebsiteUrl(comp.websiteUrl || '');
    setInstagram(comp.instagram || '');
    setFacebook(comp.facebook || '');
    setLinkedin(comp.linkedin || '');
    setTwitter(comp.twitter || '');
    setYoutube(comp.youtube || '');
    setTiktok(comp.tiktok || '');
    setErrors({});
    setGlobalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCompetitor(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;

    setErrors({});
    setGlobalError(null);

    const formData = {
      name,
      websiteUrl: websiteUrl || '',
      instagram: instagram || undefined,
      facebook: facebook || undefined,
      linkedin: linkedin || undefined,
      twitter: twitter || undefined,
      youtube: youtube || undefined,
      tiktok: tiktok || undefined,
    };

    // Client-side Zod validation
    const result = createCompetitorSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (editingCompetitor) {
      updateMutation.mutate({ id: editingCompetitor.id, data: result.data });
    } else {
      createMutation.mutate(result.data);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (isViewer) return;
    if (confirm(`Are you sure you want to remove competitor "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Profile Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12111A]/90 border border-white/5 rounded-2xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Competitor Intelligence</h1>
          <p className="text-xs text-gray-400 mt-1">
            Monitor and benchmark your competitive landscape across social channels.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-medium text-white transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30 w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Add Competitor</span>
          </button>
        )}
      </div>

      {isViewer && (
        <div className="bg-blue-500/10 border border-blue-500/25 rounded-2xl p-4 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0" />
          <p className="text-xs text-gray-300">
            You are logged in as a <strong>Viewer</strong>. You can view competitors but do not have permission to add, edit, or delete them.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : error ? (
        <div className="bg-red-500/15 border border-red-500/25 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Failed to load competitors. Please try again.</span>
        </div>
      ) : competitors.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center text-center p-12 bg-[#12111A]/60 border border-white/5 rounded-2xl py-24">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-6">
            <Globe className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No competitors yet</h3>
          <p className="text-sm text-gray-400 max-w-sm mb-8">
            Add competitors to benchmark your presence and identify content opportunities.
          </p>
          {!isViewer && (
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-all shadow-lg shadow-purple-600/30"
            >
              Add your first competitor
            </button>
          )}
        </div>
      ) : (
        // Competitors Table / Card Grid
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-[#12111A]/90 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Website</th>
                  <th className="px-6 py-4 text-center">Social Channels</th>
                  {!isViewer && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {competitors.map((comp) => (
                  <tr key={comp.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/competitors/${comp.id}`} className="text-sm font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-all">
                        {comp.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {comp.websiteUrl ? (
                        <a 
                          href={comp.websiteUrl.startsWith('http') ? comp.websiteUrl : `https://${comp.websiteUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <span>{comp.websiteUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        {['instagram', 'twitter', 'tiktok', 'facebook', 'linkedin', 'youtube'].map((platform) => {
                          const val = comp[platform as keyof BrandCompetitor] as string | null;
                          if (!val) return null;
                          return (
                            <a
                              key={platform}
                              href={getSocialUrl(platform, val)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                              title={`${platform}: ${val}`}
                            >
                              <SocialIcon platform={platform} className="w-4 h-4" />
                            </a>
                          );
                        })}
                        {!comp.instagram && !comp.twitter && !comp.tiktok && !comp.facebook && !comp.linkedin && !comp.youtube && (
                          <span className="text-xs text-gray-500">None connected</span>
                        )}
                      </div>
                    </td>
                    {!isViewer && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(comp)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(comp.id, comp.name)}
                            disabled={deleteMutation.isPending}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteMutation.isPending && deleteMutation.variables === comp.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {competitors.map((comp) => (
              <div key={comp.id} className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Link href={`/competitors/${comp.id}`} className="text-sm font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-all block">
                      {comp.name}
                    </Link>
                    {comp.websiteUrl && (
                      <a 
                        href={comp.websiteUrl.startsWith('http') ? comp.websiteUrl : `https://${comp.websiteUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors mt-1"
                      >
                        <span>{comp.websiteUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {!isViewer && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(comp)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(comp.id, comp.name)}
                        disabled={deleteMutation.isPending}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5">
                  <div className="flex flex-wrap gap-2">
                    {['instagram', 'twitter', 'tiktok', 'facebook', 'linkedin', 'youtube'].map((platform) => {
                      const val = comp[platform as keyof BrandCompetitor] as string | null;
                      if (!val) return null;
                      return (
                        <a
                          key={platform}
                          href={getSocialUrl(platform, val)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <SocialIcon platform={platform} className="w-3.5 h-3.5" />
                          <span>{val}</span>
                        </a>
                      );
                    })}
                    {!comp.instagram && !comp.twitter && !comp.tiktok && !comp.facebook && !comp.linkedin && !comp.youtube && (
                      <span className="text-xs text-gray-500">No social channels connected</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12111A] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                {editingCompetitor ? 'Edit Competitor' : 'Add Competitor'}
              </h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors text-sm font-semibold"
              >
                Cancel
              </button>
            </div>

            {globalError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{globalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Competitor Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Competitor Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nike"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  {errors.name && <p className="text-[11px] text-red-400">{errors.name}</p>}
                </div>

                {/* Website URL */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Website URL</label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="e.g. https://www.nike.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  {errors.websiteUrl && <p className="text-[11px] text-red-400">{errors.websiteUrl}</p>}
                </div>

                {/* Instagram */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <SocialIcon platform="instagram" className="w-3.5 h-3.5 text-pink-400" />
                    <span>Instagram</span>
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@username or URL"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  {errors.instagram && <p className="text-[11px] text-red-400">{errors.instagram}</p>}
                </div>

                {/* X / Twitter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <SocialIcon platform="twitter" className="w-3.5 h-3.5 text-gray-200" />
                    <span>X / Twitter</span>
                  </label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="@username or URL"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  {errors.twitter && <p className="text-[11px] text-red-400">{errors.twitter}</p>}
                </div>

                {/* TikTok */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <SocialIcon platform="tiktok" className="w-3.5 h-3.5 text-teal-400" />
                    <span>TikTok</span>
                  </label>
                  <input
                    type="text"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="@username or URL"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  {errors.tiktok && <p className="text-[11px] text-red-400">{errors.tiktok}</p>}
                </div>

                {/* Facebook */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <SocialIcon platform="facebook" className="w-3.5 h-3.5 text-blue-500" />
                    <span>Facebook</span>
                  </label>
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="Username or URL"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  {errors.facebook && <p className="text-[11px] text-red-400">{errors.facebook}</p>}
                </div>

                {/* LinkedIn */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <SocialIcon platform="linkedin" className="w-3.5 h-3.5 text-blue-400" />
                    <span>LinkedIn</span>
                  </label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="Company or URL"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  {errors.linkedin && <p className="text-[11px] text-red-400">{errors.linkedin}</p>}
                </div>

                {/* YouTube */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <SocialIcon platform="youtube" className="w-3.5 h-3.5 text-red-500" />
                    <span>YouTube</span>
                  </label>
                  <input
                    type="text"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="@channel or URL"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  {errors.youtube && <p className="text-[11px] text-red-400">{errors.youtube}</p>}
                </div>
              </div>

              {/* Submit Section */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-medium text-white transition-all flex items-center gap-1.5"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCompetitor ? 'Save Changes' : 'Add Competitor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

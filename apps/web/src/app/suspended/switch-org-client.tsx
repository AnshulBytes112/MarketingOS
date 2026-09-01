'use client';

import { useState, useEffect } from 'react';
import { getAvailableOrganizations, switchOrganization } from '@/components/layout/org-actions';
import { Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SwitchOrganization() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getAvailableOrganizations().then(orgs => {
      setOrgs(orgs.filter(o => !o.isCurrent));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-500" /></div>;
  }

  if (orgs.length === 0) {
    return null;
  }

  const handleSwitch = async (id: string) => {
    setSwitchingTo(id);
    try {
      await switchOrganization(id);
      router.push('/overview');
      router.refresh();
    } catch (e) {
      console.error(e);
      setSwitchingTo(null);
    }
  };

  return (
    <div className="mt-4 text-left">
      <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wider text-center">Switch to another organization</p>
      <div className="space-y-2">
        {orgs.map(org => (
          <button
            key={org.id}
            onClick={() => handleSwitch(org.id)}
            disabled={switchingTo !== null}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm group"
          >
            <span>{org.name}</span>
            {switchingTo === org.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

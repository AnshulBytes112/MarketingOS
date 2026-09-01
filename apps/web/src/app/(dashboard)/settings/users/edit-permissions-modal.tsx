"use client";

import { useState } from "react";
import { X, Save, AlertTriangle } from "lucide-react";
import { updateUserPermissions } from "./actions";

type CustomPermissions = {
  grant: string[];
  deny: string[];
};

type EditPermissionsModalProps = {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
  registry: Record<string, { module: string; name: string; description: string }>;
  rolePermissions: Record<string, string[]>;
};

export function EditPermissionsModal({ user, onClose, onSuccess, registry, rolePermissions }: EditPermissionsModalProps) {
  const [grant, setGrant] = useState<string[]>(user.customPermissions?.grant || []);
  const [deny, setDeny] = useState<string[]>(user.customPermissions?.deny || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultPermissions = rolePermissions[user.role] || [];
  
  // Group permissions by module
  const modules: Record<string, any[]> = {};
  Object.entries(registry).forEach(([key, info]) => {
    if (!modules[info.module]) modules[info.module] = [];
    modules[info.module].push({ key, ...info });
  });

  const handleToggle = (key: string) => {
    const isDefault = defaultPermissions.includes(key);
    const isGranted = grant.includes(key);
    const isDenied = deny.includes(key);

    if (isDefault) {
      if (isDenied) {
        setDeny(deny.filter(p => p !== key)); // Reset to default (Yes)
      } else {
        setDeny([...deny, key]); // Deny (override default)
      }
    } else {
      if (isGranted) {
        setGrant(grant.filter(p => p !== key)); // Reset to default (No)
      } else {
        setGrant([...grant, key]); // Grant (override default)
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await updateUserPermissions(user.id, { grant, deny });
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all permissions to the role defaults?")) return;
    try {
      setLoading(true);
      setError(null);
      await updateUserPermissions(user.id, null);
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] bg-[#16151A] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Permissions</h2>
            <p className="text-sm text-gray-400 mt-1">
              Customizing access for <span className="text-white font-medium">{user.name}</span> ({user.role})
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {Object.entries(modules).map(([moduleName, permissions]) => (
            <div key={moduleName} className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{moduleName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissions.map((p) => {
                  const isDefault = defaultPermissions.includes(p.key);
                  const isGranted = grant.includes(p.key);
                  const isDenied = deny.includes(p.key);
                  
                  // Compute effective state
                  const isEffectivelyYes = isGranted || (isDefault && !isDenied);
                  
                  let badge = null;
                  if (isDefault && isDenied) {
                    badge = <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded ml-2 border border-red-500/20">Denied</span>;
                  } else if (!isDefault && isGranted) {
                    badge = <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded ml-2 border border-emerald-500/20">Granted</span>;
                  } else {
                    badge = <span className="text-[10px] uppercase font-bold text-gray-500 px-2 py-0.5 rounded ml-2">Default: {isDefault ? "Yes" : "No"}</span>;
                  }

                  return (
                    <button
                      key={p.key}
                      onClick={() => handleToggle(p.key)}
                      className={`text-left p-3 rounded-xl border transition-colors flex items-center justify-between ${
                        isEffectivelyYes 
                          ? "bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20" 
                          : "bg-[#0B0A11]/60 border-white/5 hover:bg-white/5"
                      }`}
                    >
                      <div>
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${isEffectivelyYes ? "text-purple-300" : "text-gray-400"}`}>
                            {p.name}
                          </span>
                          {badge}
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isEffectivelyYes ? "bg-purple-600 border-purple-600" : "border-gray-600"
                      }`}>
                        {isEffectivelyYes && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-[#12111A] flex items-center justify-between">
          <button 
            onClick={handleReset}
            disabled={loading}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Reset to Role Defaults
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

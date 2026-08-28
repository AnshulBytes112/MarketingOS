"use client";

import { useState } from "react";
import { format } from "date-fns";
import { UserPlus, Shield, Ban, CheckCircle, MoreVertical } from "lucide-react";
import { inviteUser, changeRole, deactivateUser, reactivateUser } from "./actions";

type Role = "OWNER" | "ADMIN" | "MARKETING_MANAGER" | "CONTENT_MANAGER" | "DESIGNER" | "ANALYST" | "APPROVER" | "VIEWER";

type UsersClientProps = {
  initialUsers: any[];
  permissions: {
    canCreate: boolean;
    canEditRole: boolean;
    canEditPermissions: boolean;
    canDeactivate: boolean;
    canReactivate: boolean;
  };
};

import { EditPermissionsModal } from "./edit-permissions-modal";
import { PERMISSION_REGISTRY, ROLE_PERMISSIONS } from "@abge/rbac";

export function UsersClient({ initialUsers, permissions }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("VIEWER");
  const [isInviting, setIsInviting] = useState(false);
  
  const [tempPassword, setTempPassword] = useState<{password: string; orgName: string; email: string} | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsInviting(true);
      const res = await inviteUser(inviteEmail, inviteName, inviteRole);
      setTempPassword({ password: res.temporaryPassword as string, orgName: res.organizationName as string, email: inviteEmail });
      
      // Clear form
      setInviteEmail("");
      setInviteName("");
      setInviteRole("VIEWER");
      
      // Optimistic reload or just fetch users. Reload is fine.
      // Actually let's not reload immediately so they can see the password popup.
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      setLoadingId(userId);
      await changeRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      setLoadingId(userId);
      if (currentStatus === "ACTIVE") {
        await deactivateUser(userId);
        setUsers(users.map(u => u.id === userId ? { ...u, status: "DEACTIVATED" } : u));
      } else {
        await reactivateUser(userId);
        setUsers(users.map(u => u.id === userId ? { ...u, status: "ACTIVE" } : u));
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Temporary Password Modal */}
      {tempPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#16151A] border border-white/10 rounded-2xl shadow-2xl p-6 relative">
            <h2 className="text-xl font-bold text-emerald-400 mb-2">User Invited Successfully</h2>
            <div className="text-sm text-gray-300 mb-6 space-y-2">
              <p>Organization: <strong className="text-white">{tempPassword.orgName}</strong></p>
              <p>Email: <strong className="text-white">{tempPassword.email}</strong></p>
              <p className="text-yellow-400 mt-4 text-xs">
                ⚠️ Share this temporary password securely. The user will be forced to change it upon first login. It will not be shown again.
              </p>
            </div>
            
            <div className="bg-[#0B0A11] border border-white/10 rounded-xl p-4 mb-6 flex items-center justify-between">
              <code className="text-lg font-mono text-white">{tempPassword.password}</code>
              <button 
                onClick={() => navigator.clipboard.writeText(tempPassword.password)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Copy
              </button>
            </div>
            
            <button 
              onClick={() => { setTempPassword(null); window.location.reload(); }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {editingUser && (
        <EditPermissionsModal 
          user={editingUser} 
          registry={PERMISSION_REGISTRY}
          rolePermissions={ROLE_PERMISSIONS}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            window.location.reload();
          }}
        />
      )}

      {/* Invite Form */}
      {permissions.canCreate && (
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-400" /> Invite New Member
          </h2>
          <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
              <input 
                required
                type="text" 
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
                className="w-full bg-[#0B0A11]/60 border border-white/10 rounded-xl p-2.5 text-sm text-white" 
                placeholder="Jane Doe" 
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input 
                required
                type="email" 
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="w-full bg-[#0B0A11]/60 border border-white/10 rounded-xl p-2.5 text-sm text-white" 
                placeholder="jane@example.com" 
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-xs font-medium text-gray-400 mb-1">Role</label>
              <select 
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as Role)}
                className="w-full bg-[#0B0A11]/60 border border-white/10 rounded-xl p-2.5 text-sm text-white"
              >
                <option value="VIEWER">Viewer</option>
                <option value="APPROVER">Approver</option>
                <option value="DESIGNER">Designer</option>
                <option value="ANALYST">Analyst</option>
                <option value="CONTENT_MANAGER">Content Manager</option>
                <option value="MARKETING_MANAGER">Marketing Manager</option>
                <option value="ADMIN">Admin</option>
                <option value="OWNER">Owner</option>
              </select>
            </div>
            <button 
              disabled={isInviting}
              className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50 w-full md:w-auto"
            >
              {isInviting ? "Sending..." : "Send Invite"}
            </button>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {user.name?.substring(0, 2).toUpperCase() || "US"}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        {user.name || "Unnamed"}
                        {user.customPermissions && (
                           <span className="text-[9px] uppercase font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20" title="This user has custom permission overrides">
                             Custom
                           </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <select 
                    disabled={!permissions.canEditRole || loadingId === user.id || user.role === "OWNER"}
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value as Role)}
                    className="bg-[#0B0A11]/60 border border-white/10 rounded-lg py-1 px-2 text-xs text-white disabled:opacity-50 focus:outline-none"
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="APPROVER">Approver</option>
                    <option value="DESIGNER">Designer</option>
                    <option value="ANALYST">Analyst</option>
                    <option value="CONTENT_MANAGER">Content Manager</option>
                    <option value="MARKETING_MANAGER">Marketing Manager</option>
                    <option value="ADMIN">Admin</option>
                    {user.role === "OWNER" && <option value="OWNER">Owner</option>}
                  </select>
                </td>
                <td className="p-4">
                  {user.status === "ACTIVE" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider">
                      <Ban className="w-3 h-3" /> Deactivated
                    </span>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  {user.role !== "OWNER" && permissions.canEditPermissions && (
                    <button 
                      onClick={() => setEditingUser(user)}
                      disabled={loadingId === user.id}
                      className="text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Edit Permissions
                    </button>
                  )}
                  {user.status === "ACTIVE" && permissions.canDeactivate && user.role !== "OWNER" && (
                     <button 
                       onClick={() => handleToggleStatus(user.id, user.status)}
                       disabled={loadingId === user.id}
                       className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                     >
                       Deactivate
                     </button>
                  )}
                  {user.status === "DEACTIVATED" && permissions.canReactivate && (
                     <button 
                       onClick={() => handleToggleStatus(user.id, user.status)}
                       disabled={loadingId === user.id}
                       className="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                     >
                       Reactivate
                     </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

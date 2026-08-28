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
    canDeactivate: boolean;
    canReactivate: boolean;
  };
};

export function UsersClient({ initialUsers, permissions }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("VIEWER");
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsInviting(true);
      await inviteUser(inviteEmail, inviteName, inviteRole);
      // In a real app we'd fetch the new user or have the action return the full user.
      // For this demo we'll just reload the page to get fresh data.
      window.location.reload();
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
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
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
                      <div className="text-sm font-semibold text-white">{user.name || "Unnamed"}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <select 
                    disabled={!permissions.canEditRole || loadingId === user.id}
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
                    <option value="OWNER">Owner</option>
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
                <td className="p-4 text-sm text-gray-400">
                  {format(new Date(user.joinedAt), "MMM d, yyyy")}
                </td>
                <td className="p-4 text-right">
                  {user.status === "ACTIVE" && permissions.canDeactivate && (
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

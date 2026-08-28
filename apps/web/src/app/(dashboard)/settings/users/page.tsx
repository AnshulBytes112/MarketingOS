import { requireAuth } from "@abge/auth";
import { getUsers } from "./actions";
import { UsersClient } from "./users-client";
import { prisma } from "@abge/database";

export default async function UsersPage() {
  const session = await requireAuth();

  const canView = session.effectivePermissions.includes("user.view");
  
  if (!canView) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-sm text-gray-400">You do not have permission to view organization users.</p>
        </div>
      </div>
    );
  }

  const users = await getUsers();

  const canCreate = session.effectivePermissions.includes("user.create");
  const canEditRole = session.effectivePermissions.includes("user.edit_role");
  const canEditPermissions = session.effectivePermissions.includes("user.edit_permissions");
  const canDeactivate = session.effectivePermissions.includes("user.deactivate");
  const canReactivate = session.effectivePermissions.includes("user.reactivate");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Organization Users</h1>
          <p className="text-sm text-gray-400 mt-1">Manage team members, roles, and access.</p>
        </div>
      </div>
      
      <UsersClient 
        initialUsers={users} 
        permissions={{ canCreate, canEditRole, canEditPermissions, canDeactivate, canReactivate }} 
      />
    </div>
  );
}

import { requireAuth } from "@abge/auth";
import { getUsers } from "./actions";
import { UsersClient } from "./users-client";
import { prisma } from "@abge/database";
import { hasPermission } from "@abge/rbac";

export default async function UsersPage() {
  const session = await requireAuth();

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.organizationId,
        userId: session.userId,
      },
    },
  });

  const canView = membership ? hasPermission(membership.role, "user.view") : false;
  
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

  const canCreate = hasPermission(membership!.role, "user.create");
  const canEditRole = hasPermission(membership!.role, "user.edit_role");
  const canDeactivate = hasPermission(membership!.role, "user.deactivate");
  const canReactivate = hasPermission(membership!.role, "user.reactivate");

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
        permissions={{ canCreate, canEditRole, canDeactivate, canReactivate }} 
      />
    </div>
  );
}

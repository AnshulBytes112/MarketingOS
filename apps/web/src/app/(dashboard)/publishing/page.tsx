import { requireAuth } from "@abge/auth";
import { getPublishingJobs } from "./actions";
import { PublishingClient } from "./publishing-client";
import { prisma } from "@abge/database";
import { getEffectivePermissions } from "@abge/rbac";

export default async function PublishingPage() {
  const session = await requireAuth();

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.organizationId,
        userId: session.userId,
      },
    },
  });

  const customPermissions = membership?.customPermissions as string[] | undefined;
  const permissions = getEffectivePermissions(membership?.role || 'VIEWER', customPermissions);
  
  if (!permissions.includes('publishing.view')) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-sm text-gray-400">You do not have permission to view the publishing engine.</p>
        </div>
      </div>
    );
  }

  const jobs = await getPublishingJobs();

  const canSchedule = permissions.includes("publishing.schedule");
  const canPublish = permissions.includes("publishing.publish");
  const canCancel = permissions.includes("publishing.cancel");
  const canRetry = permissions.includes("publishing.retry");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Publishing Engine</h1>
        <p className="text-sm text-gray-400 mt-1">Manage scheduled and published content across external channels.</p>
      </div>
      
      <PublishingClient 
        initialJobs={jobs} 
        permissions={{ canSchedule, canPublish, canCancel, canRetry }} 
      />
    </div>
  );
}

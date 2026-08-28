import { requireAuth } from '@abge/auth';
import { prisma } from '@abge/database';
import CalendarClient from './calendar-client';

export default async function Page() {
  const session = await requireAuth();

  // Find the active brand
  const brand = await prisma.brand.findFirst({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
  });

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#12111A]/90 border border-white/5 rounded-2xl">
        <h3 className="text-white font-medium mb-1">No Brand Found</h3>
        <p className="text-gray-400 text-sm">Please create a brand first.</p>
      </div>
    );
  }

  // Fetch the latest completed ContentPlan for the brand to get its items
  const latestPlan = await prisma.contentPlan.findFirst({
    where: {
      brandId: brand.id,
      organizationId: session.organizationId,
      status: 'COMPLETED',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!latestPlan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#12111A]/90 border border-white/5 rounded-2xl">
        <h3 className="text-white font-medium mb-1">No Content Calendar Generated Yet</h3>
        <p className="text-gray-400 text-sm max-w-md text-center">
          Go to the Strategy section, approve your active strategy, and click "Generate Calendar" to build a scheduled campaign pipeline.
        </p>
      </div>
    );
  }

  // Determine initial date range for server-side rendering (e.g. current month)
  const { startOfMonth, endOfMonth } = require('date-fns');
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);

  // Fetch items for that content plan (with tenant security isolation)
  const items = await prisma.contentItem.findMany({
    where: {
      contentPlanId: latestPlan.id,
      brandId: brand.id,
      organizationId: session.organizationId,
      scheduledDate: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { scheduledDate: 'asc' },
  });

  const { hasPermission } = await import('@abge/rbac');
  
  const permissions = {
    canView: hasPermission(session.role, 'calendar.view'),
    canEdit: hasPermission(session.role, 'calendar.edit'),
    canGenerate: hasPermission(session.role, 'calendar.create'),
  };

  return (
    <CalendarClient
      initialItems={items}
      brandName={brand.name}
      brandId={brand.id}
      organizationId={session.organizationId}
      contentPlanId={latestPlan.id}
      strategyId={latestPlan.strategyId}
      permissions={permissions}
      initialStartDate={start.toISOString()}
      initialEndDate={end.toISOString()}
    />
  );
}

import { requirePlatformAuth } from '@abge/auth';
import { prisma } from '@abge/database';

export default async function AdminDashboardPage() {
  await requirePlatformAuth();

  const totalOrgs = await prisma.organization.count();
  const activeOrgs = await prisma.organization.count({ where: { status: 'ACTIVE' } });
  const suspendedOrgs = await prisma.organization.count({ where: { status: 'SUSPENDED' } });
  const totalUsers = await prisma.user.count();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Platform Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-gray-500 text-sm font-semibold">Total Organizations</h2>
          <p className="text-4xl font-bold mt-2">{totalOrgs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-gray-500 text-sm font-semibold">Active Organizations</h2>
          <p className="text-4xl font-bold mt-2 text-green-600">{activeOrgs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-gray-500 text-sm font-semibold">Suspended Organizations</h2>
          <p className="text-4xl font-bold mt-2 text-red-600">{suspendedOrgs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-gray-500 text-sm font-semibold">Total Users</h2>
          <p className="text-4xl font-bold mt-2">{totalUsers}</p>
        </div>
      </div>
    </div>
  );
}

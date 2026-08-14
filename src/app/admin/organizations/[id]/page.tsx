import { requirePlatformAuth } from '@/lib/auth/platform-guard';
import { prisma } from '@/lib/db/index';
import { notFound } from 'next/navigation';

export default async function AdminOrganizationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePlatformAuth();

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: true }
      }
    }
  });

  if (!org) {
    notFound();
  }

  const owners = org.members.filter(m => m.role === 'OWNER');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{org.name}</h1>
        <div className="space-x-2">
          {org.status === 'ACTIVE' ? (
            <form action={`/api/admin/organizations/${org.id}/suspend`} method="POST" className="inline">
              <button className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700">
                Suspend Organization
              </button>
            </form>
          ) : (
            <form action={`/api/admin/organizations/${org.id}/reactivate`} method="POST" className="inline">
              <button className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
                Reactivate Organization
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Details</h2>
          <dl className="space-y-2">
            <div className="grid grid-cols-3">
              <dt className="text-gray-500 font-semibold">Slug</dt>
              <dd className="col-span-2">{org.slug}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-gray-500 font-semibold">Status</dt>
              <dd className="col-span-2">{org.status}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-gray-500 font-semibold">Plan Tier</dt>
              <dd className="col-span-2">{org.planTier}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-gray-500 font-semibold">Created At</dt>
              <dd className="col-span-2">{org.createdAt.toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Owners</h2>
          <ul className="space-y-4">
            {owners.map(owner => (
              <li key={owner.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                <div>
                  <div className="font-semibold">{owner.user.name || 'No name'}</div>
                  <div className="text-sm text-gray-500">{owner.user.email}</div>
                </div>
                <form action={`/api/admin/impersonate`} method="POST">
                  <input type="hidden" name="targetUserId" value={owner.user.id} />
                  <input type="hidden" name="targetOrganizationId" value={org.id} />
                  <button type="submit" className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
                    Impersonate
                  </button>
                </form>
              </li>
            ))}
            {owners.length === 0 && <div className="text-gray-500">No owners found.</div>}
          </ul>
        </div>
      </div>
    </div>
  );
}

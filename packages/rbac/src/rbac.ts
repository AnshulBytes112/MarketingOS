import { Role } from '@prisma/client';

export type Permission =
  // STRATEGY
  | 'strategy.view'
  | 'strategy.generate'
  | 'strategy.edit'
  | 'strategy.approve'
  | 'strategy.apply_recommendation'
  // COMPETITOR INTELLIGENCE
  | 'competitor.view'
  | 'competitor.create'
  | 'competitor.sync'
  | 'competitor.analyze'
  // BRAND DNA
  | 'brand_dna.view'
  | 'brand_dna.create'
  | 'brand_dna.edit'
  | 'brand_dna.publish'
  // CALENDAR
  | 'calendar.view'
  | 'calendar.create'
  | 'calendar.edit'
  | 'calendar.reschedule'
  | 'calendar.bulk_update'
  // CONTENT
  | 'content.view'
  | 'content.create'
  | 'content.generate'
  | 'content.edit'
  | 'content.regenerate'
  | 'content.approve'
  | 'content.request_changes'
  // APPROVAL
  | 'approval.view'
  | 'approval.approve'
  | 'approval.reject'
  | 'approval.request_changes'
  // CAMPAIGN
  | 'campaign.view'
  | 'campaign.create'
  | 'campaign.edit'
  | 'campaign.approve'
  // PUBLISHING
  | 'publishing.view'
  | 'publishing.schedule'
  | 'publishing.publish'
  | 'publishing.cancel'
  | 'publishing.retry'
  // ANALYTICS
  | 'analytics.view'
  | 'analytics.export'
  // SEO
  | 'seo.view'
  | 'seo.generate'
  | 'seo.edit'
  // AI COPILOT
  | 'copilot.view'
  | 'copilot.generate'
  // USER MANAGEMENT
  | 'user.view'
  | 'user.create'
  | 'user.edit_role'
  | 'user.edit_permissions'
  | 'user.deactivate'
  | 'user.reactivate'
  // ORGANIZATION
  | 'organization.view'
  | 'organization.switch'
  // LEGACY
  | 'manage_org'
  | 'manage_brand_dna'
  | 'manage_competitors'
  | 'manage_strategy'
  | 'generate_content'
  | 'approve_content'
  | 'reject_content'
  | 'publish_content'
  | 'manage_social_connections'
  | 'manage_campaigns'
  | 'view_analytics'
  | 'manage_users'
  | 'manage_billing';

export const PERMISSION_REGISTRY: Record<Permission, { module: string; name: string; description: string }> = {
  // STRATEGY
  'strategy.view': { module: 'Strategy', name: 'View Strategy', description: 'Can view strategies.' },
  'strategy.generate': { module: 'Strategy', name: 'Generate Strategy', description: 'Can generate strategies.' },
  'strategy.edit': { module: 'Strategy', name: 'Edit Strategy', description: 'Can edit strategies.' },
  'strategy.approve': { module: 'Strategy', name: 'Approve Strategy', description: 'Can approve strategies.' },
  'strategy.apply_recommendation': { module: 'Strategy', name: 'Apply Recommendations', description: 'Can apply AI recommendations.' },
  
  // COMPETITOR INTELLIGENCE
  'competitor.view': { module: 'Competitor Intelligence', name: 'View Competitors', description: 'Can view competitors.' },
  'competitor.create': { module: 'Competitor Intelligence', name: 'Create Competitor', description: 'Can add new competitors.' },
  'competitor.sync': { module: 'Competitor Intelligence', name: 'Sync Competitors', description: 'Can sync competitor data.' },
  'competitor.analyze': { module: 'Competitor Intelligence', name: 'Analyze Competitors', description: 'Can run competitor analysis.' },

  // BRAND DNA
  'brand_dna.view': { module: 'Brand DNA', name: 'View Brand DNA', description: 'Can view Brand DNA.' },
  'brand_dna.create': { module: 'Brand DNA', name: 'Create Brand DNA', description: 'Can create new Brand DNA.' },
  'brand_dna.edit': { module: 'Brand DNA', name: 'Edit Brand DNA', description: 'Can edit Brand DNA.' },
  'brand_dna.publish': { module: 'Brand DNA', name: 'Publish Brand DNA', description: 'Can publish Brand DNA.' },

  // CALENDAR
  'calendar.view': { module: 'Calendar', name: 'View Calendar', description: 'Can view the content calendar.' },
  'calendar.create': { module: 'Calendar', name: 'Create Events', description: 'Can create calendar events.' },
  'calendar.edit': { module: 'Calendar', name: 'Edit Events', description: 'Can edit calendar events.' },
  'calendar.reschedule': { module: 'Calendar', name: 'Reschedule', description: 'Can reschedule events.' },
  'calendar.bulk_update': { module: 'Calendar', name: 'Bulk Update', description: 'Can bulk update calendar events.' },

  // CONTENT
  'content.view': { module: 'Content', name: 'View Content', description: 'Can view content.' },
  'content.create': { module: 'Content', name: 'Create Content', description: 'Can create manual content.' },
  'content.generate': { module: 'Content', name: 'Generate Content', description: 'Can generate AI content.' },
  'content.edit': { module: 'Content', name: 'Edit Content', description: 'Can edit content.' },
  'content.regenerate': { module: 'Content', name: 'Regenerate Content', description: 'Can regenerate AI content.' },
  'content.approve': { module: 'Content', name: 'Approve Content', description: 'Can approve content.' },
  'content.request_changes': { module: 'Content', name: 'Request Changes', description: 'Can request changes to content.' },

  // APPROVAL
  'approval.view': { module: 'Approval', name: 'View Approvals', description: 'Can view approval queues.' },
  'approval.approve': { module: 'Approval', name: 'Approve', description: 'Can approve items.' },
  'approval.reject': { module: 'Approval', name: 'Reject', description: 'Can reject items.' },
  'approval.request_changes': { module: 'Approval', name: 'Request Changes', description: 'Can request changes.' },

  // CAMPAIGN
  'campaign.view': { module: 'Campaign', name: 'View Campaigns', description: 'Can view campaigns.' },
  'campaign.create': { module: 'Campaign', name: 'Create Campaign', description: 'Can create campaigns.' },
  'campaign.edit': { module: 'Campaign', name: 'Edit Campaign', description: 'Can edit campaigns.' },
  'campaign.approve': { module: 'Campaign', name: 'Approve Campaign', description: 'Can approve campaigns.' },

  // PUBLISHING
  'publishing.view': { module: 'Publishing', name: 'View Publishing', description: 'Can view publishing schedules.' },
  'publishing.schedule': { module: 'Publishing', name: 'Schedule', description: 'Can schedule posts.' },
  'publishing.publish': { module: 'Publishing', name: 'Publish', description: 'Can publish posts immediately.' },
  'publishing.cancel': { module: 'Publishing', name: 'Cancel', description: 'Can cancel scheduled posts.' },
  'publishing.retry': { module: 'Publishing', name: 'Retry', description: 'Can retry failed publishing jobs.' },

  // ANALYTICS
  'analytics.view': { module: 'Analytics', name: 'View Analytics', description: 'Can view analytics dashboards.' },
  'analytics.export': { module: 'Analytics', name: 'Export Analytics', description: 'Can export analytics data.' },

  // SEO
  'seo.view': { module: 'SEO', name: 'View SEO', description: 'Can view SEO data.' },
  'seo.generate': { module: 'SEO', name: 'Generate SEO', description: 'Can generate SEO tags.' },
  'seo.edit': { module: 'SEO', name: 'Edit SEO', description: 'Can edit SEO tags.' },

  // AI COPILOT
  'copilot.view': { module: 'AI Copilot', name: 'View Copilot', description: 'Can view AI Copilot interface.' },
  'copilot.generate': { module: 'AI Copilot', name: 'Use Copilot', description: 'Can generate with AI Copilot.' },

  // USER MANAGEMENT
  'user.view': { module: 'User Management', name: 'View Users', description: 'Can view organization members.' },
  'user.create': { module: 'User Management', name: 'Invite Users', description: 'Can invite new members.' },
  'user.edit_role': { module: 'User Management', name: 'Edit Roles', description: 'Can edit member roles.' },
  'user.edit_permissions': { module: 'User Management', name: 'Edit Permissions', description: 'Can edit explicit custom permissions.' },
  'user.deactivate': { module: 'User Management', name: 'Deactivate Users', description: 'Can deactivate members.' },
  'user.reactivate': { module: 'User Management', name: 'Reactivate Users', description: 'Can reactivate members.' },

  // ORGANIZATION
  'organization.view': { module: 'Organization', name: 'View Organization', description: 'Can view organization details.' },
  'organization.switch': { module: 'Organization', name: 'Switch Organization', description: 'Can switch between organizations.' },

  // LEGACY
  'manage_org': { module: 'Legacy', name: 'Manage Org', description: 'Legacy manage org' },
  'manage_brand_dna': { module: 'Legacy', name: 'Manage Brand DNA', description: 'Legacy' },
  'manage_competitors': { module: 'Legacy', name: 'Manage Competitors', description: 'Legacy' },
  'manage_strategy': { module: 'Legacy', name: 'Manage Strategy', description: 'Legacy' },
  'generate_content': { module: 'Legacy', name: 'Generate Content', description: 'Legacy' },
  'approve_content': { module: 'Legacy', name: 'Approve Content', description: 'Legacy' },
  'reject_content': { module: 'Legacy', name: 'Reject Content', description: 'Legacy' },
  'publish_content': { module: 'Legacy', name: 'Publish Content', description: 'Legacy' },
  'manage_social_connections': { module: 'Legacy', name: 'Manage Social', description: 'Legacy' },
  'manage_campaigns': { module: 'Legacy', name: 'Manage Campaigns', description: 'Legacy' },
  'view_analytics': { module: 'Legacy', name: 'View Analytics', description: 'Legacy' },
  'manage_users': { module: 'Legacy', name: 'Manage Users', description: 'Legacy' },
  'manage_billing': { module: 'Legacy', name: 'Manage Billing', description: 'Legacy' },
};

const VIEWER_PERMISSIONS: Permission[] = [
  'strategy.view',
  'competitor.view',
  'brand_dna.view',
  'calendar.view',
  'content.view',
  'approval.view',
  'campaign.view',
  'publishing.view',
  'analytics.view',
  'seo.view',
  'copilot.view',
  'user.view',
  'organization.view',
  'organization.switch',
  'view_analytics',
];

const ANALYST_PERMISSIONS: Permission[] = [
  ...VIEWER_PERMISSIONS,
  'competitor.analyze',
  'analytics.export',
];

const DESIGNER_PERMISSIONS: Permission[] = [
  ...VIEWER_PERMISSIONS,
  'content.edit',
  'content.generate',
  'content.regenerate',
  'content.create',
  'calendar.edit',
  'generate_content',
];

const APPROVER_PERMISSIONS: Permission[] = [
  ...VIEWER_PERMISSIONS,
  'strategy.approve',
  'content.approve',
  'content.request_changes',
  'approval.approve',
  'approval.reject',
  'approval.request_changes',
  'campaign.approve',
  'approve_content',
  'reject_content',
];

const CONTENT_MANAGER_PERMISSIONS: Permission[] = [
  ...DESIGNER_PERMISSIONS,
  ...APPROVER_PERMISSIONS,
  'brand_dna.create',
  'brand_dna.edit',
  'brand_dna.publish',
  'calendar.create',
  'calendar.reschedule',
  'calendar.bulk_update',
  'publishing.schedule',
  'publishing.publish',
  'publishing.cancel',
  'seo.generate',
  'seo.edit',
  'copilot.generate',
  'manage_brand_dna',
  'manage_strategy',
  'publish_content',
];

const MARKETING_MANAGER_PERMISSIONS: Permission[] = [
  ...CONTENT_MANAGER_PERMISSIONS,
  ...ANALYST_PERMISSIONS,
  'strategy.generate',
  'strategy.edit',
  'strategy.apply_recommendation',
  'competitor.create',
  'competitor.sync',
  'campaign.create',
  'campaign.edit',
  'manage_competitors',
  'manage_campaigns',
  'manage_social_connections',
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...MARKETING_MANAGER_PERMISSIONS,
  'user.create',
  'user.edit_role',
  'user.edit_permissions',
  'user.deactivate',
  'user.reactivate',
  'manage_users',
  'manage_billing',
];

const OWNER_PERMISSIONS: Permission[] = [
  ...Object.keys(PERMISSION_REGISTRY) as Permission[]
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: OWNER_PERMISSIONS,
  [Role.ADMIN]: ADMIN_PERMISSIONS,
  [Role.MARKETING_MANAGER]: MARKETING_MANAGER_PERMISSIONS,
  [Role.CONTENT_MANAGER]: CONTENT_MANAGER_PERMISSIONS,
  [Role.DESIGNER]: DESIGNER_PERMISSIONS,
  [Role.ANALYST]: ANALYST_PERMISSIONS,
  [Role.APPROVER]: APPROVER_PERMISSIONS,
  [Role.VIEWER]: VIEWER_PERMISSIONS,
};

export type CustomPermissions = {
  grant: string[];
  deny: string[];
};

export function getEffectivePermissions(role: Role, customPermissionsRaw: any): string[] {
  if (role === Role.OWNER) {
    return Object.keys(PERMISSION_REGISTRY);
  }

  const basePermissions = new Set(ROLE_PERMISSIONS[role]);

  if (customPermissionsRaw && typeof customPermissionsRaw === 'object') {
    const cp = customPermissionsRaw as CustomPermissions;
    if (Array.isArray(cp.grant)) {
      cp.grant.forEach(p => {
        if (PERMISSION_REGISTRY[p as Permission]) {
          basePermissions.add(p as Permission);
        }
      });
    }
    if (Array.isArray(cp.deny)) {
      cp.deny.forEach(p => {
        basePermissions.delete(p as Permission);
      });
    }
  }

  return Array.from(basePermissions);
}

export function hasPermission(role: Role, permission: Permission): boolean {
  if (role === Role.OWNER) return true;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

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
  | 'user.deactivate'
  | 'user.reactivate'
  // ORGANIZATION
  | 'organization.view'
  | 'organization.switch'
  // LEGACY (temporary backward compatibility if any modules still rely on them)
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
  'user.deactivate',
  'user.reactivate',
  'manage_users',
  'manage_billing',
];

const OWNER_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS,
  'manage_org',
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

export function hasPermission(role: Role, permission: Permission): boolean {
  if (role === Role.OWNER) return true;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

import { Role } from '@prisma/client';

export type Permission =
  | 'manage_org'
  | 'manage_brand_dna'
  | 'manage_competitors'
  | 'generate_content'
  | 'approve_content'
  | 'reject_content'
  | 'publish_content'
  | 'manage_social_connections'
  | 'manage_campaigns'
  | 'view_analytics'
  | 'manage_users'
  | 'manage_billing';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    'manage_org', 'manage_brand_dna', 'manage_competitors', 'generate_content', 'approve_content', 'reject_content', 'publish_content', 'manage_social_connections', 'manage_campaigns', 'view_analytics', 'manage_users', 'manage_billing',
  ],
  [Role.ADMIN]: [
    'manage_brand_dna', 'manage_competitors', 'generate_content', 'approve_content', 'reject_content', 'publish_content', 'manage_social_connections', 'manage_campaigns', 'view_analytics', 'manage_users', 'manage_billing',
  ],
  [Role.MARKETING_MANAGER]: [
    'manage_brand_dna', 'manage_competitors', 'generate_content', 'approve_content', 'reject_content', 'publish_content', 'manage_social_connections', 'manage_campaigns', 'view_analytics',
  ],
  [Role.CONTENT_MANAGER]: [
    'manage_brand_dna', 'generate_content', 'publish_content', 'view_analytics',
  ],
  [Role.DESIGNER]: [
    'generate_content', 'view_analytics',
  ],
  [Role.ANALYST]: [
    'view_analytics',
  ],
  [Role.APPROVER]: [
    'approve_content', 'reject_content', 'view_analytics',
  ],
  [Role.VIEWER]: [
    'view_analytics',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

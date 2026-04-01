/**
 * First meaningful screen per platform per *AutoSphere_AI_Complete_Screen_Inventory* (README BRD).
 * Used for `/app/{platform}` index redirects and welcome/sidebar deep links.
 */
export const BRD_DEFAULT_CHILD: Record<string, string> = {
  driver: 'dashboard',
  insurance: 'portfolio-overview-dashboard',
  dealer: 'dealer-login-dashboard',
  sales: 'sales-dashboard',
  technician: 'technician-login',
  property: 'property-dashboard',
  government: 'national-vehicle-overview',
  'ai-admin': 'super-admin-dashboard',
  analytics: 'global-performance-dashboard',
  'ai-assistant': 'ai-chat-interface',
  fleet: 'dashboard',
}

export function getBrdDefaultChild(platform: string): string {
  return BRD_DEFAULT_CHILD[platform] ?? 'dashboard'
}

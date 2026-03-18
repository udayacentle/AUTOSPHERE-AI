/**
 * Client-side fallback data for sales dashboard sections.
 * Used when the API is unreachable so the UI still shows sample data.
 */
import type {
  SalesDashboardData,
  SalesLeadAssignmentData,
  SalesCustomerInteractionsData,
  SalesPerformanceMetricsData,
  SalesCommissionData,
  SalesAISuggestionsData,
  SalesFollowUpData,
  SalesTargetAchievementData,
} from '../../../api/client'

const now = new Date().toISOString()

export const FALLBACK_SALES_DASHBOARD: SalesDashboardData = {
  dataSource: 'fallback',
  myLeads: 12,
  hotProspects: 3,
  followUpsDue: 5,
  pipelineValue: 185000,
  dealsInProgress: 8,
  monthlyTarget: 250000,
  monthlyAchieved: 142000,
  targetPercent: 56.8,
  commissionEarned: 4200,
  commissionPending: 1800,
  lastUpdated: now,
}

export const FALLBACK_SALES_LEAD_ASSIGNMENT: SalesLeadAssignmentData = {
  dataSource: 'fallback',
  leadQueue: [
    { id: 'L1', name: 'Alex Chen', email: 'alex@example.com', source: 'Website', score: 85, status: 'unassigned', createdAt: now },
    { id: 'L2', name: 'Sam Davis', email: 'sam@example.com', source: 'Walk-in', score: 92, status: 'assigned', assignedTo: 'Rep 1', createdAt: now },
    { id: 'L3', name: 'Jordan Lee', email: 'jordan@example.com', source: 'Referral', score: 78, status: 'unassigned', createdAt: now },
  ],
  scoringRules: [
    { id: 'r1', name: 'Budget match', weight: 0.3 },
    { id: 'r2', name: 'Intent score', weight: 0.4 },
    { id: 'r3', name: 'Vehicle interest', weight: 0.3 },
  ],
  assignmentMode: 'auto',
  lastUpdated: now,
}

export const FALLBACK_SALES_INTERACTIONS: SalesCustomerInteractionsData = {
  dataSource: 'fallback',
  activities: [
    { id: 'A1', leadId: 'L1', type: 'call', summary: 'Initial discovery call', at: now, rep: 'You' },
    { id: 'A2', leadId: 'L2', type: 'test_drive', summary: 'Test drive Camry', at: now, rep: 'You' },
    { id: 'A3', leadId: 'L3', type: 'email', summary: 'Quote sent', at: now, rep: 'You' },
  ],
  notesByLead: { L1: 'Interested in sedan, budget 30k', L2: 'Prefer SUV, follow up Friday' },
  lastUpdated: now,
}

export const FALLBACK_SALES_PERFORMANCE: SalesPerformanceMetricsData = {
  dataSource: 'fallback',
  conversionRates: { leadToQualified: 0.42, qualifiedToProposal: 0.65, proposalToWon: 0.38 },
  activity: { callsThisWeek: 45, meetings: 12, testDrives: 8, proposalsSent: 6 },
  rankings: [
    { rank: 1, name: 'You', volume: 14, revenue: 198000, targetPercent: 79 },
    { rank: 2, name: 'Rep 2', volume: 12, revenue: 168000, targetPercent: 67 },
    { rank: 3, name: 'Rep 3', volume: 10, revenue: 142000, targetPercent: 57 },
  ],
  lastUpdated: now,
}

export const FALLBACK_SALES_COMMISSION: SalesCommissionData = {
  dataSource: 'fallback',
  earned: 4200,
  pending: 1800,
  payoutHistory: [
    { id: 'P1', period: 'Feb 2025', amount: 3850, paidAt: '2025-03-05' },
    { id: 'P2', period: 'Jan 2025', amount: 4100, paidAt: '2025-02-05' },
  ],
  byDeal: [
    { dealId: 'D1', vehicle: 'Toyota Camry', amount: 850, status: 'paid' },
    { dealId: 'D2', vehicle: 'Honda Accord', amount: 720, status: 'pending' },
  ],
  lastUpdated: now,
}

export const FALLBACK_SALES_AI_SUGGESTIONS: SalesAISuggestionsData = {
  dataSource: 'fallback',
  nextBestAction: { leadId: 'L1', action: 'call', reason: 'High score, no contact in 2 days', priority: 'high' },
  talkingPoints: [
    { leadId: 'L1', points: ['Mention Camry safety ratings', 'Offer test drive this week'] },
    { leadId: 'L2', points: ['Discuss trade-in value', 'Financing options'] },
  ],
  vehicleRecommendations: [
    { leadId: 'L1', vehicles: ['Toyota Camry 2024', 'Honda Accord 2024'], matchReason: 'Budget and sedan preference' },
  ],
  lastUpdated: now,
}

export const FALLBACK_SALES_FOLLOW_UP: SalesFollowUpData = {
  dataSource: 'fallback',
  upcoming: [
    { id: 'F1', leadId: 'L1', type: 'call', due: now, leadName: 'Alex Chen' },
    { id: 'F2', leadId: 'L2', type: 'test_drive', due: now, leadName: 'Sam Davis' },
    { id: 'F3', leadId: 'L3', type: 'email', due: now, leadName: 'Jordan Lee' },
  ],
  overdue: [
    { id: 'F0', leadId: 'L0', type: 'call', due: now, leadName: 'Past Lead' },
  ],
  lastUpdated: now,
}

export const FALLBACK_SALES_TARGET_ACHIEVEMENT: SalesTargetAchievementData = {
  dataSource: 'fallback',
  targetUnits: 20,
  achievedUnits: 14,
  targetRevenue: 250000,
  achievedRevenue: 142000,
  daysLeftInPeriod: 15,
  progressPercent: 56.8,
  gapUnits: 6,
  gapRevenue: 108000,
  forecastAtRunRate: 18,
  lastUpdated: now,
}

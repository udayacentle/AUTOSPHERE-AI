/**
 * Client-side fallback data for insurance dashboard sections.
 * Used when the API is unreachable (e.g. backend offline) so the UI still shows sample data.
 */
import type {
  InsuranceRiskHeatmapsData,
  InsurancePortfolioData,
  InsuranceRealTimeRiskData,
  InsuranceDriversRiskData,
  InsuranceDynamicPremiumData,
  InsuranceClaimsData,
  InsuranceFraudDetectionData,
  InsurancePoliciesData,
  InsurancePredictiveLossForecastingData,
  InsuranceModelPerformanceData,
  InsuranceComplianceReportingData,
  InsuranceApiIntegrationSettingsData,
} from '../../api/client'

const now = new Date().toISOString()

export const FALLBACK_RISK_HEATMAPS: InsuranceRiskHeatmapsData = {
  dataSource: 'fallback',
  regionHeatmap: [
    { regionKey: 'State Farm', regionLabel: 'State Farm', claimCount: 2, totalAmount: 1620, riskLevel: 'medium' },
    { regionKey: 'Geico', regionLabel: 'Geico', claimCount: 1, totalAmount: 0, riskLevel: 'low' },
    { regionKey: 'Allstate', regionLabel: 'Allstate', claimCount: 3, totalAmount: 2100, riskLevel: 'high' },
  ],
  timeHeatmap: [
    { periodKey: '2025-03', periodLabel: 'Mar 2025', claimCount: 3, totalAmount: 1200, riskLevel: 'medium' },
    { periodKey: '2025-02', periodLabel: 'Feb 2025', claimCount: 2, totalAmount: 2270, riskLevel: 'high' },
    { periodKey: '2025-01', periodLabel: 'Jan 2025', claimCount: 1, totalAmount: 0, riskLevel: 'low' },
  ],
  segmentHeatmap: [
    { segmentKey: 'Comprehensive', segmentLabel: 'Comprehensive', claimCount: 3, totalAmount: 3470, riskLevel: 'high' },
    { segmentKey: 'Liability Plus', segmentLabel: 'Liability Plus', claimCount: 1, totalAmount: 0, riskLevel: 'low' },
    { segmentKey: 'Collision', segmentLabel: 'Collision', claimCount: 2, totalAmount: 1620, riskLevel: 'medium' },
  ],
  lastUpdated: now,
}

export const FALLBACK_PORTFOLIO: InsurancePortfolioData = {
  dataSource: 'fallback',
  activePolicies: 3,
  totalPremium: 4280,
  riskExposure: 18,
  openClaims: 1,
  lossRatio: 0.14,
  premiumByCoverage: [
    { coverage: 'Comprehensive', count: 2, premium: 2680 },
    { coverage: 'Liability', count: 1, premium: 860 },
  ],
  premiumTrend: [
    { month: 'Oct', premium: 4100 },
    { month: 'Nov', premium: 4150 },
    { month: 'Dec', premium: 4200 },
    { month: 'Jan', premium: 4220 },
    { month: 'Feb', premium: 4250 },
    { month: 'Mar', premium: 4280 },
  ],
  topRisks: [
    { driverId: 'driver1', name: 'Alex Rivera', riskScore: 14, mobilityScore: 86 },
    { driverId: 'driver2', name: 'Jordan Lee', riskScore: 22, mobilityScore: 78 },
    { driverId: 'driver3', name: 'Sam Chen', riskScore: 31, mobilityScore: 69 },
  ],
  recentClaims: [
    { id: 'CLM-001', driverId: 'driver1', date: '2025-03-10', amount: 1200, status: 'assessing', description: 'Rear bumper' },
    { id: 'CLM-002', driverId: 'driver1', date: '2025-02-28', amount: 450, status: 'paid', description: 'Windshield' },
  ],
  policiesExpiringSoon: [
    { driverId: 'driver1', provider: 'State Farm', policyNumber: 'POL-2024-45678', expiryDate: '2025-09-15' },
  ],
  lastUpdated: now,
}

export const FALLBACK_REAL_TIME_RISK: InsuranceRealTimeRiskData = {
  dataSource: 'fallback',
  riskExposure: 18,
  riskLevel: 'medium',
  openClaims: 1,
  lossRatio: 0.14,
  openClaimsList: [
    { id: 'CLM-001', driverId: 'driver1', date: '2025-03-10', amount: 1200, status: 'assessing', description: 'Rear bumper' },
  ],
  driversRisk: [
    { driverId: 'driver1', name: 'Alex Rivera', riskScore: 14, mobilityScore: 86 },
    { driverId: 'driver2', name: 'Jordan Lee', riskScore: 22, mobilityScore: 78 },
  ],
  alerts: [{ type: 'claim', id: 'a1', message: 'Open claim CLM-001 pending assessment' }],
  summary: { totalDrivers: 2, totalOpenClaims: 1, highRiskCount: 0 },
  lastUpdated: now,
}

export const FALLBACK_DRIVERS_RISK: InsuranceDriversRiskData = {
  dataSource: 'fallback',
  drivers: [
    { driverId: 'driver1', name: 'Alex Rivera', riskScore: 14, mobilityScore: 86, email: 'alex@example.com', claimCount: 1, policyProvider: 'State Farm', policyExpiry: '2025-09-15' },
    { driverId: 'driver2', name: 'Jordan Lee', riskScore: 22, mobilityScore: 78, email: '', claimCount: 0, policyProvider: 'Geico', policyExpiry: '2025-11-20' },
    { driverId: 'driver3', name: 'Sam Chen', riskScore: 31, mobilityScore: 69, email: 'sam@example.com', claimCount: 2, policyProvider: 'Allstate', policyExpiry: '2025-06-10' },
  ],
  lastUpdated: now,
}

export const FALLBACK_DYNAMIC_PREMIUM: InsuranceDynamicPremiumData = {
  dataSource: 'fallback',
  rules: {
    riskBands: [
      { minScore: 0, maxScore: 20, label: 'Low risk', surchargePercent: 0 },
      { minScore: 21, maxScore: 40, label: 'Medium risk', surchargePercent: 10 },
      { minScore: 41, maxScore: 100, label: 'High risk', surchargePercent: 25 },
    ],
    discounts: [
      { id: 'd1', name: 'Claims-free', condition: 'No claims in 24 months', percent: 15 },
      { id: 'd2', name: 'Telematics', condition: 'Connected driving score > 80', percent: 10 },
    ],
    surcharges: [
      { id: 's1', name: 'High-risk area', condition: 'Postcode in high-risk zone', percent: 20 },
    ],
  },
  segments: [
    { segmentType: 'Comprehensive', segmentValue: 'Comprehensive', policyCount: 2, totalPremium: 2680, averagePremium: 1340 },
    { segmentType: 'Liability', segmentValue: 'Liability', policyCount: 1, totalPremium: 860, averagePremium: 860 },
  ],
  summary: { totalPremium: 4280, activePolicies: 3, lossRatio: 0.14, totalClaimsPaid: 450 },
  lastUpdated: now,
}

export const FALLBACK_CLAIMS: InsuranceClaimsData = {
  dataSource: 'fallback',
  claims: [
    { id: 'CLM-001', driverId: 'driver1', date: '2025-03-10', amount: 1200, status: 'assessing', description: 'Rear bumper', driverName: 'Alex Rivera' },
    { id: 'CLM-002', driverId: 'driver1', date: '2025-02-28', amount: 450, status: 'paid', description: 'Windshield', driverName: 'Alex Rivera' },
    { id: 'CLM-003', driverId: 'driver2', date: '2025-03-05', amount: 0, status: 'submitted', description: 'Door dent', driverName: 'Jordan Lee' },
  ],
  summary: { openCount: 2, paidCount: 1, totalPaidAmount: 450, totalClaims: 3 },
  lastUpdated: now,
}

export const FALLBACK_FRAUD_DETECTION: InsuranceFraudDetectionData = {
  dataSource: 'fallback',
  summary: { totalClaimsAnalyzed: 4, highRiskCount: 2, inInvestigationCount: 2 },
  riskFlags: [
    { claimId: 'CLM-001', driverId: 'driver1', driverName: 'Alex Rivera', fraudScore: 35, flags: ['multiple_claims'], amount: 1200, date: '2025-03-10' },
    { claimId: 'CLM-004', driverId: 'driver3', driverName: 'Sam Chen', fraudScore: 40, flags: ['high_amount', 'multiple_claims'], amount: 1850, date: '2025-02-15' },
  ],
  investigationQueue: [
    { claimId: 'CLM-004', driverId: 'driver3', driverName: 'Sam Chen', fraudScore: 40, reason: 'High amount + multiple claims', priority: 'high' },
    { claimId: 'CLM-001', driverId: 'driver1', driverName: 'Alex Rivera', fraudScore: 35, reason: 'Multiple claims', priority: 'medium' },
  ],
  graph: {
    nodes: [
      { id: 'driver:driver1', type: 'driver', label: 'Alex Rivera' },
      { id: 'driver:driver2', type: 'driver', label: 'Jordan Lee' },
      { id: 'claim:CLM-001', type: 'claim', label: 'CLM-001' },
      { id: 'claim:CLM-002', type: 'claim', label: 'CLM-002' },
      { id: 'claim:CLM-003', type: 'claim', label: 'CLM-003' },
    ],
    edges: [
      { from: 'driver:driver1', to: 'claim:CLM-001', type: 'filed' },
      { from: 'driver:driver1', to: 'claim:CLM-002', type: 'filed' },
      { from: 'driver:driver2', to: 'claim:CLM-003', type: 'filed' },
    ],
  },
  lastUpdated: now,
}

export const FALLBACK_POLICIES: InsurancePoliciesData = {
  dataSource: 'fallback',
  policies: [
    { driverId: 'driver1', provider: 'State Farm', policyNumber: 'POL-2024-45678', expiryDate: '2025-09-15', premium: 1340, coverage: 'Comprehensive', driverName: 'Alex Rivera' },
    { driverId: 'driver2', provider: 'Geico', policyNumber: 'GEO-789012', expiryDate: '2025-11-20', premium: 860, coverage: 'Liability', driverName: 'Jordan Lee' },
    { driverId: 'driver3', provider: 'Allstate', policyNumber: 'ALL-345678', expiryDate: '2025-06-10', premium: 2080, coverage: 'Comprehensive', driverName: 'Sam Chen' },
  ],
  summary: { totalPolicies: 3, totalPremium: 4280, expiringSoonCount: 1 },
  lastUpdated: now,
}

export const FALLBACK_PREDICTIVE_LOSS: InsurancePredictiveLossForecastingData = {
  dataSource: 'fallback',
  lossForecast: [
    { periodKey: '2025-04', periodLabel: 'Apr 2025', expectedLoss: 1200, claimCount: 2 },
    { periodKey: '2025-05', periodLabel: 'May 2025', expectedLoss: 1150, claimCount: 2 },
    { periodKey: '2025-06', periodLabel: 'Jun 2025', expectedLoss: 1100, claimCount: 1 },
  ],
  reserveRecommendations: { openClaimsReserve: 1620, ibnrRecommendation: 480, caseReserveRecommendation: 1200 },
  scenarioAnalysis: [
    { id: 'base', name: 'Base case', description: 'Current trend', projectedLossRatio: 0.14, projectedTotalLoss: 4370 },
    { id: 'stress1', name: 'Claims +10%', description: '10% more claim frequency', projectedLossRatio: 0.155, projectedTotalLoss: 4800 },
    { id: 'stress2', name: 'Severity +20%', description: '20% higher severity', projectedLossRatio: 0.168, projectedTotalLoss: 5240 },
  ],
  summary: { totalPremium: 4280, paidToDate: 450, openClaimsCount: 2 },
  lastUpdated: now,
}

export const FALLBACK_MODEL_PERFORMANCE: InsuranceModelPerformanceData = {
  dataSource: 'fallback',
  modelMetrics: [
    { modelId: 'risk_v1', modelName: 'Risk scoring', accuracy: 0.87, precision: 0.82, recall: 0.79, auc: 0.85, sampleSize: 1250 },
    { modelId: 'fraud_v1', modelName: 'Fraud detection', accuracy: 0.91, precision: 0.88, recall: 0.84, auc: 0.89, sampleSize: 420 },
  ],
  driftDetection: { riskInputDrift: 2.1, riskPredictionDrift: 1.5, fraudInputDrift: 3.0, fraudPredictionDrift: 2.2 },
  versionHistory: [
    { versionId: 'v1', name: 'Risk v1', deployedAt: '2025-01-15', accuracy: 0.87, status: 'active' },
    { versionId: 'v2', name: 'Fraud v1', deployedAt: '2025-02-01', accuracy: 0.91, status: 'active' },
  ],
  lastUpdated: now,
}

export const FALLBACK_COMPLIANCE: InsuranceComplianceReportingData = {
  dataSource: 'fallback',
  regulatoryReports: [
    { reportId: 'REG-001', name: 'Quarterly loss report', jurisdiction: 'State', dueDate: '2025-04-30', status: 'upcoming', period: 'Q1 2025' },
    { reportId: 'REG-002', name: 'Annual policy summary', jurisdiction: 'State', dueDate: '2025-12-31', status: 'upcoming', period: '2025' },
    { reportId: 'REG-003', name: 'Claims activity filing', jurisdiction: 'State', dueDate: '2025-03-31', status: 'due', period: 'Feb 2025' },
  ],
  auditTrail: [
    { id: 'A1', type: 'claim', action: 'submitted', entityId: 'CLM-001', at: '2025-03-10T14:00:00Z', detail: 'Claim submitted' },
    { id: 'A2', type: 'claim', action: 'status_updated', entityId: 'CLM-002', at: '2025-02-28T11:00:00Z', detail: 'Status: paid' },
    { id: 'A3', type: 'policy', action: 'renewal_reminder', entityId: 'driver1', at: '2025-03-01T09:00:00Z', detail: 'Policy expiry 2025-09-15' },
  ],
  exportOptions: [
    { format: 'PDF', reportType: 'Regulatory summary', description: 'Quarterly regulatory summary (PDF)' },
    { format: 'CSV', reportType: 'Claims export', description: 'Claims list for period (CSV)' },
    { format: 'Excel', reportType: 'Policy register', description: 'Policy register export (Excel)' },
  ],
  summary: { totalReportsDue: 1, lastAuditAt: '2025-03-10T14:00:00Z', totalRegulatoryReports: 3 },
  lastUpdated: now,
}

export const FALLBACK_API_INTEGRATION: InsuranceApiIntegrationSettingsData = {
  dataSource: 'fallback',
  apiEndpoints: [
    { id: 'ep1', name: 'AutoSphere Core', type: 'autosphere', status: 'active', baseUrlMasked: 'https://api.***.com/v1', lastUsed: '2025-03-15T10:00:00Z' },
    { id: 'ep2', name: 'Telematics Provider', type: 'telematics', status: 'active', baseUrlMasked: 'https://telematics.***.io', lastUsed: '2025-03-14T08:30:00Z' },
    { id: 'ep3', name: 'Claims Gateway', type: 'third-party', status: 'active', baseUrlMasked: 'https://claims.***.com', lastUsed: '2025-03-10T14:00:00Z' },
  ],
  webhooks: [
    { id: 'wh1', eventType: 'claim.submitted', urlMasked: 'https://your-app.com/webhooks/claims', status: 'active', lastTriggered: '2025-03-10T14:05:00Z' },
    { id: 'wh2', eventType: 'policy.updated', urlMasked: 'https://your-app.com/webhooks/policy', status: 'active', lastTriggered: '2025-03-01T09:00:00Z' },
    { id: 'wh3', eventType: 'risk.alert', urlMasked: 'https://your-app.com/webhooks/risk', status: 'inactive', lastTriggered: null },
  ],
  rateLimits: {
    period: 'monthly',
    items: [
      { product: 'Risk API', limit: 10000, used: 2847, remaining: 7153 },
      { product: 'Claims API', limit: 5000, used: 1203, remaining: 3797 },
      { product: 'Policy API', limit: 5000, used: 892, remaining: 4108 },
    ],
  },
  lastUpdated: now,
}

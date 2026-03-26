/**
 * Client-side fallback data for dealer dashboard sections.
 * Used when the API is unreachable so the UI still shows sample data.
 */
import type {
  DealerInventoryItem,
  DealerLeadsData,
  DealerDynamicPricingData,
  DealerDemandForecastData,
  DealerSalesFunnelData,
  DealerSalesAnalyticsData,
  DealerCommissionData,
  DealerMarketTrendsData,
  DealerTradeInValuationsData,
  DealerCustomersData,
  DealerFinanceIntegrationData,
} from '../../../api/client'

const now = new Date().toISOString()

export const FALLBACK_DEALER_INVENTORY: DealerInventoryItem[] = [
  { id: 'f1', make: 'Toyota', model: 'Camry', year: 2024, price: 28500, status: 'available', plateNumber: 'ABC-1234' },
  { id: 'f2', make: 'Honda', model: 'Accord', year: 2024, price: 31000, status: 'available', plateNumber: 'DEF-5678' },
  { id: 'f3', make: 'Ford', model: 'F-150', year: 2024, price: 45000, status: 'service', plateNumber: 'GHI-9012' },
]

export const FALLBACK_DEALER_LEADS: DealerLeadsData = {
  dataSource: 'fallback',
  leads: [
    { id: 'L1', name: 'John Smith', email: 'john@example.com', phone: '+1 555-0101', source: 'Website', status: 'new', score: 72, createdAt: now },
    { id: 'L2', name: 'Jane Doe', email: 'jane@example.com', phone: '+1 555-0102', source: 'Referral', status: 'contacted', score: 85, createdAt: now },
    { id: 'L3', name: 'Bob Wilson', email: 'bob@example.com', phone: '+1 555-0103', source: 'Walk-in', status: 'qualified', score: 90, createdAt: now },
  ],
  lastUpdated: now,
}

export const FALLBACK_DEALER_PRICING: DealerDynamicPricingData = {
  dataSource: 'fallback',
  suggestedPrices: [
    { vehicleId: 'V1', make: 'Toyota', model: 'Camry', currentPrice: 28500, suggestedPrice: 27900, margin: 0.12, reason: 'Market dip' },
    { vehicleId: 'V2', make: 'Honda', model: 'Accord', currentPrice: 31000, suggestedPrice: 30500, margin: 0.11, reason: 'Competitor promo' },
  ],
  rules: [
    { id: 'r1', name: 'Floor discount', value: '5% max' },
    { id: 'r2', name: 'Clearance', value: '10% on 90+ days' },
  ],
  lastUpdated: now,
}

export const FALLBACK_DEALER_DEMAND: DealerDemandForecastData = {
  dataSource: 'fallback',
  bySegment: [
    { segment: 'Sedan', demand: 45, stock: 38, gap: 7 },
    { segment: 'SUV', demand: 62, stock: 55, gap: 7 },
    { segment: 'Compact', demand: 28, stock: 30, gap: -2 },
  ],
  byMonth: [
    { month: '2025-04', demand: 120, trend: 'up' },
    { month: '2025-05', demand: 135, trend: 'up' },
    { month: '2025-06', demand: 128, trend: 'stable' },
  ],
  lastUpdated: now,
}

export const FALLBACK_DEALER_FUNNEL: DealerSalesFunnelData = {
  dataSource: 'fallback',
  stages: [
    { stage: 'Lead', count: 124, conversion: 100 },
    { stage: 'Contacted', count: 89, conversion: 72 },
    { stage: 'Qualified', count: 45, conversion: 36 },
    { stage: 'Proposal', count: 28, conversion: 23 },
    { stage: 'Closed', count: 18, conversion: 15 },
  ],
  summary: { totalLeads: 124, winRate: 0.145 },
  lastUpdated: now,
}

export const FALLBACK_DEALER_SALES: DealerSalesAnalyticsData = {
  dataSource: 'fallback',
  totalRevenue: 485000,
  unitsSold: 42,
  avgDealSize: 11548,
  byMonth: [
    { month: 'Jan 2025', revenue: 142000, units: 12 },
    { month: 'Feb 2025', revenue: 168000, units: 15 },
    { month: 'Mar 2025', revenue: 175000, units: 15 },
  ],
  lastUpdated: now,
}

export const FALLBACK_DEALER_COMMISSION: DealerCommissionData = {
  dataSource: 'fallback',
  totalEarned: 24500,
  pending: 3200,
  byStaff: [
    { staffId: 'S1', name: 'Alex Sales', earned: 8200, pending: 1100, deals: 12 },
    { staffId: 'S2', name: 'Sam Jones', earned: 7800, pending: 900, deals: 10 },
    { staffId: 'S3', name: 'Jordan Lee', earned: 8500, pending: 1200, deals: 14 },
  ],
  lastUpdated: now,
}

export const FALLBACK_DEALER_MARKET_TRENDS: DealerMarketTrendsData = {
  dataSource: 'fallback',
  insights: [
    { id: '1', title: 'SUV demand up 12%', segment: 'SUV', trend: 'up', impact: 'Consider stocking more SUVs' },
    { id: '2', title: 'Sedan prices softening', segment: 'Sedan', trend: 'down', impact: 'Review sedan margins' },
    { id: '3', title: 'EV interest rising', segment: 'EV', trend: 'up', impact: 'Promote EV inventory' },
  ],
  priceIndex: { sedan: 98, suv: 104, truck: 102 },
  lastUpdated: now,
}

export const FALLBACK_DEALER_TRADE_IN: DealerTradeInValuationsData = {
  dataSource: 'fallback',
  valuations: [
    { id: 'T1', make: 'Toyota', model: 'Camry', year: 2020, mileage: 45000, condition: 'Good', rangeLow: 16500, rangeHigh: 18200, certifiedOffer: 17500 },
    { id: 'T2', make: 'Honda', model: 'Civic', year: 2019, mileage: 52000, condition: 'Fair', rangeLow: 14200, rangeHigh: 15800, certifiedOffer: 15000 },
  ],
  lastUpdated: now,
}

export const FALLBACK_DEALER_CUSTOMERS: DealerCustomersData = {
  dataSource: 'fallback',
  customers: [
    { id: 'C1', name: 'John Smith', email: 'john@example.com', vehiclesOwned: 1, lastVisit: '2025-03-10', lifetimeValue: 28500 },
    { id: 'C2', name: 'Jane Doe', email: 'jane@example.com', vehiclesOwned: 2, lastVisit: '2025-03-14', lifetimeValue: 52000 },
    { id: 'C3', name: 'Bob Wilson', email: 'bob@example.com', vehiclesOwned: 1, lastVisit: '2025-02-28', lifetimeValue: 31000 },
  ],
  lastUpdated: now,
}

export const FALLBACK_DEALER_FINANCE: DealerFinanceIntegrationData = {
  dataSource: 'fallback',
  lenders: [
    { id: 'L1', name: 'Dealer Finance Co', status: 'active', approvalRate: 0.78 },
    { id: 'L2', name: 'Prime Auto Loans', status: 'active', approvalRate: 0.82 },
  ],
  summary: { applicationsThisMonth: 28, approved: 22, avgApr: 6.5 },
  lastUpdated: now,
}

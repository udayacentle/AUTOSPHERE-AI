import type {
  PropertyParkingStatsData,
  PropertySlotsData,
  PropertyDynamicPricingData,
  PropertyEvChargingData,
  PropertyLoadBalancingData,
  PropertyRevenueAnalyticsData,
  PropertyPeakTrafficData,
  PropertyAccessControlData,
  PropertyCarbonImpactData,
} from '../../../api/client'

export const FALLBACK_PARKING_STATS: PropertyParkingStatsData = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  utilization: [78, 82, 75, 88, 85, 90],
  revenue: [4200, 4850, 5100, 4900, 5300, 5600],
  currency: 'USD',
  totalSlots: 120,
  zones: [
    { id: 'A', name: 'Lot A', slots: 40, occupied: 32 },
    { id: 'B', name: 'Lot B', slots: 50, occupied: 38 },
    { id: 'C', name: 'EV only', slots: 30, occupied: 22 },
  ],
}

export const FALLBACK_SLOTS: PropertySlotsData = {
  slots: [
    { id: 'P-001', type: 'parking', zoneId: 'A', status: 'available', reservedUntil: null },
    { id: 'P-002', type: 'parking', zoneId: 'A', status: 'occupied', reservedUntil: null },
    { id: 'P-003', type: 'parking', zoneId: 'A', status: 'reserved', reservedUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
    { id: 'EV-001', type: 'ev', zoneId: 'C', status: 'available', reservedUntil: null, powerKw: 22 },
    { id: 'EV-002', type: 'ev', zoneId: 'C', status: 'in_use', reservedUntil: null, powerKw: 50 },
    { id: 'EV-003', type: 'ev', zoneId: 'C', status: 'available', reservedUntil: null, powerKw: 22 },
  ],
  total: 6,
}

export const FALLBACK_DYNAMIC_PRICING: PropertyDynamicPricingData = {
  parkingRates: [
    { zoneId: 'A', basePerHour: 3, peakMultiplier: 1.5, peakHours: '17:00-20:00' },
    { zoneId: 'B', basePerHour: 2.5, peakMultiplier: 1.3, peakHours: '08:00-10:00,17:00-19:00' },
  ],
  evRates: [{ ratePerKwh: 0.32, offPeakPerKwh: 0.22, offPeakHours: '22:00-06:00' }],
  overrides: [
    { id: 'ov-1', zoneId: 'A', reason: 'Event', multiplier: 1.8, validFrom: '2025-03-20T00:00:00', validTo: '2025-03-21T23:59:59' },
  ],
}

export const FALLBACK_EV_CHARGING: PropertyEvChargingData = {
  stations: [
    { id: 'ST-1', name: 'Bay 1', connectors: 2, available: 1, inUse: 1, powerKw: 22, status: 'online' },
    { id: 'ST-2', name: 'Bay 2', connectors: 2, available: 2, inUse: 0, powerKw: 50, status: 'online' },
    { id: 'ST-3', name: 'Bay 3', connectors: 1, available: 0, inUse: 1, powerKw: 22, status: 'online' },
  ],
  totalSessionsToday: 24,
  totalKwhToday: 312,
}

export const FALLBACK_LOAD_BALANCING: PropertyLoadBalancingData = {
  totalDrawKw: 72,
  capacityKw: 150,
  utilizationPercent: 48,
  byStation: [
    { stationId: 'ST-1', drawKw: 22, capacityKw: 44, status: 'ok' },
    { stationId: 'ST-2', drawKw: 0, capacityKw: 100, status: 'ok' },
    { stationId: 'ST-3', drawKw: 22, capacityKw: 22, status: 'ok' },
  ],
  alerts: [],
}

export const FALLBACK_REVENUE_ANALYTICS: PropertyRevenueAnalyticsData = {
  bySource: [
    { source: 'Parking', amount: 12400, percent: 72, period: 'month' },
    { source: 'EV charging', amount: 4800, percent: 28, period: 'month' },
  ],
  byPeriod: [
    { period: 'Today', parking: 420, ev: 180 },
    { period: 'This week', parking: 2850, ev: 920 },
    { period: 'This month', parking: 12400, ev: 4800 },
  ],
  currency: 'USD',
}

export const FALLBACK_PEAK_TRAFFIC: PropertyPeakTrafficData = {
  forecast: [
    { hour: '08:00', occupancyPercent: 72, chargingDemandKw: 44 },
    { hour: '12:00', occupancyPercent: 45, chargingDemandKw: 22 },
    { hour: '17:00', occupancyPercent: 88, chargingDemandKw: 66 },
    { hour: '19:00', occupancyPercent: 85, chargingDemandKw: 50 },
  ],
  peakWindows: [
    { start: '07:30', end: '09:30', label: 'Morning commute', suggestedMultiplier: 1.4 },
    { start: '16:30', end: '19:30', label: 'Evening peak', suggestedMultiplier: 1.5 },
  ],
}

export const FALLBACK_ACCESS_CONTROL: PropertyAccessControlData = {
  rules: [
    { id: 'r1', name: 'Monthly pass', type: 'subscription', access: ['A', 'B'], active: true },
    { id: 'r2', name: 'EV only', type: 'vehicle', access: ['C'], active: true },
  ],
  allowlist: [{ id: 'a1', label: 'VIP vehicles', count: 12 }],
  blocklist: [{ id: 'b1', label: 'Overstay', count: 3 }],
  recentLog: [
    { at: new Date().toISOString(), action: 'entry', gateId: 'G1', vehicleId: '***456' },
    { at: new Date(Date.now() - 300000).toISOString(), action: 'exit', gateId: 'G2', vehicleId: '***789' },
  ],
}

export const FALLBACK_CARBON_IMPACT: PropertyCarbonImpactData = {
  kwhDeliveredToday: 312,
  kwhDeliveredMonth: 8420,
  co2AvoidedKgMonth: 4200,
  equivalentIceKm: 16800,
  trend: [
    { month: 'Jan', kwh: 7200, co2Kg: 3600 },
    { month: 'Feb', kwh: 7800, co2Kg: 3900 },
    { month: 'Mar', kwh: 8420, co2Kg: 4200 },
  ],
}

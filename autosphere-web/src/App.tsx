import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import DriverLayout from './components/DriverLayout'
import InsuranceLayout from './components/InsuranceLayout'
import DealerLayout from './components/DealerLayout'
import SalesLayout from './components/SalesLayout'
import TechnicianLayout from './components/TechnicianLayout'
import PropertyLayout from './components/PropertyLayout'
import GovernmentLayout from './components/GovernmentLayout'
import AIAdminLayout from './components/AIAdminLayout'
import AnalyticsLayout from './components/AnalyticsLayout'
import AIAssistantLayout from './components/AIAssistantLayout'
import FleetLayout from './components/FleetLayout'
import Landing from './pages/Landing'
import Welcome from './pages/Welcome'
import PlatformHome from './pages/PlatformHome'
import Splash from './pages/auth/Splash'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import OTP from './pages/auth/OTP'
import BiometricSetup from './pages/auth/BiometricSetup'

// Lazy-load driver screens so initial load doesn't pull in all 26 components
const Authentication = lazy(() => import('./pages/platforms/driver/Authentication'))
const Onboarding = lazy(() => import('./pages/platforms/driver/Onboarding'))
const Dashboard = lazy(() => import('./pages/platforms/driver/Dashboard'))
const MobilityScore = lazy(() => import('./pages/platforms/driver/MobilityScore'))
const DrivingReports = lazy(() => import('./pages/platforms/driver/DrivingReports'))
const VehicleDetails = lazy(() => import('./pages/platforms/driver/VehicleDetails'))
const VehicleHealth = lazy(() => import('./pages/platforms/driver/VehicleHealth'))
const ServiceHistory = lazy(() => import('./pages/platforms/driver/ServiceHistory'))
const PredictiveMaintenance = lazy(() => import('./pages/platforms/driver/PredictiveMaintenance'))
const DrivingAnalytics = lazy(() => import('./pages/platforms/driver/DrivingAnalytics'))
const TripHistory = lazy(() => import('./pages/platforms/driver/TripHistory'))
const FuelTracker = lazy(() => import('./pages/platforms/driver/FuelTracker'))
const InsuranceOverview = lazy(() => import('./pages/platforms/driver/InsuranceOverview'))
const ClaimsUpload = lazy(() => import('./pages/platforms/driver/ClaimsUpload'))
const ClaimStatus = lazy(() => import('./pages/platforms/driver/ClaimStatus'))
const ServiceCenters = lazy(() => import('./pages/platforms/driver/ServiceCenters'))
const TechnicianProfile = lazy(() => import('./pages/platforms/driver/TechnicianProfile'))
const LiveRepair = lazy(() => import('./pages/platforms/driver/LiveRepair'))
const Parking = lazy(() => import('./pages/platforms/driver/Parking'))
const EVCharging = lazy(() => import('./pages/platforms/driver/EVCharging'))
const Emergency = lazy(() => import('./pages/platforms/driver/Emergency'))
const Roadside = lazy(() => import('./pages/platforms/driver/Roadside'))
const Resale = lazy(() => import('./pages/platforms/driver/Resale'))
const LoanCalculator = lazy(() => import('./pages/platforms/driver/LoanCalculator'))
const Marketplace = lazy(() => import('./pages/platforms/driver/Marketplace'))
const Settings = lazy(() => import('./pages/platforms/driver/Settings'))

// Lazy-load insurance screens
const InsuranceAdminLogin = lazy(() => import('./pages/platforms/insurance/InsuranceAdminLogin'))
const PortfolioOverviewDashboard = lazy(() => import('./pages/platforms/insurance/PortfolioOverviewDashboard'))
const RealTimeRiskMonitor = lazy(() => import('./pages/platforms/insurance/RealTimeRiskMonitor'))
const DriverRiskProfileView = lazy(() => import('./pages/platforms/insurance/DriverRiskProfileView'))
const DynamicPremiumAdjustmentPanel = lazy(() => import('./pages/platforms/insurance/DynamicPremiumAdjustmentPanel'))
const ClaimsManagementDashboard = lazy(() => import('./pages/platforms/insurance/ClaimsManagementDashboard'))
const AIFraudDetectionGraphView = lazy(() => import('./pages/platforms/insurance/AIFraudDetectionGraphView'))
const RiskHeatmaps = lazy(() => import('./pages/platforms/insurance/RiskHeatmaps'))
const PolicyManagement = lazy(() => import('./pages/platforms/insurance/PolicyManagement'))
const PredictiveLossForecasting = lazy(() => import('./pages/platforms/insurance/PredictiveLossForecasting'))
const ModelPerformanceMonitoring = lazy(() => import('./pages/platforms/insurance/ModelPerformanceMonitoring'))
const ComplianceReporting = lazy(() => import('./pages/platforms/insurance/ComplianceReporting'))
const APIIntegrationSettings = lazy(() => import('./pages/platforms/insurance/APIIntegrationSettings'))

// Lazy-load dealer screens
const DealerLoginDashboard = lazy(() => import('./pages/platforms/dealer/DealerLoginDashboard'))
const InventoryManagement = lazy(() => import('./pages/platforms/dealer/InventoryManagement'))
const AddEditVehicle = lazy(() => import('./pages/platforms/dealer/AddEditVehicle'))
const DigitalTwinInventoryView = lazy(() => import('./pages/platforms/dealer/DigitalTwinInventoryView'))
const DynamicPricingEngine = lazy(() => import('./pages/platforms/dealer/DynamicPricingEngine'))
const DemandForecastDashboard = lazy(() => import('./pages/platforms/dealer/DemandForecastDashboard'))
const TradeInValuationTool = lazy(() => import('./pages/platforms/dealer/TradeInValuationTool'))
const LeadManagement = lazy(() => import('./pages/platforms/dealer/LeadManagement'))
const CustomerProfileView = lazy(() => import('./pages/platforms/dealer/CustomerProfileView'))
const SalesFunnel = lazy(() => import('./pages/platforms/dealer/SalesFunnel'))
const SalesAnalytics = lazy(() => import('./pages/platforms/dealer/SalesAnalytics'))
const CommissionManagement = lazy(() => import('./pages/platforms/dealer/CommissionManagement'))
const FinanceIntegrationPanel = lazy(() => import('./pages/platforms/dealer/FinanceIntegrationPanel'))
const MarketTrendInsights = lazy(() => import('./pages/platforms/dealer/MarketTrendInsights'))

// Lazy-load sales screens
const SalesDashboard = lazy(() => import('./pages/platforms/sales/SalesDashboard'))
const LeadAssignmentScoring = lazy(() => import('./pages/platforms/sales/LeadAssignmentScoring'))
const CustomerInteractionLogs = lazy(() => import('./pages/platforms/sales/CustomerInteractionLogs'))
const PerformanceMetrics = lazy(() => import('./pages/platforms/sales/PerformanceMetrics'))
const CommissionTracker = lazy(() => import('./pages/platforms/sales/CommissionTracker'))
const AISalesSuggestions = lazy(() => import('./pages/platforms/sales/AISalesSuggestions'))
const FollowUpScheduler = lazy(() => import('./pages/platforms/sales/FollowUpScheduler'))
const TargetAchievementTracker = lazy(() => import('./pages/platforms/sales/TargetAchievementTracker'))

// Lazy-load technician screens
const TechnicianLogin = lazy(() => import('./pages/platforms/technician/TechnicianLogin'))
const JobQueueDashboard = lazy(() => import('./pages/platforms/technician/JobQueueDashboard'))
const VehicleDiagnosticDigitalTwin = lazy(() => import('./pages/platforms/technician/VehicleDiagnosticDigitalTwin'))
const AIFaultDetection = lazy(() => import('./pages/platforms/technician/AIFaultDetection'))
const RepairRecommendations = lazy(() => import('./pages/platforms/technician/RepairRecommendations'))
const PartsPredictionEngine = lazy(() => import('./pages/platforms/technician/PartsPredictionEngine'))
const RepairWorkflowTracker = lazy(() => import('./pages/platforms/technician/RepairWorkflowTracker'))
const ARAssistanceView = lazy(() => import('./pages/platforms/technician/ARAssistanceView'))
const RepairTimeEstimator = lazy(() => import('./pages/platforms/technician/RepairTimeEstimator'))
const TechnicianPerformanceScore = lazy(() => import('./pages/platforms/technician/TechnicianPerformanceScore'))
const EarningsSummary = lazy(() => import('./pages/platforms/technician/EarningsSummary'))

// Lazy-load property screens
const PropertyAdminLogin = lazy(() => import('./pages/platforms/property/PropertyAdminLogin'))
const PropertyDashboard = lazy(() => import('./pages/platforms/property/PropertyDashboard'))
const ParkingUtilizationHeatmap = lazy(() => import('./pages/platforms/property/ParkingUtilizationHeatmap'))
const SlotManagement = lazy(() => import('./pages/platforms/property/SlotManagement'))
const PropertyDynamicPricingEngine = lazy(() => import('./pages/platforms/property/DynamicPricingEngine'))
const EVChargingControlPanel = lazy(() => import('./pages/platforms/property/EVChargingControlPanel'))
const LoadBalancingMonitor = lazy(() => import('./pages/platforms/property/LoadBalancingMonitor'))
const RevenueAnalyticsDashboard = lazy(() => import('./pages/platforms/property/RevenueAnalyticsDashboard'))
const PeakTrafficPrediction = lazy(() => import('./pages/platforms/property/PeakTrafficPrediction'))
const AccessControlManagement = lazy(() => import('./pages/platforms/property/AccessControlManagement'))
const CarbonImpactDashboard = lazy(() => import('./pages/platforms/property/CarbonImpactDashboard'))

// Lazy-load government screens
const RegulatorLogin = lazy(() => import('./pages/platforms/government/RegulatorLogin'))
const NationalVehicleOverview = lazy(() => import('./pages/platforms/government/NationalVehicleOverview'))
const ComplianceMonitoringDashboard = lazy(() => import('./pages/platforms/government/ComplianceMonitoringDashboard'))
const EmissionMonitoringPanel = lazy(() => import('./pages/platforms/government/EmissionMonitoringPanel'))
const TrafficDensityHeatmap = lazy(() => import('./pages/platforms/government/TrafficDensityHeatmap'))
const AccidentClusterPrediction = lazy(() => import('./pages/platforms/government/AccidentClusterPrediction'))
const RiskZoneAnalytics = lazy(() => import('./pages/platforms/government/RiskZoneAnalytics'))
const PolicySimulationEngine = lazy(() => import('./pages/platforms/government/PolicySimulationEngine'))
const RecallMonitoring = lazy(() => import('./pages/platforms/government/RecallMonitoring'))
const FraudPatternAnalytics = lazy(() => import('./pages/platforms/government/FraudPatternAnalytics'))
const RegionalReports = lazy(() => import('./pages/platforms/government/RegionalReports'))
const ExportReportingTools = lazy(() => import('./pages/platforms/government/ExportReportingTools'))

// Lazy-load AI Admin screens
const SuperAdminDashboard = lazy(() => import('./pages/platforms/ai-admin/SuperAdminDashboard'))
const UserRoleManagement = lazy(() => import('./pages/platforms/ai-admin/UserRoleManagement'))
const AIModelMonitoring = lazy(() => import('./pages/platforms/ai-admin/AIModelMonitoring'))
const ModelAccuracyDashboard = lazy(() => import('./pages/platforms/ai-admin/ModelAccuracyDashboard'))
const FederatedLearningMonitor = lazy(() => import('./pages/platforms/ai-admin/FederatedLearningMonitor'))
const DataFlowVisualization = lazy(() => import('./pages/platforms/ai-admin/DataFlowVisualization'))
const APIGatewayMonitor = lazy(() => import('./pages/platforms/ai-admin/APIGatewayMonitor'))
const SystemHealthDashboard = lazy(() => import('./pages/platforms/ai-admin/SystemHealthDashboard'))
const IncidentManagement = lazy(() => import('./pages/platforms/ai-admin/IncidentManagement'))
const AuditLogs = lazy(() => import('./pages/platforms/ai-admin/AuditLogs'))
const SecurityControlCenter = lazy(() => import('./pages/platforms/ai-admin/SecurityControlCenter'))
const BillingSubscriptionManagement = lazy(() => import('./pages/platforms/ai-admin/BillingSubscriptionManagement'))

// Lazy-load analytics (cross-platform) screens
const GlobalPerformanceDashboard = lazy(() => import('./pages/platforms/analytics/GlobalPerformanceDashboard'))
const MobilityScoreDistribution = lazy(() => import('./pages/platforms/analytics/MobilityScoreDistribution'))
const VehicleHealthTrends = lazy(() => import('./pages/platforms/analytics/VehicleHealthTrends'))
const InsuranceRiskTrends = lazy(() => import('./pages/platforms/analytics/InsuranceRiskTrends'))
const DealerSalesTrends = lazy(() => import('./pages/platforms/analytics/DealerSalesTrends'))
const TechnicianPerformanceTrends = lazy(() => import('./pages/platforms/analytics/TechnicianPerformanceTrends'))
const ParkingRevenueTrends = lazy(() => import('./pages/platforms/analytics/ParkingRevenueTrends'))
const EmissionAnalytics = lazy(() => import('./pages/platforms/analytics/EmissionAnalytics'))
const PredictiveForecastCharts = lazy(() => import('./pages/platforms/analytics/PredictiveForecastCharts'))
const AIModelComparisonDashboard = lazy(() => import('./pages/platforms/analytics/AIModelComparisonDashboard'))

// Lazy-load AI Assistant screens
const AIChatInterface = lazy(() => import('./pages/platforms/ai-assistant/AIChatInterface'))
const VoiceAssistantScreen = lazy(() => import('./pages/platforms/ai-assistant/VoiceAssistantScreen'))
const PredictiveSuggestionsPanel = lazy(() => import('./pages/platforms/ai-assistant/PredictiveSuggestionsPanel'))
const ContextAwareActionSuggestions = lazy(() => import('./pages/platforms/ai-assistant/ContextAwareActionSuggestions'))
const AIExplanationScreen = lazy(() => import('./pages/platforms/ai-assistant/AIExplanationScreen'))

// Lazy-load fleet screens
const FleetDashboard = lazy(() => import('./pages/platforms/fleet/FleetDashboard'))
const FleetVehicles = lazy(() => import('./pages/platforms/fleet/Vehicles'))
const FleetTracking = lazy(() => import('./pages/platforms/fleet/Tracking'))
const FleetDrivers = lazy(() => import('./pages/platforms/fleet/Drivers'))
const FleetMaintenance = lazy(() => import('./pages/platforms/fleet/Maintenance'))
const FleetReports = lazy(() => import('./pages/platforms/fleet/Reports'))
const FleetOrganizations = lazy(() => import('./pages/platforms/fleet/Organizations'))
const FleetRoles = lazy(() => import('./pages/platforms/fleet/Roles'))
const FleetTrips = lazy(() => import('./pages/platforms/fleet/Trips'))

function LoadingFallback() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      Loading…
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/auth" element={<Navigate to="/auth/splash" replace />} />
      <Route path="/auth/splash" element={<Splash />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/otp" element={<OTP />} />
      <Route path="/auth/biometric" element={<BiometricSetup />} />
      <Route path="/app" element={<Layout />}>
        <Route index element={<Welcome />} />
        <Route path="driver" element={<DriverLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="authentication" element={<Suspense fallback={<LoadingFallback />}><Authentication /></Suspense>} />
          <Route path="onboarding" element={<Suspense fallback={<LoadingFallback />}><Onboarding /></Suspense>} />
          <Route path="dashboard" element={<Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense>} />
          <Route path="mobility-score" element={<Suspense fallback={<LoadingFallback />}><MobilityScore /></Suspense>} />
          <Route path="driving-reports" element={<Suspense fallback={<LoadingFallback />}><DrivingReports /></Suspense>} />
          <Route path="vehicle-details" element={<Suspense fallback={<LoadingFallback />}><VehicleDetails /></Suspense>} />
          <Route path="vehicle-health" element={<Suspense fallback={<LoadingFallback />}><VehicleHealth /></Suspense>} />
          <Route path="service-history" element={<Suspense fallback={<LoadingFallback />}><ServiceHistory /></Suspense>} />
          <Route path="predictive-maintenance" element={<Suspense fallback={<LoadingFallback />}><PredictiveMaintenance /></Suspense>} />
          <Route path="driving-analytics" element={<Suspense fallback={<LoadingFallback />}><DrivingAnalytics /></Suspense>} />
          <Route path="trip-history" element={<Suspense fallback={<LoadingFallback />}><TripHistory /></Suspense>} />
          <Route path="fuel-tracker" element={<Suspense fallback={<LoadingFallback />}><FuelTracker /></Suspense>} />
          <Route path="insurance-overview" element={<Suspense fallback={<LoadingFallback />}><InsuranceOverview /></Suspense>} />
          <Route path="claims-upload" element={<Suspense fallback={<LoadingFallback />}><ClaimsUpload /></Suspense>} />
          <Route path="claim-status" element={<Suspense fallback={<LoadingFallback />}><ClaimStatus /></Suspense>} />
          <Route path="service-centers" element={<Suspense fallback={<LoadingFallback />}><ServiceCenters /></Suspense>} />
          <Route path="technician-profile" element={<Suspense fallback={<LoadingFallback />}><TechnicianProfile /></Suspense>} />
          <Route path="live-repair" element={<Suspense fallback={<LoadingFallback />}><LiveRepair /></Suspense>} />
          <Route path="parking" element={<Suspense fallback={<LoadingFallback />}><Parking /></Suspense>} />
          <Route path="ev-charging" element={<Suspense fallback={<LoadingFallback />}><EVCharging /></Suspense>} />
          <Route path="emergency" element={<Suspense fallback={<LoadingFallback />}><Emergency /></Suspense>} />
          <Route path="roadside" element={<Suspense fallback={<LoadingFallback />}><Roadside /></Suspense>} />
          <Route path="resale" element={<Suspense fallback={<LoadingFallback />}><Resale /></Suspense>} />
          <Route path="loan-calculator" element={<Suspense fallback={<LoadingFallback />}><LoanCalculator /></Suspense>} />
          <Route path="marketplace" element={<Suspense fallback={<LoadingFallback />}><Marketplace /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<LoadingFallback />}><Settings /></Suspense>} />
        </Route>
        <Route path="insurance" element={<InsuranceLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="insurance-admin-login" element={<Suspense fallback={<LoadingFallback />}><InsuranceAdminLogin /></Suspense>} />
          <Route path="portfolio-overview-dashboard" element={<Suspense fallback={<LoadingFallback />}><PortfolioOverviewDashboard /></Suspense>} />
          <Route path="real-time-risk-monitor" element={<Suspense fallback={<LoadingFallback />}><RealTimeRiskMonitor /></Suspense>} />
          <Route path="driver-risk-profile-view" element={<Suspense fallback={<LoadingFallback />}><DriverRiskProfileView /></Suspense>} />
          <Route path="dynamic-premium-adjustment-panel" element={<Suspense fallback={<LoadingFallback />}><DynamicPremiumAdjustmentPanel /></Suspense>} />
          <Route path="claims-management-dashboard" element={<Suspense fallback={<LoadingFallback />}><ClaimsManagementDashboard /></Suspense>} />
          <Route path="ai-fraud-detection-graph-view" element={<Suspense fallback={<LoadingFallback />}><AIFraudDetectionGraphView /></Suspense>} />
          <Route path="risk-heatmaps" element={<Suspense fallback={<LoadingFallback />}><RiskHeatmaps /></Suspense>} />
          <Route path="policy-management" element={<Suspense fallback={<LoadingFallback />}><PolicyManagement /></Suspense>} />
          <Route path="predictive-loss-forecasting" element={<Suspense fallback={<LoadingFallback />}><PredictiveLossForecasting /></Suspense>} />
          <Route path="model-performance-monitoring" element={<Suspense fallback={<LoadingFallback />}><ModelPerformanceMonitoring /></Suspense>} />
          <Route path="compliance-reporting" element={<Suspense fallback={<LoadingFallback />}><ComplianceReporting /></Suspense>} />
          <Route path="api-integration-settings" element={<Suspense fallback={<LoadingFallback />}><APIIntegrationSettings /></Suspense>} />
        </Route>
        <Route path="dealer" element={<DealerLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="dealer-login-dashboard" element={<Suspense fallback={<LoadingFallback />}><DealerLoginDashboard /></Suspense>} />
          <Route path="inventory-management" element={<Suspense fallback={<LoadingFallback />}><InventoryManagement /></Suspense>} />
          <Route path="add-edit-vehicle" element={<Suspense fallback={<LoadingFallback />}><AddEditVehicle /></Suspense>} />
          <Route path="digital-twin-inventory-view" element={<Suspense fallback={<LoadingFallback />}><DigitalTwinInventoryView /></Suspense>} />
          <Route path="dynamic-pricing-engine" element={<Suspense fallback={<LoadingFallback />}><DynamicPricingEngine /></Suspense>} />
          <Route path="demand-forecast-dashboard" element={<Suspense fallback={<LoadingFallback />}><DemandForecastDashboard /></Suspense>} />
          <Route path="trade-in-valuation-tool" element={<Suspense fallback={<LoadingFallback />}><TradeInValuationTool /></Suspense>} />
          <Route path="lead-management" element={<Suspense fallback={<LoadingFallback />}><LeadManagement /></Suspense>} />
          <Route path="customer-profile-view" element={<Suspense fallback={<LoadingFallback />}><CustomerProfileView /></Suspense>} />
          <Route path="sales-funnel" element={<Suspense fallback={<LoadingFallback />}><SalesFunnel /></Suspense>} />
          <Route path="sales-analytics" element={<Suspense fallback={<LoadingFallback />}><SalesAnalytics /></Suspense>} />
          <Route path="commission-management" element={<Suspense fallback={<LoadingFallback />}><CommissionManagement /></Suspense>} />
          <Route path="finance-integration-panel" element={<Suspense fallback={<LoadingFallback />}><FinanceIntegrationPanel /></Suspense>} />
          <Route path="market-trend-insights" element={<Suspense fallback={<LoadingFallback />}><MarketTrendInsights /></Suspense>} />
        </Route>
        <Route path="sales" element={<SalesLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="sales-dashboard" element={<Suspense fallback={<LoadingFallback />}><SalesDashboard /></Suspense>} />
          <Route path="lead-assignment-scoring" element={<Suspense fallback={<LoadingFallback />}><LeadAssignmentScoring /></Suspense>} />
          <Route path="customer-interaction-logs" element={<Suspense fallback={<LoadingFallback />}><CustomerInteractionLogs /></Suspense>} />
          <Route path="performance-metrics" element={<Suspense fallback={<LoadingFallback />}><PerformanceMetrics /></Suspense>} />
          <Route path="commission-tracker" element={<Suspense fallback={<LoadingFallback />}><CommissionTracker /></Suspense>} />
          <Route path="ai-sales-suggestions" element={<Suspense fallback={<LoadingFallback />}><AISalesSuggestions /></Suspense>} />
          <Route path="follow-up-scheduler" element={<Suspense fallback={<LoadingFallback />}><FollowUpScheduler /></Suspense>} />
          <Route path="target-achievement-tracker" element={<Suspense fallback={<LoadingFallback />}><TargetAchievementTracker /></Suspense>} />
        </Route>
        <Route path="technician" element={<TechnicianLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="technician-login" element={<Suspense fallback={<LoadingFallback />}><TechnicianLogin /></Suspense>} />
          <Route path="job-queue-dashboard" element={<Suspense fallback={<LoadingFallback />}><JobQueueDashboard /></Suspense>} />
          <Route path="vehicle-diagnostic-digital-twin" element={<Suspense fallback={<LoadingFallback />}><VehicleDiagnosticDigitalTwin /></Suspense>} />
          <Route path="ai-fault-detection" element={<Suspense fallback={<LoadingFallback />}><AIFaultDetection /></Suspense>} />
          <Route path="repair-recommendations" element={<Suspense fallback={<LoadingFallback />}><RepairRecommendations /></Suspense>} />
          <Route path="parts-prediction-engine" element={<Suspense fallback={<LoadingFallback />}><PartsPredictionEngine /></Suspense>} />
          <Route path="repair-workflow-tracker" element={<Suspense fallback={<LoadingFallback />}><RepairWorkflowTracker /></Suspense>} />
          <Route path="ar-assistance-view" element={<Suspense fallback={<LoadingFallback />}><ARAssistanceView /></Suspense>} />
          <Route path="repair-time-estimator" element={<Suspense fallback={<LoadingFallback />}><RepairTimeEstimator /></Suspense>} />
          <Route path="technician-performance-score" element={<Suspense fallback={<LoadingFallback />}><TechnicianPerformanceScore /></Suspense>} />
          <Route path="earnings-summary" element={<Suspense fallback={<LoadingFallback />}><EarningsSummary /></Suspense>} />
        </Route>
        <Route path="property" element={<PropertyLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="property-admin-login" element={<Suspense fallback={<LoadingFallback />}><PropertyAdminLogin /></Suspense>} />
          <Route path="property-dashboard" element={<Suspense fallback={<LoadingFallback />}><PropertyDashboard /></Suspense>} />
          <Route path="parking-utilization-heatmap" element={<Suspense fallback={<LoadingFallback />}><ParkingUtilizationHeatmap /></Suspense>} />
          <Route path="slot-management" element={<Suspense fallback={<LoadingFallback />}><SlotManagement /></Suspense>} />
          <Route path="dynamic-pricing-engine" element={<Suspense fallback={<LoadingFallback />}><PropertyDynamicPricingEngine /></Suspense>} />
          <Route path="ev-charging-control-panel" element={<Suspense fallback={<LoadingFallback />}><EVChargingControlPanel /></Suspense>} />
          <Route path="load-balancing-monitor" element={<Suspense fallback={<LoadingFallback />}><LoadBalancingMonitor /></Suspense>} />
          <Route path="revenue-analytics-dashboard" element={<Suspense fallback={<LoadingFallback />}><RevenueAnalyticsDashboard /></Suspense>} />
          <Route path="peak-traffic-prediction" element={<Suspense fallback={<LoadingFallback />}><PeakTrafficPrediction /></Suspense>} />
          <Route path="access-control-management" element={<Suspense fallback={<LoadingFallback />}><AccessControlManagement /></Suspense>} />
          <Route path="carbon-impact-dashboard" element={<Suspense fallback={<LoadingFallback />}><CarbonImpactDashboard /></Suspense>} />
        </Route>
        <Route path="government" element={<GovernmentLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="regulator-login" element={<Suspense fallback={<LoadingFallback />}><RegulatorLogin /></Suspense>} />
          <Route path="national-vehicle-overview" element={<Suspense fallback={<LoadingFallback />}><NationalVehicleOverview /></Suspense>} />
          <Route path="compliance-monitoring-dashboard" element={<Suspense fallback={<LoadingFallback />}><ComplianceMonitoringDashboard /></Suspense>} />
          <Route path="emission-monitoring-panel" element={<Suspense fallback={<LoadingFallback />}><EmissionMonitoringPanel /></Suspense>} />
          <Route path="traffic-density-heatmap" element={<Suspense fallback={<LoadingFallback />}><TrafficDensityHeatmap /></Suspense>} />
          <Route path="accident-cluster-prediction" element={<Suspense fallback={<LoadingFallback />}><AccidentClusterPrediction /></Suspense>} />
          <Route path="risk-zone-analytics" element={<Suspense fallback={<LoadingFallback />}><RiskZoneAnalytics /></Suspense>} />
          <Route path="policy-simulation-engine" element={<Suspense fallback={<LoadingFallback />}><PolicySimulationEngine /></Suspense>} />
          <Route path="recall-monitoring" element={<Suspense fallback={<LoadingFallback />}><RecallMonitoring /></Suspense>} />
          <Route path="fraud-pattern-analytics" element={<Suspense fallback={<LoadingFallback />}><FraudPatternAnalytics /></Suspense>} />
          <Route path="regional-reports" element={<Suspense fallback={<LoadingFallback />}><RegionalReports /></Suspense>} />
          <Route path="export-reporting-tools" element={<Suspense fallback={<LoadingFallback />}><ExportReportingTools /></Suspense>} />
        </Route>
        <Route path="ai-admin" element={<AIAdminLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="super-admin-dashboard" element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard /></Suspense>} />
          <Route path="user-role-management" element={<Suspense fallback={<LoadingFallback />}><UserRoleManagement /></Suspense>} />
          <Route path="ai-model-monitoring" element={<Suspense fallback={<LoadingFallback />}><AIModelMonitoring /></Suspense>} />
          <Route path="model-accuracy-dashboard" element={<Suspense fallback={<LoadingFallback />}><ModelAccuracyDashboard /></Suspense>} />
          <Route path="federated-learning-monitor" element={<Suspense fallback={<LoadingFallback />}><FederatedLearningMonitor /></Suspense>} />
          <Route path="data-flow-visualization" element={<Suspense fallback={<LoadingFallback />}><DataFlowVisualization /></Suspense>} />
          <Route path="api-gateway-monitor" element={<Suspense fallback={<LoadingFallback />}><APIGatewayMonitor /></Suspense>} />
          <Route path="system-health-dashboard" element={<Suspense fallback={<LoadingFallback />}><SystemHealthDashboard /></Suspense>} />
          <Route path="incident-management" element={<Suspense fallback={<LoadingFallback />}><IncidentManagement /></Suspense>} />
          <Route path="audit-logs" element={<Suspense fallback={<LoadingFallback />}><AuditLogs /></Suspense>} />
          <Route path="security-control-center" element={<Suspense fallback={<LoadingFallback />}><SecurityControlCenter /></Suspense>} />
          <Route path="billing-subscription-management" element={<Suspense fallback={<LoadingFallback />}><BillingSubscriptionManagement /></Suspense>} />
        </Route>
        <Route path="analytics" element={<AnalyticsLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="global-performance-dashboard" element={<Suspense fallback={<LoadingFallback />}><GlobalPerformanceDashboard /></Suspense>} />
          <Route path="mobility-score-distribution" element={<Suspense fallback={<LoadingFallback />}><MobilityScoreDistribution /></Suspense>} />
          <Route path="vehicle-health-trends" element={<Suspense fallback={<LoadingFallback />}><VehicleHealthTrends /></Suspense>} />
          <Route path="insurance-risk-trends" element={<Suspense fallback={<LoadingFallback />}><InsuranceRiskTrends /></Suspense>} />
          <Route path="dealer-sales-trends" element={<Suspense fallback={<LoadingFallback />}><DealerSalesTrends /></Suspense>} />
          <Route path="technician-performance-trends" element={<Suspense fallback={<LoadingFallback />}><TechnicianPerformanceTrends /></Suspense>} />
          <Route path="parking-revenue-trends" element={<Suspense fallback={<LoadingFallback />}><ParkingRevenueTrends /></Suspense>} />
          <Route path="emission-analytics" element={<Suspense fallback={<LoadingFallback />}><EmissionAnalytics /></Suspense>} />
          <Route path="predictive-forecast-charts" element={<Suspense fallback={<LoadingFallback />}><PredictiveForecastCharts /></Suspense>} />
          <Route path="ai-model-comparison-dashboard" element={<Suspense fallback={<LoadingFallback />}><AIModelComparisonDashboard /></Suspense>} />
        </Route>
        <Route path="ai-assistant" element={<AIAssistantLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="ai-chat-interface" element={<Suspense fallback={<LoadingFallback />}><AIChatInterface /></Suspense>} />
          <Route path="voice-assistant-screen" element={<Suspense fallback={<LoadingFallback />}><VoiceAssistantScreen /></Suspense>} />
          <Route path="predictive-suggestions-panel" element={<Suspense fallback={<LoadingFallback />}><PredictiveSuggestionsPanel /></Suspense>} />
          <Route path="context-aware-action-suggestions" element={<Suspense fallback={<LoadingFallback />}><ContextAwareActionSuggestions /></Suspense>} />
          <Route path="ai-explanation-screen" element={<Suspense fallback={<LoadingFallback />}><AIExplanationScreen /></Suspense>} />
        </Route>
        <Route path="fleet" element={<FleetLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="dashboard" element={<Suspense fallback={<LoadingFallback />}><FleetDashboard /></Suspense>} />
          <Route path="vehicles" element={<Suspense fallback={<LoadingFallback />}><FleetVehicles /></Suspense>} />
          <Route path="tracking" element={<Suspense fallback={<LoadingFallback />}><FleetTracking /></Suspense>} />
          <Route path="drivers" element={<Suspense fallback={<LoadingFallback />}><FleetDrivers /></Suspense>} />
          <Route path="maintenance" element={<Suspense fallback={<LoadingFallback />}><FleetMaintenance /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<LoadingFallback />}><FleetReports /></Suspense>} />
          <Route path="organizations" element={<Suspense fallback={<LoadingFallback />}><FleetOrganizations /></Suspense>} />
          <Route path="roles" element={<Suspense fallback={<LoadingFallback />}><FleetRoles /></Suspense>} />
          <Route path="trips" element={<Suspense fallback={<LoadingFallback />}><FleetTrips /></Suspense>} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import DriverLayout from './components/DriverLayout'
import InsuranceLayout from './components/InsuranceLayout'
import DealerLayout from './components/DealerLayout'
import Landing from './pages/Landing'
import Welcome from './pages/Welcome'
import Splash from './pages/auth/Splash'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import OTP from './pages/auth/OTP'
import BiometricSetup from './pages/auth/BiometricSetup'
import Sales from './pages/platforms/Sales'
import Technician from './pages/platforms/Technician'
import Property from './pages/platforms/Property'
import Government from './pages/platforms/Government'
import AIAdmin from './pages/platforms/AIAdmin'
import Analytics from './pages/platforms/Analytics'
import AIAssistant from './pages/platforms/AIAssistant'

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
      <Route path="/" element={<Navigate to="/app" replace />} />
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
          <Route index element={<Navigate to="/app/driver/dashboard" replace />} />
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
          <Route index element={<Navigate to="/app/insurance/portfolio-overview-dashboard" replace />} />
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
          <Route index element={<Navigate to="/app/dealer/dealer-login-dashboard" replace />} />
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
        <Route path="sales" element={<Sales />} />
        <Route path="technician" element={<Technician />} />
        <Route path="property" element={<Property />} />
        <Route path="government" element={<Government />} />
        <Route path="ai-admin" element={<AIAdmin />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

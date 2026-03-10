export interface DriverScreen {
  id: number
  path: string
  title: string
}

export const DRIVER_SCREENS: DriverScreen[] = [
  { id: 1, path: 'authentication', title: 'Authentication (Splash, Login, Signup, OTP, Biometric Setup)' },
  { id: 2, path: 'onboarding', title: 'Onboarding & Profile Setup' },
  { id: 3, path: 'dashboard', title: 'Home Dashboard' },
  { id: 4, path: 'mobility-score', title: 'Mobility Score (Vehicle Intelligence Index)' },
  { id: 5, path: 'driving-reports', title: 'Driving Reports (Weekly/Monthly)' },
  { id: 6, path: 'vehicle-details', title: 'Vehicle Details & Digital Twin View' },
  { id: 7, path: 'vehicle-health', title: 'Vehicle Health Breakdown' },
  { id: 8, path: 'service-history', title: 'Service History Timeline' },
  { id: 9, path: 'predictive-maintenance', title: 'Predictive Maintenance Alerts' },
  { id: 10, path: 'driving-analytics', title: 'Driving Analytics & Risk Exposure' },
  { id: 11, path: 'trip-history', title: 'Trip History & Trip Summary' },
  { id: 12, path: 'fuel-tracker', title: 'Fuel Efficiency & Carbon Tracker' },
  { id: 13, path: 'insurance-overview', title: 'Insurance Overview & Premium Calculator' },
  { id: 14, path: 'claims-upload', title: 'Claims Upload & AI Damage Assessment' },
  { id: 15, path: 'claim-status', title: 'Claim Status Tracker' },
  { id: 16, path: 'service-centers', title: 'Nearby Service Centers & Booking' },
  { id: 17, path: 'technician-profile', title: 'Technician Profile View' },
  { id: 18, path: 'live-repair', title: 'Live Repair Tracking' },
  { id: 19, path: 'parking', title: 'Parking Map & Booking' },
  { id: 20, path: 'ev-charging', title: 'EV Charging Booking & Usage Analytics' },
  { id: 21, path: 'emergency', title: 'Emergency & Accident Detection' },
  { id: 22, path: 'roadside', title: 'Roadside Assistance' },
  { id: 23, path: 'resale', title: 'Resale Value Estimator' },
  { id: 24, path: 'loan-calculator', title: 'Loan & EMI Calculator' },
  { id: 25, path: 'marketplace', title: 'Marketplace' },
  { id: 26, path: 'settings', title: 'Settings & Privacy Controls' },
]

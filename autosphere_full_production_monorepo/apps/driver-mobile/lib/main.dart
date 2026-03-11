import 'package:flutter/material.dart';
import 'features/ai_assistant_screen.dart';
import 'features/biometric_screen.dart';
import 'features/claim_status_screen.dart';
import 'features/claim_upload_screen.dart';
import 'features/dashboard_screen.dart';
import 'features/driving_analytics_screen.dart';
import 'features/emergency_screen.dart';
import 'features/ev_charging_screen.dart';
import 'features/fuel_tracker_screen.dart';
import 'features/insurance_overview_screen.dart';
import 'features/live_repair_screen.dart';
import 'features/loan_calculator_screen.dart';
import 'features/login_screen.dart';
import 'features/marketplace_screen.dart';
import 'features/mobility_score_screen.dart';
import 'features/otp_screen.dart';
import 'features/parking_screen.dart';
import 'features/predictive_maintenance_screen.dart';
import 'features/privacy_screen.dart';
import 'features/resale_screen.dart';
import 'features/roadside_screen.dart';
import 'features/service_booking_screen.dart';
import 'features/service_history_screen.dart';
import 'features/settings_screen.dart';
import 'features/signup_screen.dart';
import 'features/splash_screen.dart';
import 'features/technician_profile_screen.dart';
import 'features/trip_history_screen.dart';
import 'features/vehicle_details_screen.dart';
import 'features/vehicle_health_screen.dart';

void main() {
  runApp(const DriverMobileApp());
}

class DriverMobileApp extends StatelessWidget {
  const DriverMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'AutoSphere AI Driver',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      initialRoute: '/splash',
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/signup': (context) => const SignupScreen(),
        '/otp': (context) => const OtpScreen(),
        '/biometric': (context) => const BiometricScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/mobility_score': (context) => const MobilityScoreScreen(),
        '/driving_analytics': (context) => const DrivingAnalyticsScreen(),
        '/vehicle_details': (context) => const VehicleDetailsScreen(),
        '/vehicle_health': (context) => const VehicleHealthScreen(),
        '/service_history': (context) => const ServiceHistoryScreen(),
        '/predictive_maintenance': (context) => const PredictiveMaintenanceScreen(),
        '/trip_history': (context) => const TripHistoryScreen(),
        '/fuel_tracker': (context) => const FuelTrackerScreen(),
        '/insurance_overview': (context) => const InsuranceOverviewScreen(),
        '/claim_upload': (context) => const ClaimUploadScreen(),
        '/claim_status': (context) => const ClaimStatusScreen(),
        '/service_booking': (context) => const ServiceBookingScreen(),
        '/technician_profile': (context) => const TechnicianProfileScreen(),
        '/live_repair': (context) => const LiveRepairScreen(),
        '/parking': (context) => const ParkingScreen(),
        '/ev_charging': (context) => const EvChargingScreen(),
        '/emergency': (context) => const EmergencyScreen(),
        '/roadside': (context) => const RoadsideScreen(),
        '/resale': (context) => const ResaleScreen(),
        '/loan_calculator': (context) => const LoanCalculatorScreen(),
        '/marketplace': (context) => const MarketplaceScreen(),
        '/ai_assistant': (context) => const AiAssistantScreen(),
        '/settings': (context) => const SettingsScreen(),
        '/privacy': (context) => const PrivacyScreen(),
      },
    );
  }
}

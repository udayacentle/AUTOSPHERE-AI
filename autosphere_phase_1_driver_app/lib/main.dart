
import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/splash_screen.dart';
import 'features/dashboard/home_dashboard.dart';
import 'features/vehicle/vehicle_details_screen.dart';

void main() {
  runApp(const AutoSphereApp());
}

class AutoSphereApp extends StatelessWidget {
  const AutoSphereApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'AutoSphere AI',
      theme: AppTheme.lightTheme,
      initialRoute: '/',
      routes: {
        '/': (context) => SplashScreen(),
        '/dashboard': (context) => HomeDashboard(),
        '/vehicle-details': (context) => VehicleDetailsScreen(),
      },
    );
  }
}

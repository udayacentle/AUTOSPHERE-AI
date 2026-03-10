
import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/login_screen.dart';
import 'features/dashboard/home_dashboard.dart';

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
      initialRoute: '/login',
      routes: {
        '/login': (context) => LoginScreen(),
        '/dashboard': (context) => const HomeDashboard(),
      },
    );
  }
}

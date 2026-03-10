
import 'package:flutter/material.dart';

class FuelTrackerScreen extends StatelessWidget {
  const FuelTrackerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Fuel Tracker")),
      body: const Center(child: Text("Production Screen - fuel_tracker")),
    );
  }
}

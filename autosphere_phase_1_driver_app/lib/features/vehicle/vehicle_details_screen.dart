
import 'package:flutter/material.dart';

class VehicleDetailsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Vehicle Digital Twin")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: const [
            Text("Engine Health: 92%"),
            Text("Battery Health: 88%"),
            Text("Brake Pads: 76%"),
          ],
        ),
      ),
    );
  }
}

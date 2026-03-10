
import 'package:flutter/material.dart';

class HomeDashboard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Dashboard")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Card(
              child: ListTile(
                title: const Text("Mobility Score"),
                subtitle: const Text("872 / 1000"),
              ),
            ),
            Card(
              child: ListTile(
                title: const Text("Vehicle Details"),
                onTap: () => Navigator.pushNamed(context, '/vehicle-details'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

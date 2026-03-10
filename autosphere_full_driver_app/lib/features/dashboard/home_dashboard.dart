
import 'package:flutter/material.dart';
import '../../core/network/api_service.dart';

class HomeDashboard extends StatefulWidget {
  const HomeDashboard({super.key});

  @override
  State<HomeDashboard> createState() => _HomeDashboardState();
}

class _HomeDashboardState extends State<HomeDashboard> {
  final ApiService api = ApiService();
  int mobilityScore = 0;

  @override
  void initState() {
    super.initState();
    loadData();
  }

  void loadData() async {
    try {
      final data = await api.get("vehicles/1");
      setState(() {
        mobilityScore = data["mobilityScore"] ?? 850;
      });
    } catch (e) {
      mobilityScore = 850;
    }
  }

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
                subtitle: Text("$mobilityScore / 1000"),
              ),
            ),
            Card(
              child: ListTile(
                title: const Text("AI Risk Prediction"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

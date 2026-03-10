
import 'package:flutter/material.dart';
import '../../core/network/api_service.dart';

class LoginScreen extends StatelessWidget {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final ApiService api = ApiService();

  LoginScreen({super.key});

  void login(BuildContext context) async {
    await api.post("auth/login", {
      "email": emailController.text,
      "password": passwordController.text,
    });
    Navigator.pushReplacementNamed(context, '/dashboard');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("AutoSphere AI", style: TextStyle(fontSize: 28)),
            TextField(controller: emailController, decoration: const InputDecoration(labelText: "Email")),
            TextField(controller: passwordController, decoration: const InputDecoration(labelText: "Password"), obscureText: true),
            const SizedBox(height: 20),
            ElevatedButton(onPressed: () => login(context), child: const Text("Login")),
          ],
        ),
      ),
    );
  }
}

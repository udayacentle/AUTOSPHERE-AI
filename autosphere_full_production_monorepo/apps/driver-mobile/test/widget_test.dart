// Basic Flutter widget test for AutoSphere Driver Mobile app.

import 'package:flutter_test/flutter_test.dart';

import 'package:driver_mobile/main.dart';

void main() {
  testWidgets('App starts with splash screen', (WidgetTester tester) async {
    await tester.pumpWidget(const DriverMobileApp());
    await tester.pumpAndSettle();

    expect(find.text('Splash'), findsOneWidget);
    expect(find.text('Production Screen - splash'), findsOneWidget);
  });
}


import '../../core/network/api_service.dart';

class AiService {
  final ApiService _api = ApiService();

  Future<dynamic> calculateRisk(List<double> features) async {
    return _api.post("ai/calculate-risk", {"features": features});
  }

  Future<dynamic> predictMaintenance(Map<String, dynamic> vehicleData) async {
    return _api.post("ai/predict-failure", vehicleData);
  }
}

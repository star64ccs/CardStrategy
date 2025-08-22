import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

class MonitoringService {
  async getDashboardData() {
    try {
      // 調用現有的API接口
      const [aiEcosystem, performance, cost] = await Promise.all([
        this.getAIEcosystemData(),
        this.getPerformanceData(),
        this.getCostData()
      ]);

      return {
        systemHealth: this.calculateSystemHealth(performance),
        monthlyCost: cost.monthlyCost,
        apiSuccessRate: aiEcosystem.successRate * 100,
        activeUsers: performance.activeUsers,
        costTrend: cost.trend,
        systemMetrics: performance.metrics
      };
    } catch (error) {
      console.error('獲取儀表板數據失敗:', error);
      throw error;
    }
  }

  async getAIEcosystemData() {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-ecosystem/stats`);
      return response.data;
    } catch (error) {
      console.error('獲取AI生態系統數據失敗:', error);
      return {
        successRate: 0,
        totalRequests: 0,
        monthlyCost: 0
      };
    }
  }

  async getPerformanceData() {
    try {
      const response = await axios.get(`${API_BASE_URL}/performance/metrics`);
      return response.data;
    } catch (error) {
      console.error('獲取性能數據失敗:', error);
      return {
        activeUsers: 0,
        metrics: {
          cpu: 0,
          memory: 0,
          disk: 0,
          network: 0
        }
      };
    }
  }

  async getCostData() {
    try {
      const response = await axios.get(`${API_BASE_URL}/cost/analysis`);
      return response.data;
    } catch (error) {
      console.error('獲取成本數據失敗:', error);
      return {
        monthlyCost: 0,
        trend: {
          labels: [],
          data: []
        }
      };
    }
  }

  calculateSystemHealth(performance) {
    const { cpu, memory, disk } = performance.metrics;
    const avgUsage = (cpu + memory + disk) / 3;
    return Math.max(0, 100 - avgUsage);
  }
}

export const monitoringService = new MonitoringService();

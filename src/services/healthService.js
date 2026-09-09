import { apiClient } from '@/api/client';

export const healthService = {
  async checkLiveness() {
    return apiClient('/health');
  },

  async checkReadiness() {
    return apiClient('/health/ready');
  },
};

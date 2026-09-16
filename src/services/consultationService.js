import { apiClient } from '@/api/client';

export const consultationService = {
  /**
   * Registers a new consultation request in CREATED status.
   * Includes X-Idempotency-Key header to prevent duplicate submissions.
   */
  async createConsultation(payload, idempotencyKey = null) {
    const headers = {};
    if (idempotencyKey) {
      headers['X-Idempotency-Key'] = idempotencyKey;
    }

    return apiClient('/consultations', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetches public consultation details and status by code.
   */
  async getConsultationByCode(code) {
    const cleanCode = encodeURIComponent(code.trim().toUpperCase());
    return apiClient(`/consultations/${cleanCode}`);
  },
};

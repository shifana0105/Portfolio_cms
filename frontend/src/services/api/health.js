import apiClient from './client';

export async function checkHealth() {
  const { data } = await apiClient.get('/health');
  return data;
}

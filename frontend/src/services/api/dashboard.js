import apiClient from './client';

export async function getDashboard() {
  const { data } = await apiClient.get('/dashboard');
  return data;
}

export async function getAnalytics() {
  const { data } = await apiClient.get('/dashboard/analytics');
  return data;
}

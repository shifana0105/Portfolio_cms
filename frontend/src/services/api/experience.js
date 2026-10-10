import apiClient from './client';

export async function getExperiences() {
  const { data } = await apiClient.get('/experience');
  return data;
}

export async function createExperience(expData) {
  const { data } = await apiClient.post('/experience', expData);
  return data;
}

export async function updateExperience(id, expData) {
  const { data } = await apiClient.put(`/experience/${id}`, expData);
  return data;
}

export async function deleteExperience(id) {
  await apiClient.delete(`/experience/${id}`);
}

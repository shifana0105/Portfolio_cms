import apiClient from './client';

export async function getEducation() {
  const { data } = await apiClient.get('/education');
  return data;
}

export async function createEducation(eduData) {
  const { data } = await apiClient.post('/education', eduData);
  return data;
}

export async function updateEducation(id, eduData) {
  const { data } = await apiClient.put(`/education/${id}`, eduData);
  return data;
}

export async function deleteEducation(id) {
  await apiClient.delete(`/education/${id}`);
}

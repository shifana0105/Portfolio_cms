import apiClient from './client';

export async function getResume() {
  const { data } = await apiClient.get('/resume');
  return data;
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteResume() {
  await apiClient.delete('/resume');
}

export async function downloadResume() {
  const response = await apiClient.get('/resume/download', {
    responseType: 'blob',
  });
  return response.data;
}

export function getResumeDownloadUrl() {
  return `${apiClient.defaults.baseURL}/resume/download`;
}

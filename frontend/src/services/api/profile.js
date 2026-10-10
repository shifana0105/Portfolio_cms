import apiClient from './client';

export async function getProfile() {
  const { data } = await apiClient.get('/profile');
  return data;
}

export async function checkProfileExists() {
  const { data } = await apiClient.get('/profile/exists');
  return data.exists;
}

export async function saveProfile(profileData) {
  const { data } = await apiClient.put('/profile', profileData);
  return data;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

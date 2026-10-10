import apiClient from './client';

export async function getProjects() {
  const { data } = await apiClient.get('/projects');
  return data;
}

export async function getProject(id) {
  const { data } = await apiClient.get(`/projects/${id}`);
  return data;
}

export async function createProject(projectData) {
  const { data } = await apiClient.post('/projects', projectData);
  return data;
}

export async function updateProject(id, projectData) {
  const { data } = await apiClient.put(`/projects/${id}`, projectData);
  return data;
}

export async function deleteProject(id) {
  await apiClient.delete(`/projects/${id}`);
}

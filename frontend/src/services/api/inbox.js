import apiClient from './client';

export async function getInbox() {
  const { data } = await apiClient.get('/inbox');
  return data;
}

export async function getMessage(id) {
  const { data } = await apiClient.get(`/inbox/${id}`);
  return data;
}

export async function markAsRead(id) {
  const { data } = await apiClient.patch(`/inbox/${id}/read`);
  return data;
}

export async function deleteMessage(id) {
  await apiClient.delete(`/inbox/${id}`);
}

export async function getUnreadCount() {
  const { data } = await apiClient.get('/inbox/unread-count');
  return data.count;
}

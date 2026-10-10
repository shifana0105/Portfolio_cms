import axios from 'axios';

const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

export async function getPublicPortfolio(username) {
  const { data } = await publicClient.get(`/public/${username}`);
  return data;
}

export async function sendContactMessage(username, messageData) {
  const { data } = await publicClient.post(`/public/${username}/contact`, messageData);
  return data;
}

export function getPublicResumeUrl(username) {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
  return `${baseURL}/public/${username}/resume`;
}

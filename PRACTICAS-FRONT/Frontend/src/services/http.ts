import axios from 'axios';

export const API_URL =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000';

const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default http;
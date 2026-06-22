import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ CHANGE THIS to the actual backend URL
const API_BASE_URL = 'http://127.0.0.1:8000'; // or http://10.0.2.2:8000 for Android emulator

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
})
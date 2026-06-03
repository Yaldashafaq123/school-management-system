// src/config/api.js
// Change from HTTP to HTTPS
export const BASE_URL = "https://asraschools.cloud/api";  // ✅ New HTTPS URL
// export const BASE_URL = "http://asraschools.cloud:3000/api";  // ❌ Old HTTP URL

import AsyncStorage from '@react-native-async-storage/async-storage';

export const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request timeout:', endpoint);
      throw new Error('درخواست زمان‌بر شد. لطفا اتصال اینترنت خود را بررسی کنید.');
    }
    console.error('API Request failed:', error);
    throw error;
  }
};
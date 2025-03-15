"use client";

import axios from "axios";
import config from "../config";
import { getToken } from "./auth";
import { create } from "zustand";

// loading state store
export const useLoadingStore = create((set) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading })
}));

const axiosInstance = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    useLoadingStore.getState().setIsLoading(true);

    // Add auth token
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    useLoadingStore.getState().setIsLoading(false);
    return Promise.reject(error);
  }
);

// response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    useLoadingStore.getState().setIsLoading(false);
    return response.data;
  },
  (error) => {
    useLoadingStore.getState().setIsLoading(false);
    return Promise.reject(error);
  }
);

const api = {
  get: async (endpoint) => {
    return axiosInstance.get(endpoint);
  },

  post: async (endpoint, data) => {
    return axiosInstance.post(endpoint, data);
  },

  put: async (endpoint, data) => {
    return axiosInstance.put(endpoint, data);
  },

  delete: async (endpoint) => {
    return axiosInstance.delete(endpoint);
  }
};

export default api;

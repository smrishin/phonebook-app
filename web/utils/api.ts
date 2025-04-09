"use client";

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse
} from "axios";
import config from "../config";
import { getToken } from "./auth";
import { create } from "zustand";

// loading state store
interface LoadingState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading })
}));

const axiosInstance: AxiosInstance = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    useLoadingStore.getState().setIsLoading(true);

    // Add auth token
    const token = getToken();
    if (token && config.headers) {
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
  (response: AxiosResponse) => {
    useLoadingStore.getState().setIsLoading(false);
    return response.data;
  },
  (error) => {
    useLoadingStore.getState().setIsLoading(false);
    return Promise.reject(error);
  }
);

interface Api {
  get: <T>(endpoint: string) => Promise<T>;
  post: <T>(endpoint: string, data: any) => Promise<T>;
  put: <T>(endpoint: string, data: any) => Promise<T>;
  delete: <T>(endpoint: string) => Promise<T>;
}

const api: Api = {
  get: async <T>(endpoint: string): Promise<T> => {
    return axiosInstance.get(endpoint);
  },

  post: async <T>(endpoint: string, data: any): Promise<T> => {
    return axiosInstance.post(endpoint, data);
  },

  put: async <T>(endpoint: string, data: any): Promise<T> => {
    return axiosInstance.put(endpoint, data);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    return axiosInstance.delete(endpoint);
  }
};

export default api;

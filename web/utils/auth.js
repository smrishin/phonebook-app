"use client";

import api from "./api";

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return token && user;
};

export const login = async (email) => {
  try {
    const data = await api.get(`/users/${email}`);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getToken = () => {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

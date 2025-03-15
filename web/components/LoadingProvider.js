"use client";

import { LoadingSpinner } from "./LoadingSpinner";
import { useLoadingStore } from "../utils/api";

export default function LoadingProvider({ children }) {
  const isLoading = useLoadingStore((state) => state.isLoading);

  return (
    <>
      {children}
      {isLoading && <LoadingSpinner />}
    </>
  );
}

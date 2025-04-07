"use client";

import { useRouter } from "next/navigation";
import { login } from "../utils/auth";
import { useForm } from "react-hook-form";
import { useAuth } from "../components/AuthWrapper";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [error, setError] = useState("");
  const {
    register: connectField,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setError("");
      const response = await login(data.email);
      setAuth(true);
      router.push("/contacts");
    } catch (err) {
      if (err.status === 404) {
        err.message = "User not found. Please reach out to the admin.";
      }
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen pb-75">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-80">
        <div>
          <input
            className={`border p-2 w-full rounded ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            type="email"
            placeholder="Enter Email"
            {...connectField("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <button
          className="bg-[#ff4d4d] hover:bg-[#cc3d3d] transition-colors text-white px-4 py-2 rounded w-full disabled:opacity-50"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

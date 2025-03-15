"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { getUser } from "../../../utils/auth";
import api from "../../../utils/api";

export default function NewContactPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: ""
    }
  });

  const onSubmit = async (data) => {
    try {
      const user = getUser();
      await api.post(`/contacts/${user.user_id}`, data);
      router.push("/contacts");
      router.refresh();
    } catch (err) {
      console.error("Failed to create contact:", err);
      const errorMessage =
        err.response?.data?.error ||
        "Failed to create contact. Please try again.";
      setError("root", {
        type: "server",
        message: errorMessage
      });
    }
  };

  return (
    <div className="container mx-auto mt-14 p-4 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Contact</h1>
        <Link
          href="/contacts"
          className="text-gray-200 hover:text-gray-300 transition-colors underline"
        >
          ← Back to Contacts
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errors.root && (
          <div className="bg-rose-200 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {errors.root.message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-200 mb-3"
            >
              First Name
            </label>
            <input
              {...register("first_name", {
                required: "First name is required",
                onChange: () => clearErrors("root")
              })}
              type="text"
              id="first_name"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.first_name ? "border-red-500" : ""
              }`}
              placeholder="Enter first name"
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.first_name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-gray-200 mb-3"
            >
              Last Name
            </label>
            <input
              {...register("last_name", {
                required: "Last name is required",
                onChange: () => clearErrors("root")
              })}
              type="text"
              id="last_name"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.last_name ? "border-red-500" : ""
              }`}
              placeholder="Enter last name"
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.last_name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-200 mb-3"
            >
              Email
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address"
                },
                onChange: () => clearErrors("root")
              })}
              type="email"
              id="email"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-200 mb-3"
            >
              Phone
            </label>
            <input
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^\+?[\d\s-]{10,}$/,
                  message: "Please enter a valid phone number"
                },
                onChange: () => clearErrors("root")
              })}
              type="tel"
              id="phone"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.phone ? "border-red-500" : ""
              }`}
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/contacts"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-200 hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-800 transition-colors
              ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Creating..." : "Create Contact"}
          </button>
        </div>
      </form>
    </div>
  );
}

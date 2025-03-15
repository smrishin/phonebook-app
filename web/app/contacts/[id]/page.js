"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, memo, useCallback } from "react";
import api from "../../../utils/api";
import { getUser } from "../../../utils/auth";
import React from "react";
import { socketService } from "../../../utils/socket";
import { useForm } from "react-hook-form";

const EditForm = memo(({ contact, onSubmit, onCancel, error }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors
  } = useForm({
    defaultValues: {
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-rose-200 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm text-gray-100">First Name</label>
        <input
          {...register("first_name", {
            required: "First name is required",
            onChange: () => clearErrors("root")
          })}
          type="text"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.first_name ? "border-red-500" : ""
          }`}
        />
        {errors.first_name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.first_name.message}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gray-100">Last Name</label>
        <input
          {...register("last_name", {
            required: "Last name is required",
            onChange: () => clearErrors("root")
          })}
          type="text"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.last_name ? "border-red-500" : ""
          }`}
        />
        {errors.last_name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.last_name.message}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gray-100">Email</label>
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
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.email ? "border-red-500" : ""
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gray-100">Phone</label>
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
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.phone ? "border-red-500" : ""
          }`}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>
      <div className="mt-6 flex space-x-4">
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
});

EditForm.displayName = "EditForm";

export default function ContactDetailPage({ params }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [contact, setContact] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState(null);
  const [showEditHistory, setShowEditHistory] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const user = getUser();
        if (!user) {
          router.push("/");
          return;
        }

        const data = await api.get(`/contacts/${user.user_id}/${id}`);
        setContact(data);
        setEditedContact({ ...data });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchContact();
  }, [id, router]);

  useEffect(() => {
    if (!contact || isEditing) return;

    const handleContactUpdate = (updatedContact) => {
      if (
        updatedContact.contact_id === id &&
        updatedContact.user_id === contact.user_id
      ) {
        if (updatedContact.action === "delete") {
          router.push("/contacts");
        } else if (updatedContact.action === "update") {
          setContact((prev) => ({
            ...prev,
            ...updatedContact
          }));
          setEditedContact((prev) => ({
            ...prev,
            ...updatedContact
          }));
        }
      }
    };

    socketService.connect();
    const unsubscribe = socketService.subscribe(handleContactUpdate);

    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, [id, contact?.user_id, isEditing, router]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    try {
      const user = getUser();
      if (!user) {
        router.push("/");
        return;
      }

      await api.delete(`/contacts/${user.user_id}/${id}`);
      router.push("/contacts");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditedContact((prev) => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback(
    async (data) => {
      try {
        const user = getUser();
        if (!user) {
          router.push("/");
          return;
        }

        if (JSON.stringify(data) === JSON.stringify(contact)) {
          setIsEditing(false);
          return;
        }

        await api.put(`/contacts/${user.user_id}/${id}`, data);

        const currentTime = Date.now() / 1000;
        const changes = {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          email: data.email
        };

        setContact((prevContact) => ({
          ...data,
          contact_id: prevContact.contact_id,
          user_id: prevContact.user_id,
          edit_history: {
            ...prevContact.edit_history,
            [currentTime]: changes
          }
        }));

        setIsEditing(false);
        setError(null);
      } catch (err) {
        console.error("Failed to update contact:", err);
        const errorMessage =
          err.response?.data?.error ||
          "Failed to update contact. Please try again.";
        setError(errorMessage);
      }
    },
    [contact, id, router]
  );

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditedContact({ ...contact });
    setError(null);
  }, [contact]);

  if (!contact) {
    return (
      <div className="container mx-auto mt-14 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Contact Not Found</h1>
          <Link href="/contacts" className="text-blue-500 hover:underline">
            Back to Contacts
          </Link>
        </div>
      </div>
    );
  }

  const ReadOnlyView = () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-6">
        {contact.first_name} {contact.last_name}
      </h1>
      <div>
        <label className="text-sm text-gray-100">Phone</label>
        <p className="font-medium">{contact.phone}</p>
      </div>
      <div>
        <label className="text-sm text-gray-100">Email</label>
        <p className="font-medium">{contact.email}</p>
      </div>
      <div className="mt-6 flex space-x-4">
        <button
          onClick={handleEdit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
        <button
          onClick={() => setShowEditHistory(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Edit History
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto mt-14 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/contacts"
            className="text-blue-500 hover:underline flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Back to Contacts
          </Link>
        </div>

        {!showEditHistory ? (
          <div className="bg-gray-500 shadow rounded-lg p-6">
            {isEditing ? (
              <EditForm
                contact={editedContact}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                error={error}
              />
            ) : (
              <ReadOnlyView />
            )}
          </div>
        ) : (
          <div className="bg-gray-500 shadow rounded-lg mt-10 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit History</h2>
              <button
                onClick={() => setShowEditHistory(false)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Back
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(contact.edit_history || {})
                    .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                    .map(([timestamp, changes]) => (
                      <tr key={timestamp}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                          {new Date(
                            parseInt(timestamp) * 1000
                          ).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-200">
                          <ul className="list-disc list-inside">
                            {Object.entries(changes).map(([field, value]) => (
                              <li key={field}>
                                {field
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                                : {value}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

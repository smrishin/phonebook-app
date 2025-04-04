"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser } from "../../utils/auth";
import api from "../../utils/api";
import { socketService } from "../../utils/socket";

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const user = getUser();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await api.get(`/contacts/${user.user_id}`);
        setContacts(data);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      }
    };

    fetchContacts();
  }, []);

  useEffect(() => {
    // Connect to WebSocket
    socketService.connect();

    // Subscribe to contact updates
    const unsubscribe = socketService.subscribe((updatedContact) => {
      if (!user) return;

      // Only process updates for the current user
      if (updatedContact.user_id === user.user_id) {
        if (updatedContact.action === "delete") {
          setContacts((prev) =>
            prev.filter((c) => c.contact_id !== updatedContact.contact_id)
          );
        } else {
          setContacts((prev) => {
            const index = prev.findIndex(
              (c) => c.contact_id === updatedContact.contact_id
            );
            const contactData = {
              contact_id: updatedContact.contact_id,
              first_name: updatedContact.first_name,
              last_name: updatedContact.last_name
            };

            if (index === -1 && updatedContact.action === "create") {
              return [...prev, contactData];
            } else if (index !== -1 && updatedContact.action === "update") {
              const newContacts = [...prev];
              newContacts[index] = contactData;
              return newContacts;
            }
            return prev;
          });
        }
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, [user]);

  // Sort contacts by firstName, then by lastName
  const sortedContacts = [...contacts].sort((a, b) => {
    // First compare first names
    const firstNameComparison = a.first_name.localeCompare(b.first_name);
    // If first names are the same, compare last names
    if (firstNameComparison === 0) {
      return a.last_name.localeCompare(b.last_name);
    }
    return firstNameComparison;
  });

  // Get unique first letters from contacts
  const alphabet = Array.from(
    new Set(
      sortedContacts.map((contact) => contact.first_name[0].toUpperCase())
    )
  ).sort();

  const scrollToLetter = (letter) => {
    const element = document.getElementById(`section-${letter}`);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Group contacts by first letter
  const contactsByLetter = {};
  sortedContacts.forEach((contact) => {
    const letter = contact.first_name[0].toUpperCase();
    if (!contactsByLetter[letter]) {
      contactsByLetter[letter] = [];
    }
    contactsByLetter[letter].push(contact);
  });

  return (
    <div className="container mx-auto mt-14 p-4 flex">
      {/* Alphabet sidebar */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-1 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-4 shadow-lg mr-10">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => scrollToLetter(letter)}
            className="text-sm font-medium text-gray-600 hover:text-blue-500 transition-colors w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Contacts list */}
      <div className="flex-1 pl-16 pr-28">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Contacts</h1>
          <Link
            href="/contacts/new"
            className="bg-rose-500 hover:bg-rose-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Contact
          </Link>
        </div>

        <div className="grid gap-4">
          {alphabet.map((letter) => (
            <div key={letter} id={`section-${letter}`} className="pt-4">
              <div className="text-lg font-bold text-white/80 mb-2 sticky top-4 py-2 z-10">
                {letter}
              </div>
              {contactsByLetter[letter].map((contact) => (
                <Link
                  href={`/contacts/${contact.contact_id}`}
                  key={contact.contact_id}
                  className="p-4 border rounded-lg hover:bg-gray-500 transition-colors cursor-pointer flex justify-between items-center mb-2"
                >
                  <div>
                    <span className="font-medium">
                      {contact.first_name} {contact.last_name}
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

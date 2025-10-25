"use client";

import { useState, useEffect } from "react";
import api from "../../utils/axiosInstance";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(""); // store string directly
  const [creatorId, setCreatorId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const me = localStorage.getItem("user");
    if (me) {
      try {
        setCreatorId(JSON.parse(me).id);
      } catch {
        setCreatorId(null);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!creatorId) {
      alert("Please login to create an event.");
      router.push("/login");
      return;
    }

    if (!title.trim() || !description.trim() || !location.trim() || !date) {
      alert("Please fill all fields");
      return;
    }

    try {
      // Send the date string directly (not ISO)
      await api.post("/events", {
        title,
        description,
        location,
        date, // <--- send raw string like "2025-10-24T18:30"
        creatorId,
      });

      alert("Event created successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to create event", err);
      alert("Failed to create event");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex justify-center mt-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4"
        >
          <h2 className="text-xl font-bold">Create Event</h2>

          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="w-full p-2 border rounded"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />

          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          {/* Date & Time picker */}
          <input
            type="datetime-local"
            className="w-full p-2 border rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}

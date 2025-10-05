"use client";

import { useState } from "react";
import api from "../../utils/axiosInstance";
import Navbar from "../../components/Navbar";

export default function CreateEventPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const creatorId = 1; // Replace with logged-in user
    await api.post("/events", { title, description, location, date, creatorId });
    alert("Event created!");
    window.location.href = "/dashboard";
  };

  return (
    <div>
      <Navbar />
      <div className="flex justify-center mt-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md w-96 space-y-4"
        >
          <h2 className="text-xl font-bold">Create Event</h2>
          <input
            className="w-full p-2 border rounded"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Create
          </button>
        </form>
      </div>
    </div>
  );
}

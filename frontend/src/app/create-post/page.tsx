"use client";

import { useState } from "react";
import api from "../../utils/axiosInstance";
import Navbar from "../../components/Navbar";

export default function CreatePostPage() {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = 1; // Replace with logged-in user
    await api.post("/posts", { content, media, userId });
    alert("Post created!");
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
          <h2 className="text-xl font-bold">Create Post</h2>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Image URL (optional)"
            value={media}
            onChange={(e) => setMedia(e.target.value)}
          />
          <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Post
          </button>
        </form>
      </div>
    </div>
  );
}

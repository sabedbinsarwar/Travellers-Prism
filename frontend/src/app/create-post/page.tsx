"use client";

import { useState } from "react";
import { X } from "lucide-react";
import api from "../../utils/axiosInstance";

export default function CreatePostPage() {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);

  const handleMediaSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setMediaFiles((prev) => [...prev, ...newFiles]);
    setMediaPreview((prev) => [
      ...prev,
      ...newFiles.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return alert("Add content or media!");

    const formData = new FormData();
    formData.append("content", content);
    mediaFiles.forEach((file) => formData.append("files", file));

    try {
      const userId = 1; // replace with logged-in user
      formData.append("userId", String(userId));
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Post created!");
      setContent("");
      setMediaFiles([]);
      setMediaPreview([]);
    } catch (err) {
      console.error(err);
      alert("Failed to create post.");
    }
  };

  return (
    <div className="flex justify-center mt-10">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded shadow-md w-96 space-y-4 text-white"
      >
        <h2 className="text-xl font-bold">Create Post</h2>
        <textarea
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
       <div className="flex gap-2">
  <label className="flex-1 bg-gray-800 p-2 rounded text-center cursor-pointer hover:bg-gray-700">
    Select Photos
    <input
      type="file"
      multiple
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);

        // prevent duplicates
        const filtered = newFiles.filter(
          (f) => !mediaFiles.some((mf) => mf.name === f.name && mf.size === f.size)
        );

        setMediaFiles((prev) => [...prev, ...filtered]);
        setMediaPreview((prev) => [
          ...prev,
          ...filtered.map((f) => URL.createObjectURL(f)),
        ]);

        // reset input so same files can be selected again
        e.target.value = "";
      }}
    />
  </label>
  <button
    type="submit"
    className="bg-emerald-600 px-4 py-2 rounded hover:bg-emerald-700"
  >
    Post
  </button>
</div>

{/* Media Preview */}
{mediaPreview.length > 0 && (
  <div className="grid grid-cols-2 gap-2 mt-2">
    {mediaPreview.map((src, index) => (
      <div key={index} className="relative group rounded overflow-hidden">
        <img
          src={src}
          className="w-full h-32 object-cover rounded"
          alt={`preview-${index}`}
        />
        <button
          type="button"
          onClick={() => {
            setMediaFiles((prev) => prev.filter((_, i) => i !== index));
            setMediaPreview((prev) => prev.filter((_, i) => i !== index));
          }}
          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:scale-110 transition"
        >
          <X size={16} />
        </button>
      </div>
    ))}
  </div>
)}

      </form>
    </div>
  );
}

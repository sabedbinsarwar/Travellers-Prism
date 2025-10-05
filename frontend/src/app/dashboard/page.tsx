"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../utils/axiosInstance";
import PostCard from "../../components/PostCard";
import EventCard from "../../components/EventCard";
import {
  Image,
  Video,
  Calendar,
  User,
  Users,
  MapPin,
  Archive,
  LogOut,
} from "lucide-react";

export default function DashboardPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postVideo, setPostVideo] = useState<File | null>(null);
  const [newEvent, setNewEvent] = useState("");
  const router = useRouter();

  // Get logged-in user from localStorage
  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = loggedUser?.id;

  useEffect(() => {
    api.get("/posts").then((res) => setPosts(res.data));
    api.get("/events").then((res) => setEvents(res.data));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/"); // redirect to index
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !postImage && !postVideo) return;

    const formData = new FormData();
    formData.append("content", newPost);
    if (postImage) formData.append("image", postImage);
    if (postVideo) formData.append("video", postVideo);

    const res = await api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setPosts([res.data, ...posts]);
    setNewPost("");
    setPostImage(null);
    setPostVideo(null);
  };

  const handleCreateEvent = async () => {
    if (!newEvent.trim()) return;
    const res = await api.post("/events", { title: newEvent });
    setEvents([res.data, ...events]);
    setNewEvent("");
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-800 shadow-md p-6 space-y-6 sticky top-0 h-screen">
        <div className="text-2xl font-semibold mb-6">Traveller’s Prism</div>
        <nav className="flex flex-col space-y-4">
          <a
            href={`/profile/${userId}`}
            className="flex items-center hover:bg-gray-700 rounded px-3 py-2 transition"
          >
            <User size={18} className="mr-2" /> Profile
          </a>
          <a
            href="/friends"
            className="flex items-center hover:bg-gray-700 rounded px-3 py-2 transition"
          >
            <Users size={18} className="mr-2" /> Friends
          </a>
          <a
            href="/events"
            className="flex items-center hover:bg-gray-700 rounded px-3 py-2 transition"
          >
            <Calendar size={18} className="mr-2" /> Events
          </a>
          <a
            href="/memories"
            className="flex items-center hover:bg-gray-700 rounded px-3 py-2 transition"
          >
            <Archive size={18} className="mr-2" /> Memories
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center hover:bg-gray-700 rounded px-3 py-2 transition text-left"
          >
            <LogOut size={18} className="mr-2" /> Logout
          </button>
        </nav>
      </aside>

      {/* Newsfeed */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Create Post Bar */}
        <section className="bg-gray-800 p-4 rounded-xl shadow-md space-y-3">
          <textarea
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={2}
          />

          {/* Upload / Post buttons */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center px-3 py-2 bg-gray-700 rounded-xl hover:bg-gray-600 cursor-pointer transition text-sm">
              <Image size={16} className="mr-1" /> Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setPostImage(e.target.files?.[0] || null)}
              />
            </label>

            <label className="flex items-center px-3 py-2 bg-gray-700 rounded-xl hover:bg-gray-600 cursor-pointer transition text-sm">
              <Video size={16} className="mr-1" /> Video
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setPostVideo(e.target.files?.[0] || null)}
              />
            </label>

            <button
              onClick={handleCreatePost}
              className="ml-auto px-4 py-2 bg-green-500 rounded-xl hover:bg-green-600 transition font-semibold text-sm"
            >
              Post
            </button>
          </div>

          {/* Small Create Event Inline Bar */}
          <div className="flex items-center mt-2 space-x-2 bg-gray-700 p-2 rounded-xl">
            <Calendar size={16} />
            <input
              className="flex-1 bg-gray-700 text-white placeholder-gray-400 outline-none px-2 py-1 rounded"
              placeholder="Create an event"
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
            />
            <button
              onClick={handleCreateEvent}
              className="px-3 py-1 bg-purple-500 rounded hover:bg-purple-600 text-sm font-semibold"
            >
              Create
            </button>
          </div>
        </section>

        {/* Posts Feed */}
        <section className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>

        {/* Events Feed */}
        <section className="space-y-4 mt-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      </main>
    </div>
  );
}

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
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [view, setView] = useState<"feed" | "events">("feed");

  const [newPost, setNewPost] = useState("");
  const [postImages, setPostImages] = useState<File[]>([]);
  const [postVideos, setPostVideos] = useState<File[]>([]);
  const [postImagesPreview, setPostImagesPreview] = useState<string[]>([]);
  const [postVideosPreview, setPostVideosPreview] = useState<string[]>([]);

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserId(JSON.parse(storedUser).id ?? null);
      } catch {
        setUserId(null);
      }
    }
  }, []);

  // Fetch posts and events on mount
  useEffect(() => {
    fetchPosts();
    fetchEvents();
  }, []);

  // Update feed whenever posts, events, or view changes
  useEffect(() => {
    if (view === "feed") {
      const combined = [
        ...posts.map((p) => ({ ...p, type: "post" })),
        ...events.map((e) => ({ ...e, type: "event" })),
      ].sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      );
      setFeed(combined);
    } else {
      const eventFeed = events
        .map((e) => ({ ...e, type: "event" }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setFeed(eventFeed);
    }
  }, [posts, events, view]);

  // API calls
  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  // Create Post
  const handleCreatePost = async () => {
    if (!userId) {
      alert("Please login to post.");
      router.push("/login");
      return;
    }
    if (!newPost.trim() && postImages.length === 0 && postVideos.length === 0) return;

    try {
      const formData = new FormData();
      formData.append("content", newPost);
      formData.append("userId", String(userId));
      postImages.forEach((file) => formData.append("files", file));
      postVideos.forEach((file) => formData.append("files", file));
      const res = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPosts((prev) => [res.data, ...prev]);
      setNewPost("");
      setPostImages([]);
      setPostVideos([]);
      setPostImagesPreview([]);
      setPostVideosPreview([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Create Event
  const handleCreateEvent = async () => {
    if (!newEventTitle.trim() || !newEventDate.trim()) {
      alert("Title and Date are required.");
      return;
    }
    if (!userId) {
      alert("Please login to create an event.");
      return;
    }

    try {
      const res = await api.post("/events", {
        title: newEventTitle,
        description: newEventDescription,
        location: newEventLocation,
        date: newEventDate,
        creatorId: userId,
      });
      setEvents((prev) => [res.data, ...prev]);
      setNewEventTitle("");
      setNewEventDescription("");
      setNewEventLocation("");
      setNewEventDate("");
    } catch (err) {
      console.error(err);
    }
  };

  // File selectors
  const onSelectImages = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setPostImages(arr);
    setPostImagesPreview(arr.map((f) => URL.createObjectURL(f)));
  };

  const onSelectVideos = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setPostVideos(arr);
    setPostVideosPreview(arr.map((f) => URL.createObjectURL(f)));
  };

  // Sidebar/Nav Links
  const NavLinks = () => (
    <nav className="flex flex-col gap-3 mt-4">
      <button
        onClick={() => router.push(`/profile/${userId}`)}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-800/50 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-500 hover:shadow-[0_0_15px_#00FFC6] transition-all duration-300"
      >
        <User size={20} className="text-emerald-300" />
        <span className="text-white font-medium tracking-wide">Profile</span>
      </button>

      <button
        onClick={() => setView("feed")}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
          view === "feed"
            ? "bg-gradient-to-r from-emerald-600 to-teal-500 shadow-[0_0_15px_#00FFC6]"
            : "bg-gray-800/50 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-500 hover:shadow-[0_0_15px_#00FFC6]"
        }`}
      >
        <Users size={20} className="text-emerald-300" />
        <span className="text-white font-medium tracking-wide">Feed</span>
      </button>

      <button
        onClick={() => setView("events")}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
          view === "events"
            ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_15px_#FFA500]"
            : "bg-gray-800/50 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:shadow-[0_0_15px_#FFA500]"
        }`}
      >
        <Calendar size={20} className="text-amber-300" />
        <span className="text-white font-medium tracking-wide">Events</span>
      </button>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-800/50 hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-500 hover:shadow-[0_0_15px_#FF3B3B] transition-all duration-300 text-red-400 font-medium"
      >
        <LogOut size={20} />
        Logout
      </button>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#050505] via-[#0d0d0d] to-[#000000] text-white font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-gradient-to-b from-gray-900/90 via-black/95 to-gray-950/95 shadow-2xl p-6 space-y-6 sticky top-0 h-screen rounded-r-3xl border-r border-gray-800/50 backdrop-blur-xl">
        <div className="flex items-center space-x-2">
          <img src="/logo3.png" alt="Traveller's Prism" className="w-16 h-16 object-contain" />
          <h1 className="text-xl font-extrabold text-white drop-shadow-[0_0_10px_#00FFC6]">
            Traveller’s <span className="text-yellow-300">Prism</span>
          </h1>
        </div>
        <NavLinks />
        <div className="mt-auto text-gray-500 text-xs text-center tracking-wide">
          &copy; 2025 Traveller’s Prism
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800 flex items-center justify-between px-5 py-3">
        <div className="flex items-center space-x-2">
          <img src="/logo3.png" alt="Traveller's Prism" className="w-10 h-10 object-contain" />
          <h1 className="text-xl font-bold text-white">
            Traveller’s <span className="text-yellow-300">Prism</span>
          </h1>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white focus:outline-none">
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <aside className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 via-black to-gray-950 shadow-2xl border-r border-gray-800/50 backdrop-blur-lg z-50 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-white drop-shadow-[0_0_10px_#00FFC6]">
              Traveller’s <span className="text-yellow-300">Prism</span>
            </h1>
            <button onClick={() => setMobileMenuOpen(false)}>
              <X size={26} className="text-gray-300" />
            </button>
          </div>
          <NavLinks />
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto max-w-5xl mx-auto mt-16 md:mt-0 scrollbar-thin scrollbar-thumb-emerald-600 scrollbar-track-gray-800/30">
        {/* Post Creator */}
        {view === "feed" && (
          <section className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/60 shadow-[0_0_25px_rgba(0,255,200,0.1)] hover:shadow-[0_0_35px_rgba(0,255,200,0.25)] transition-all duration-300">
            <textarea
              className="w-full p-4 rounded-xl bg-gray-900/70 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm placeholder-gray-400 resize-none"
              placeholder="Share your travel story..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={3}
            />
            <div className="flex items-center flex-wrap gap-3 mt-3">
              <label className="flex items-center px-4 py-2 bg-gray-800/80 rounded-lg hover:bg-emerald-600/30 cursor-pointer transition-all text-sm font-medium">
                <Image size={16} className="mr-2" /> Photos
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  multiple
                  onChange={(e) => onSelectImages(e.target.files)}
                />
              </label>
              <label className="flex items-center px-4 py-2 bg-gray-800/80 rounded-lg hover:bg-emerald-600/30 cursor-pointer transition-all text-sm font-medium">
                <Video size={16} className="mr-2" /> Videos
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  multiple
                  onChange={(e) => onSelectVideos(e.target.files)}
                />
              </label>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.trim() && postImages.length === 0 && postVideos.length === 0}
                className="ml-auto px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white font-semibold shadow-[0_0_10px_#00FFC6] hover:shadow-[0_0_20px_#00FFC6] hover:scale-105 transition-transform disabled:opacity-50"
              >
                Post
              </button>
            </div>

            {(postImagesPreview.length > 0 || postVideosPreview.length > 0) && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {postImagesPreview.map((src, idx) => (
                  <img
                    key={`img-${idx}`}
                    src={src}
                    className="w-full rounded-lg max-h-80 object-cover border border-gray-700 hover:scale-[1.02] transition-transform"
                  />
                ))}
                {postVideosPreview.map((src, idx) => (
                  <video
                    key={`vid-${idx}`}
                    controls
                    className="w-full rounded-lg max-h-[420px] border border-gray-700 hover:scale-[1.02] transition-transform"
                  >
                    <source src={src} />
                  </video>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Event Creator */}
        {view === "events" && (
          <section className="bg-black/40 backdrop-blur-xl p-5 rounded-2xl border border-gray-700/60 shadow-[0_0_25px_rgba(255,200,0,0.1)] hover:shadow-[0_0_35px_rgba(255,200,0,0.25)] transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Title"
                className="w-full p-3 rounded-lg bg-gray-900/80 border border-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-500 text-sm outline-none transition"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Location"
                className="w-full p-3 rounded-lg bg-gray-900/80 border border-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-500 text-sm outline-none transition"
                value={newEventLocation}
                onChange={(e) => setNewEventLocation(e.target.value)}
              />
              <input
                type="datetime-local"
                className="w-full p-3 rounded-lg bg-gray-900/80 border border-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-500 text-sm outline-none transition"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
              />
            </div>
            <textarea
              placeholder="Description"
              className="w-full mt-3 p-3 rounded-lg bg-gray-900/80 border border-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-500 text-sm outline-none resize-none transition h-20"
              value={newEventDescription}
              onChange={(e) => setNewEventDescription(e.target.value)}
            />
            <button
              onClick={handleCreateEvent}
              className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-sm font-semibold hover:scale-105 shadow-[0_0_15px_#FFA500] transition-transform"
            >
              Create Event
            </button>
          </section>
        )}

        {/* Feed */}
        <section className="space-y-5">
          {feed.length === 0 ? (
            <div className="text-gray-500 text-center italic py-10">
              {view === "feed" ? "No stories or events yet 🌍" : "No events yet 🗓️"}
            </div>
          ) : (
            feed.map((item) =>
              item.type === "post" ? (
                <PostCard key={`post-${item.id}`} post={item} currentUserId={String(userId)} />
              ) : (
                <EventCard
  key={`event-${item.id}`}
  event={item}
  currentUserId={userId}
  onUpdate={(updated) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }}
  onDelete={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
/>

              )
            )
          )}
        </section>
      </main>
    </div>
  );
}

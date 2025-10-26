"use client";
import { X } from "lucide-react";


import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "../../../utils/axiosInstance";
import { Camera, Image, Video } from "lucide-react";
import PostCard from "../../../components/PostCard";
import EventCard from "../../../components/EventCard";

const getFileUrl = (file: string | undefined, type: "image" | "video") => {
  if (!file) return type === "image" ? "/default-image.png" : "";
  return file.startsWith("http") ? file : `http://localhost:5000/uploads/${file}`;
};

export default function ProfilePage() {
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [newProfilePicPreview, setNewProfilePicPreview] = useState<string | null>(null);
  const [newCoverPic, setNewCoverPic] = useState<File | null>(null);
  const [newCoverPicPreview, setNewCoverPicPreview] = useState<string | null>(null);
  const [newBio, setNewBio] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const [newPost, setNewPost] = useState("");
  const [postImages, setPostImages] = useState<File[]>([]);
  const [postImagesPreview, setPostImagesPreview] = useState<string[]>([]);
  const [postVideos, setPostVideos] = useState<File[]>([]);
  const [postVideosPreview, setPostVideosPreview] = useState<string[]>([]);

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setCurrentUserId(JSON.parse(storedUser).id?.toString());
    }
  }, []);

  useEffect(() => {
    if (!userId || isNaN(Number(userId))) {
      setError("Invalid user ID.");
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [userRes, postsRes, eventsRes] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get(`/posts?userId=${userId}`),
          api.get(`/events?userId=${userId}`),
        ]);
        setUser(userRes.data);
        setNewBio(userRes.data.bio || "");
        setNewLocation(userRes.data.location || "");
        setPosts(postsRes.data);
        setEvents(eventsRes.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    return () => {
      postImagesPreview.forEach((url) => URL.revokeObjectURL(url));
      postVideosPreview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [postImagesPreview, postVideosPreview]);

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      if (newProfilePic) formData.append("profilePic", newProfilePic);
      if (newCoverPic) formData.append("coverPic", newCoverPic);
      formData.append("bio", newBio);
      formData.append("location", newLocation);

      const res = await api.put(`/users/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data);
      setEditMode(false);
    } catch (err: any) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && postImages.length === 0 && postVideos.length === 0) return;
    try {
      const formData = new FormData();
      formData.append("content", newPost);
      formData.append("userId", currentUserId || "");
      postImages.forEach((file) => formData.append("files", file));
      postVideos.forEach((file) => formData.append("files", file));

      const res = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newPostWithUrls = {
        ...res.data,
        images: res.data.images?.map((img: string) => getFileUrl(img, "image")) || [],
        videos: res.data.videos?.map((vid: string) => getFileUrl(vid, "video")) || [],
      };
      setPosts([newPostWithUrls, ...posts]);
      setNewPost("");
      setPostImages([]);
      setPostImagesPreview([]);
      setPostVideos([]);
      setPostVideosPreview([]);
    } catch (err: any) {
      console.error(err);
      alert("Failed to create post.");
    }
  };

  const handleCreateEvent = async () => {
    if (!newEventTitle.trim() || !newEventDate.trim()) {
      alert("Title and Date are required for an event.");
      return;
    }
    if (!currentUserId) {
      alert("Please login to create an event.");
      return;
    }
    try {
      const res = await api.post("/events", {
        title: newEventTitle,
        description: newEventDescription,
        location: newEventLocation,
        date: newEventDate,
        creatorId: Number(currentUserId),
      });
      setEvents([res.data, ...events]);
      setNewEventTitle("");
      setNewEventDescription("");
      setNewEventLocation("");
      setNewEventDate("");
    } catch (err: any) {
      console.error(err);
      alert("Failed to create event.");
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!currentUserId) {
      alert("You must be logged in to delete events.");
      return;
    }
    try {
      await api.delete(`/events/${id}`, { params: { userId: currentUserId } });
      setEvents((prev) => prev.filter((e) => e.id !== id));
      
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete event.");
    }
  };

const onSelectImages = (files: FileList | null, inputElement?: HTMLInputElement) => {
  if (!files) return;
  const newFiles = Array.from(files);

  // Append new files to previous ones
  setPostImages((prev) => [...prev, ...newFiles]);
  setPostImagesPreview((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);

  // Reset input to allow selecting the same file again
  if (inputElement) inputElement.value = "";
};



  const onSelectVideos = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setPostVideos(arr);
    setPostVideosPreview(arr.map((f) => URL.createObjectURL(f)));
  };

  if (loading) return <p className="p-6 text-white">Loading profile...</p>;
  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="bg-gray-800 p-6 rounded-xl shadow-md text-white w-96 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white font-sans">
      {/* Cover */}
      <div className="relative w-full h-72 md:h-80 bg-gradient-to-r from-teal-800 to-emerald-700">
        <img
          src={newCoverPicPreview || getFileUrl(user.coverPic, "image")}
          className="w-full h-full object-cover opacity-70"
          alt="Cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {editMode && (
          <label className="absolute top-68 right-4 backdrop-blur-sm bg-black/40 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 text-sm hover:bg-emerald-700 transition-all">
            <Camera size={16} /> Change Cover
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setNewCoverPic(file);
                if (file) setNewCoverPicPreview(URL.createObjectURL(file));
              }}
            />
          </label>
        )}
        <div className="absolute -bottom-20 left-8 flex items-center">
          <div className="relative w-36 h-36 rounded-full border-emerald-500 border-[5px] shadow-xl overflow-hidden">
            <img
              src={newProfilePicPreview || getFileUrl(user.profilePic, "image")}
              className="w-full h-full object-cover"
              alt="Profile"
            />
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-black/70 p-1.5 rounded-full cursor-pointer hover:bg-emerald-600 transition">
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNewProfilePic(file);
                    if (file) setNewProfilePicPreview(URL.createObjectURL(file));
                  }}
                />
              </label>
            )}
          </div>
        </div>
        {!editMode && currentUserId === userId && (
          <button
            onClick={() => setEditMode(true)}
            className="absolute top-84 right-6 bg-gradient-to-r from-blue-500 to-teal-600 text-white font-semibold text-sm rounded-full px-5 py-2 shadow-lg shadow-emerald-500/40 hover:scale-105 hover:shadow-emerald-400/70 transition-all duration-300"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="mt-28 px-6 max-w-5xl mx-auto space-y-6">
        {editMode && (
          <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-emerald-800/40 space-y-3 shadow-lg">
            <input
              type="text"
              placeholder="Bio"
              className="w-full bg-gray-800/70 p-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
            />
            <input
              type="text"
              placeholder="Location"
              className="w-full bg-gray-800/70 p-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
            <button
              onClick={handleSaveProfile}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 rounded-lg hover:opacity-90 font-semibold transition-all shadow-md"
            >
              Save Changes
            </button>
          </div>
        )}

        <div className="text-center md:text-left">
          <h2 className="text-3xl font-extrabold tracking-wide text-emerald-400">{user.name}</h2>
          <p className="text-gray-400">{user.email}</p>
          {user.bio && <p className="mt-1 text-gray-300 italic">“{user.bio}”</p>}
          {user.location && (
            <p className="text-sm text-gray-400 mt-1 flex items-center justify-center md:justify-start gap-1">
              📍 {user.location}
            </p>
          )}
        </div>

         {/* Create Post + Event */}
        {currentUserId === userId && (
          <section className="space-y-6 mt-6">
            {/* Post */}
<div
  className="bg-black/40 backdrop-blur-lg p-6 rounded-3xl border border-gray-700/60 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/70 hover:border-emerald-500/80 hover:scale-[1.02] transition-all duration-300"
>
  <textarea
    className="w-full p-4 rounded-2xl bg-gray-800/80 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm placeholder-gray-400 resize-none"
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
    onChange={(e) => {
      const files = e.target.files;
      if (!files) return;
      const newFiles = Array.from(files);

      // Append new files to previous ones
      setPostImages((prev) => [...prev, ...newFiles]);
      setPostImagesPreview((prev) => [
        ...prev,
        ...newFiles.map((f) => URL.createObjectURL(f)),
      ]);

      // Reset input so same file can be selected again
      e.target.value = "";
    }}
  />
</label>


  <label className="flex items-center px-4 py-2 bg-gray-800/80 rounded-lg hover:bg-emerald-600/30 cursor-pointer transition-all text-sm font-medium">
    <Video size={16} className="mr-2" /> Videos
    <input
      type="file"
      accept="video/*"
      className="hidden"
      multiple
      onChange={(e) => {
        onSelectVideos(e.target.files);
        e.target.value = ""; // Reset
      }}
    />
  </label>





    <button
      onClick={handleCreatePost}
      disabled={!newPost.trim() && postImages.length === 0 && postVideos.length === 0}
      className="ml-auto px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-semibold hover:scale-105 transition-all shadow-lg shadow-emerald-500/40 hover:shadow-emerald-400/70 disabled:opacity-50"
    >
      Post
    </button>
  </div>

  {(postImagesPreview.length > 0 || postVideosPreview.length > 0) && (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {(postImagesPreview.length > 0 || postVideosPreview.length > 0) && (
  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
    {postImagesPreview.map((src, idx) => (
      <div key={`img-${idx}`} className="relative group rounded overflow-hidden">
        <img
          src={src}
          className="w-full rounded-xl max-h-80 object-cover border border-gray-700 shadow-md hover:scale-105 transition-transform"
          alt={`Preview ${idx + 1}`}
        />
        <button
          type="button"
          onClick={() => {
            setPostImages((prev) => prev.filter((_, i) => i !== idx));
            setPostImagesPreview((prev) => prev.filter((_, i) => i !== idx));
          }}
          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:scale-110 transition"
        >
          <X size={16} />
        </button>
      </div>
    ))}

    {postVideosPreview.map((src, idx) => (
      <div key={`vid-${idx}`} className="relative group rounded overflow-hidden">
        <video
          controls
          className="w-full rounded-xl max-h-[420px] border border-gray-700 shadow-md hover:scale-105 transition-transform"
        >
          <source src={src} />
        </video>
        <button
          type="button"
          onClick={() => {
            setPostVideos((prev) => prev.filter((_, i) => i !== idx));
            setPostVideosPreview((prev) => prev.filter((_, i) => i !== idx));
          }}
          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:scale-110 transition"
        >
          <X size={16} />
        </button>
      </div>
    ))}
  </div>
)}

    </div>
  )}
</div>


              {/* Event Creation */}
           <div
  className="bg-black/40 backdrop-blur-lg p-4 rounded-2xl border border-gray-700/50 shadow-lg shadow-amber-500/20 hover:shadow-amber-400/70 hover:border-amber-500/70 hover:scale-[1.02] transition-all duration-300 space-y-3"
>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <input type="text" placeholder="Title" className="w-full bg-gray-800/70 p-2 rounded-xl border border-gray-700 text-sm focus:ring-amber-500 outline-none transition" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} />
    <input type="text" placeholder="Location" className="w-full bg-gray-800/70 p-2 rounded-xl border border-gray-700 text-sm focus:ring-amber-500 outline-none transition" value={newEventLocation} onChange={(e) => setNewEventLocation(e.target.value)} />
    <input type="datetime-local" className="w-full bg-gray-800/70 p-2 rounded-xl border border-gray-700 text-sm focus:ring-amber-500 outline-none transition" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} />
  </div>
  <textarea placeholder="Description" className="w-full bg-gray-800/70 p-2 rounded-xl border border-gray-700 text-sm resize-none transition" rows={2} value={newEventDescription} onChange={(e) => setNewEventDescription(e.target.value)} />
  <button
    onClick={handleCreateEvent}
    className="w-full px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-semibold hover:scale-105 transition-all shadow-lg shadow-amber-500/40 hover:shadow-amber-400/70"
  >
    Create Event
  </button>
</div>

          </section>
        )}

        {/* Feed */}
        <section className="space-y-5 mt-8">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              currentUserId={Number(currentUserId)}
              onUpdate={(updated) => setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))}
              onDelete={handleDeleteEvent}
            />
          ))}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId || ""}
              onUpdate={(updatedPost) => setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)))}
              onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

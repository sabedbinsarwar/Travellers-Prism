"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "../../../utils/axiosInstance";
import { Camera, Image, Video, Calendar } from "lucide-react";

export default function ProfilePage() {
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Profile & Cover
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [newProfilePicPreview, setNewProfilePicPreview] = useState<string | null>(null);
  const [newCoverPic, setNewCoverPic] = useState<File | null>(null);
  const [newCoverPicPreview, setNewCoverPicPreview] = useState<string | null>(null);

  const [newBio, setNewBio] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // Posts & Events
  const [newPost, setNewPost] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [postVideo, setPostVideo] = useState<File | null>(null);
  const [postVideoPreview, setPostVideoPreview] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState("");

  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!userId || isNaN(Number(userId))) {
      setError("Invalid user ID.");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        setUser(res.data);
        setNewBio(res.data.bio || "");
        setNewLocation(res.data.location || "");

        const postsRes = await api.get(`/posts?userId=${userId}`);
        setPosts(postsRes.data);

        const eventsRes = await api.get(`/events?userId=${userId}`);
        setEvents(eventsRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "User not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

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

  // Save Profile
  const handleSaveProfile = async () => {
    const formData = new FormData();
    if (newProfilePic) formData.append("profilePic", newProfilePic);
    if (newCoverPic) formData.append("coverPic", newCoverPic);
    if (newBio) formData.append("bio", newBio);
    if (newLocation) formData.append("location", newLocation);

    const res = await api.put(`/users/${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser(res.data);
    setNewProfilePic(null);
    setNewProfilePicPreview(null);
    setNewCoverPic(null);
    setNewCoverPicPreview(null);
    setEditMode(false);
  };

  // Create Post
  const handleCreatePost = async () => {
    if (!newPost.trim() && !postImage && !postVideo) return;

    const formData = new FormData();
    formData.append("content", newPost);
    if (postImage) formData.append("image", postImage);
    if (postVideo) formData.append("video", postVideo);
    formData.append("userId", userId);

    const res = await api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setPosts([res.data, ...posts]);
    setNewPost("");
    setPostImage(null);
    setPostImagePreview(null);
    setPostVideo(null);
    setPostVideoPreview(null);
  };

  // Create Event
  const handleCreateEvent = async () => {
    if (!newEvent.trim()) return;
    const res = await api.post("/events", { title: newEvent, userId });
    setEvents([res.data, ...events]);
    setNewEvent("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Cover Photo */}
      <div className="relative w-full h-64 bg-gray-700">
        <img
          src={newCoverPicPreview || user.coverPic || "/default-cover.jpg"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {editMode && (
          <label className="absolute top-50 right-4 bg-gray-800 px-3 py-1 rounded cursor-pointer flex items-center">
            <Camera size={16} className="mr-1" /> Change Cover
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

        {/* Profile Pic */}
        <div className="absolute -bottom-16 left-6 w-32 h-32 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-500 cursor-pointer">
          <img
            src={newProfilePicPreview || user.profilePic || "/default-profile.png"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
          {editMode && (
            <label className="absolute bottom-0 right-0 bg-gray-800 px-2 py-1 rounded cursor-pointer flex items-center">
              <Camera size={14} className="mr-1" />
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

        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="absolute top-50 right-4 bg-purple-500 px-3 py-1 rounded hover:bg-purple-600 font-semibold"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="mt-20 px-6 max-w-4xl mx-auto space-y-4">
        {editMode && (
          <div className="bg-gray-800 p-4 rounded-xl space-y-3">
            <input
              type="text"
              placeholder="Bio"
              className="w-full bg-gray-700 p-2 rounded"
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
            />
            <input
              type="text"
              placeholder="Location"
              className="w-full bg-gray-700 p-2 rounded"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
            <button
              onClick={handleSaveProfile}
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 font-semibold"
            >
              Save
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p>{user.email}</p>
            {user.bio && <p>Bio: {user.bio}</p>}
            {user.location && <p>Location: {user.location}</p>}
          </div>
        </div>

        {/* Create Post / Event */}
        <section className="bg-gray-800 p-4 rounded-xl shadow-md space-y-3">
          <textarea
            className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={2}
          />

          {/* Post attachments */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center px-3 py-2 bg-gray-700 rounded-xl hover:bg-gray-600 cursor-pointer transition text-sm">
              <Image size={16} className="mr-1" /> Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPostImage(file);
                  if (file) setPostImagePreview(URL.createObjectURL(file));
                }}
              />
            </label>

            <label className="flex items-center px-3 py-2 bg-gray-700 rounded-xl hover:bg-gray-600 cursor-pointer transition text-sm">
              <Video size={16} className="mr-1" /> Video
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPostVideo(file);
                  if (file) setPostVideoPreview(URL.createObjectURL(file));
                }}
              />
            </label>

            <button
              onClick={handleCreatePost}
              className="ml-auto px-4 py-2 bg-green-500 rounded-xl hover:bg-green-600 transition font-semibold text-sm"
            >
              Post
            </button>
          </div>

          {/* Preview */}
          {(postImagePreview || postVideoPreview) && (
            <div className="mt-2 space-y-2">
              {postImagePreview && (
                <img src={postImagePreview} className="w-full rounded" />
              )}
              {postVideoPreview && (
                <video controls className="w-full rounded">
                  <source src={postVideoPreview} />
                </video>
              )}
            </div>
          )}

          {/* Create Event Inline Bar */}
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
        <section className="space-y-4 mt-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-gray-700 p-3 rounded-xl">
              <p>{post.content}</p>
              {post.image && (
                <img src={post.image} className="w-full rounded mt-2" />
              )}
              {post.video && (
                <video controls className="w-full rounded mt-2">
                  <source src={post.video} />
                </video>
              )}
            </div>
          ))}
        </section>

        {/* Events Feed */}
        <section className="space-y-4 mt-6">
          {events.map((event) => (
            <div key={event.id} className="bg-gray-700 p-3 rounded-xl">
              <p>{event.title}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
